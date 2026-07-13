# KassaPay

Веб-приложение KassaPay: регистрация, оплата тарифа, дашборд, онбординг и справочники.

## Стек

- Next.js (App Router)
- React 19
- Tailwind CSS + shadcn/ui
- Zustand (persist)

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Сборка

```bash
# обычная static export
npm run build

# сборка под GitHub Pages (basePath /kassapay-l)
GITHUB_PAGES=true npm run build
```

Статика попадает в папку `out/`.

## GitHub Pages

Сайт: **https://pharrabei.github.io/kassapay-l/**

Деплой идёт через GitHub Actions (`.github/workflows/deploy-pages.yml`) при push в `main`.

## Основные разделы

- `/` — вход / регистрация
- `/dashboard` — обзор и онбординг
- `/dashboard/directories/*` — справочники (CRUD)
