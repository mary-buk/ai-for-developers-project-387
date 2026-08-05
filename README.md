### Hexlet tests and linter status:
[![Actions Status](https://github.com/mary-buk/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/mary-buk/ai-for-developers-project-386/actions)

# Календарь бронирования

Учебный проект: владелец календаря создаёт типы событий, гости бронируют свободные слоты без регистрации. Сетка слотов — 30 минут, рабочее окно 09:00–18:00, запись на 14 дней вперёд.

## Структура

- `tsp/` — TypeSpec-контракт API
- `backend/` — Node.js 20 + Express + TypeScript, хранение в памяти
- `frontend/` — React 18 + Vite + TypeScript
- `e2e/` — Playwright-тесты

## Локальный запуск

```bash
# backend (порт 3000)
cd backend && npm install && npm run dev

# frontend (порт 5173, проксирует API на 3000)
cd frontend && npm install && npm run dev
```

## Docker

Один образ: Express отдаёт API и собранный фронтенд.

```bash
docker build -t calendar-booking .
docker run -p 3000:3000 calendar-booking
# открыть http://localhost:3000
```

Порт задаётся переменной окружения `PORT` (по умолчанию 3000).

## Деплой

Приложение развёрнуто на Render: https://calendar-booking-camd.onrender.com
