# STREET STYLE — Telegram Mini App магазин

Статичный Mini App без сборки: открывается как обычный сайт (`index.html`), подходит для хостинга на GitHub Pages / Netlify / Vercel.
Платформа и основной логотип: **ProductFlow AI**.

## Запуск локально
```
npx serve .
```
Откройте адрес в браузере. В Telegram подключается через BotFather -> Menu Button / Web App URL.

## Структура
Подробно: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Supabase
Выполните `supabase_base.sql`, создайте админа и впишите ключи в `assets/js/config.js` (шаги в docs/ARCHITECTURE.md).
