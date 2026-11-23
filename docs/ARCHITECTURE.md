# Архитектура

## Принципы
- Без сборщика: обычные `<script>` по порядку, общие переменные в глобальной области (как было в исходном `index.html`).
- Код разнесён по файлам дословно, логика не менялась.
- Данные пока в `localStorage`; база Supabase подготовлена отдельным файлом `supabase_base.sql` (см. «Подключение базы»).

## Дерево
```
index.html              разметка и подключение файлов
assets/
  css/styles.css        основные стили магазина (исходные)
  css/brand.css         стили логотипа ProductFlow AI
  img/logo/             productflow-* (платформа) и street-style-logo.jpg (магазин)
  js/                   скрипты, порядок подключения важен
    config.js           ключи Supabase (url, anon key)
    data.js             демо-товары, категории, формы силуэтов
    core.js             состояние `st`, утилиты, иконки
    api.js              слой Supabase: вход, каталог, товары, настройки, аналитика, фото
    views.js            отрисовка витрины: art/card/list/render
    checkout.js         форма заказа и переход в WhatsApp
    events.js           обработчики кликов/ввода витрины
    admin.js            админ-панель (вход, товары, аналитика, настройки); оборачивает go/render/window.open
    main.js             инициализация Telegram WebApp и первый render()
docs/ARCHITECTURE.md    этот файл
.cursor/rules/          правила для Cursor
```

## Порядок подключения (менять нельзя)
config -> data -> core -> api -> views -> checkout -> events -> admin -> main

`admin.js` переопределяет `go` и `render`, а `main.js` вызывает `render()` последним.

## Подключение Supabase
1. Выполнить `supabase_base.sql` в SQL Editor.
2. Authentication -> Users -> Add user (email и пароль админа), затем выполнить `insert into public.admin_users (user_id) select id from auth.users where email = 'ваш@email';`
3. Вписать `url` и `key` (anon public) в `assets/js/config.js`.
4. Готово: покупатели читают каталог из базы, админ входит по email и паролю.

Пока `config.js` пустой, магазин работает в локальном режиме (данные в браузере, пароль-хэш `AH` в `admin.js`). При заполненном `config.js` локальный пароль отключается.

## Соответствие данных и таблиц
| В приложении | Таблица Supabase |
|---|---|
| `CATS` | `categories` |
| `P[]` | `products` + `product_sizes` + `product_images` |
| `cfg`, `st.wa` | `store_settings` |
| `EV[]` (visit/view/wa) | `analytics_events` |
| `AH` (хэш пароля) | `admin_users` + Supabase Auth (при включённом Supabase) |
| фото товаров (dataURL) | Storage `product-images` |

## Брендинг
ProductFlow AI (основной): шапка (знак), подвал (полный логотип), favicon, иконка iOS.
STREET STYLE: главный экран, форма заказа, вход и шапка админ-панели, экран «Загрузка» и «Магазин на обслуживании» (функция `slogo()` в `core.js`).
