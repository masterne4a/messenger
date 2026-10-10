# GreenAPI Messenger

Минимальный веб-мессенджер для отправки и приёма сообщений WhatsApp через [GreenAPI](https://green-api.com/).

## Возможности

- Вход по `idInstance` и `apiTokenInstance` (сохраняются в `localStorage`).
- Добавление чата по номеру телефона (проверка через `checkAccount`).
- Отправка текстовых сообщений.
- Приём входящих сообщений через опрос `receiveNotification` + `deleteNotification`.

## Стек

React 19, TypeScript, Vite. Стили — CSS-модули, состояние — `localStorage` + React-хуки, без внешних стейт-менеджеров.

## Запуск

```bash
npm install
npm run dev
```

Адрес API задаётся через `VITE_API_URL`

## Скрипты

- `npm run dev` — dev-сервер
- `npm run build` — сборка (`tsc -b && vite build`)
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run preview` — предпросмотр сборки
