/* Подключение к Supabase. Заполните два значения (Project Settings -> API).
   Anon key публичный по замыслу Supabase, доступ защищён политиками RLS из supabase_base.sql.
   Пока поля пустые, магазин работает в локальном режиме (данные в браузере). */
window.SB_CFG = {
  url: '',   // например: https://xxxxxxxx.supabase.co
  key: ''    // anon public key
};
