-- =====================================================================
-- ProductFlow AI / STREET STYLE — базовая схема Supabase
-- Выполнить целиком в Supabase: SQL Editor -> New query -> Run
-- Повторный запуск безопасен (idempotent).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Служебное ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------- Администраторы -------------------------------------------
-- Админ = пользователь Supabase Auth, добавленный в эту таблицу.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------- Настройки магазина (одна строка) -------------------------
create table if not exists public.store_settings (
  id          smallint primary key default 1 check (id = 1),
  name        text    not null default 'STREET STYLE',
  whatsapp    text    not null default '',   -- с кодом страны, без плюса
  delivery    text    not null default '',
  contacts    text    not null default '',
  maintenance boolean not null default false,
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_store_settings_updated on public.store_settings;
create trigger trg_store_settings_updated before update on public.store_settings
  for each row execute function public.set_updated_at();

-- ---------- Категории ------------------------------------------------
create table if not exists public.categories (
  slug       text primary key,               -- jeans, shoes, tees ...
  title      text not null,
  sort_order int  not null default 0
);

-- ---------- Товары ---------------------------------------------------
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  sku         text    not null unique,
  name        text    not null,
  category    text    not null references public.categories(slug) on update cascade,
  price       integer not null check (price > 0),   -- в тенге
  color       text    not null default '',
  color_hex   text    not null default '#4a4a4a',
  description text    not null default '',
  is_new      boolean not null default false,
  is_popular  boolean not null default false,
  is_hidden   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_visible_idx  on public.products (is_hidden);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Размеры и остатки ----------------------------------------
create table if not exists public.product_sizes (
  product_id bigint not null references public.products(id) on delete cascade,
  size       text   not null,                -- S, M, L, XL, 40..44, ONE
  stock      integer not null default 0 check (stock >= 0),
  sort_order int not null default 0,
  primary key (product_id, size)
);

-- ---------- Фото товаров ---------------------------------------------
create table if not exists public.product_images (
  id         bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  url        text   not null,                -- публичный URL из Storage
  position   int    not null default 0
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

-- ---------- Аналитика ------------------------------------------------
-- kind: visit (посещение), view (просмотр товара), wa (переход в WhatsApp)
create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  kind        text   not null check (kind in ('visit','view','wa')),
  product_id  bigint references public.products(id) on delete set null,
  visitor_id  text   not null,
  tg_user_id  bigint,
  created_at  timestamptz not null default now()
);
create index if not exists analytics_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_kind_idx    on public.analytics_events (kind, created_at desc);

-- Сводка по дням для дашборда (доступна только админу через функцию ниже)
create or replace function public.analytics_summary(p_from timestamptz default now() - interval '7 days')
returns table (
  visits        bigint,
  unique_visits bigint,
  product_views bigint,
  wa_clicks     bigint
)
language sql stable security definer
set search_path = public
as $$
  select
    count(*) filter (where kind = 'visit'),
    count(distinct visitor_id) filter (where kind = 'visit'),
    count(*) filter (where kind = 'view'),
    count(*) filter (where kind = 'wa')
  from public.analytics_events
  where public.is_admin() and created_at >= p_from;
$$;

-- ---------- Безопасность (RLS) ---------------------------------------
alter table public.admin_users      enable row level security;
alter table public.store_settings   enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_sizes    enable row level security;
alter table public.product_images   enable row level security;
alter table public.analytics_events enable row level security;

-- admin_users: видит только админ, правит только через SQL Editor
drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated using (public.is_admin());

-- store_settings: читают все, меняет админ
drop policy if exists settings_read  on public.store_settings;
drop policy if exists settings_write on public.store_settings;
create policy settings_read  on public.store_settings for select to anon, authenticated using (true);
create policy settings_write on public.store_settings for all    to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- categories: читают все, меняет админ
drop policy if exists categories_read  on public.categories;
drop policy if exists categories_write on public.categories;
create policy categories_read  on public.categories for select to anon, authenticated using (true);
create policy categories_write on public.categories for all    to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- products: покупатели видят только не скрытые, админ видит и правит всё
drop policy if exists products_read  on public.products;
drop policy if exists products_write on public.products;
create policy products_read  on public.products for select to anon, authenticated
  using (is_hidden = false or public.is_admin());
create policy products_write on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- product_sizes / product_images: видны вместе с видимым товаром
drop policy if exists sizes_read  on public.product_sizes;
drop policy if exists sizes_write on public.product_sizes;
create policy sizes_read on public.product_sizes for select to anon, authenticated
  using (exists (select 1 from public.products p
                 where p.id = product_id and (p.is_hidden = false or public.is_admin())));
create policy sizes_write on public.product_sizes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists images_read  on public.product_images;
drop policy if exists images_write on public.product_images;
create policy images_read on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p
                 where p.id = product_id and (p.is_hidden = false or public.is_admin())));
create policy images_write on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- analytics_events: покупатели только добавляют, читает админ
drop policy if exists events_insert on public.analytics_events;
drop policy if exists events_read   on public.analytics_events;
create policy events_insert on public.analytics_events for insert to anon, authenticated
  with check (kind in ('visit','view','wa') and length(visitor_id) between 1 and 64);
create policy events_read on public.analytics_events for select to authenticated
  using (public.is_admin());

-- ---------- Хранилище фото -------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists storage_images_read  on storage.objects;
drop policy if exists storage_images_write on storage.objects;
create policy storage_images_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy storage_images_write on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- ---------- Начальные данные (из текущего каталога) ------------------
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

insert into public.categories (slug, title, sort_order) values
  ('jeans','Джинсы',1), ('shoes','Обувь',2), ('tees','Футболки',3),
  ('hoodies','Худи',4), ('pants','Штаны',5), ('jackets','Куртки',6),
  ('acc','Аксессуары',7)
on conflict (slug) do nothing;

insert into public.products (sku, name, category, price, color, color_hex, description, is_new, is_popular) values
  ('SS-JN-001','Джинсы Baggy Black','jeans',24900,'Чёрный','#2b2b2b','Свободный крой, плотный деним 12 унций, заниженная посадка.',true,true),
  ('SS-HD-014','Худи Oversize Graphite','hoodies',21900,'Графит','#4a4a4a','Футер с начёсом, объёмный капюшон, прямой низ.',false,true),
  ('SS-TE-007','Футболка Heavy Tee','tees',9900,'Белый','#e8e8e8','Хлопок 240 г/м², удлинённый силуэт, плотный ворот.',true,false),
  ('SS-SH-021','Кроссовки Rail Low','shoes',38900,'Серый','#8a8a8a','Рельефная подошва, дышащая сетка, усиленный носок.',true,true),
  ('SS-PN-009','Штаны Cargo Wide','pants',19900,'Хаки','#6b6b4a','Широкие карго с боковыми карманами и утяжкой по низу.',false,false),
  ('SS-JK-003','Куртка Coach Jacket','jackets',32900,'Чёрный','#1c1c1c','Лёгкая куртка на кнопках, ветрозащитная ткань.',true,true),
  ('SS-AC-002','Кепка Five Panel','acc',6900,'Оранжевый','#FF6B1A','Пятипанельная кепка, регулируемый ремешок.',false,false),
  ('SS-HD-016','Худи Zip Black','hoodies',23900,'Чёрный','#202020','Молния на всю длину, плотный футер, манжеты с резинкой.',false,false)
on conflict (sku) do nothing;

insert into public.product_sizes (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord
from public.products p
join (values
  ('SS-JN-001','S',2,1),('SS-JN-001','M',5,2),('SS-JN-001','L',0,3),('SS-JN-001','XL',3,4),
  ('SS-HD-014','S',0,1),('SS-HD-014','M',4,2),('SS-HD-014','L',6,3),('SS-HD-014','XL',2,4),
  ('SS-TE-007','S',5,1),('SS-TE-007','M',8,2),('SS-TE-007','L',7,3),('SS-TE-007','XL',0,4),
  ('SS-SH-021','40',1,1),('SS-SH-021','41',3,2),('SS-SH-021','42',4,3),('SS-SH-021','43',0,4),('SS-SH-021','44',2,5),
  ('SS-PN-009','S',3,1),('SS-PN-009','M',0,2),('SS-PN-009','L',4,3),('SS-PN-009','XL',4,4),
  ('SS-JK-003','S',2,1),('SS-JK-003','M',2,2),('SS-JK-003','L',3,3),('SS-JK-003','XL',1,4),
  ('SS-AC-002','ONE',12,1),
  ('SS-HD-016','S',1,1),('SS-HD-016','M',3,2),('SS-HD-016','L',0,3),('SS-HD-016','XL',0,4)
) as s(sku, size, stock, ord) on s.sku = p.sku
on conflict (product_id, size) do nothing;

-- ---------- Как сделать себя администратором -------------------------
-- 1) Authentication -> Users -> Add user (email + пароль).
-- 2) Выполнить, подставив свой email:
--    insert into public.admin_users (user_id)
--    select id from auth.users where email = 'you@example.com'
--    on conflict do nothing;
