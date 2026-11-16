# SOUL

> Браузерная мультиплеерная карточная игра в тёмном неоновом стиле.

[![pnpm](https://img.shields.io/badge/pnpm-12.x-orange?logo=pnpm)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.x-61dafb?logo=react)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5.12.x-000000?logo=fastify)](https://fastify.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.x-010101?logo=socket.io)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10.x-2D3748?logo=prisma)](https://www.prisma.io/)

---

## ✨ Возможности

- **Онлайн-лобби и комнаты** до 4 игроков.
- **Пошаговые матчи в реальном времени** через Socket.IO.
- **Персонажи** с характеристиками: Фармила, Перекуп, Туллер.
- **События** с требованиями, наградой и риском.
- **Финальный раунд**: кто наберёт больше Soul — побеждает.
- **Профиль игрока**: статистика, история матчей, редактирование.
- **Таблица лидеров**: победы, матчи, суммарный и лучший Soul.
- **Админ-панель**: пользователи, карточки, события, комнаты, игры, новости.
- **OAuth** (Google, Discord, Twitch) — опционально.
- **Публичные страницы**: правила, новости, политика конфиденциальности,
  пользовательское соглашение.

---

## Стек

| Слой                | Технологии                                           |
|---------------------|------------------------------------------------------|
| **Frontend**        | React, Vite, TypeScript, Zustand, React Router, SCSS |
| **Backend**         | Node.js, Fastify, Socket.IO, Prisma, PostgreSQL      |
| **Монорепозиторий** | pnpm workspaces                                      |
| **Общие типы**      | `packages/shared`                                    |
| **Игровая логика**  | `packages/game-engine`                               |
| **БД и миграции**   | `packages/database` (Prisma)                         |

---

## Структура проекта

```
soul/
├── apps/
│   ├── client/          # React-клиент
│   └── server/          # Fastify + Socket.IO
├── packages/
│   ├── shared/          # общие типы и контракты
│   ├── game-engine/     # правила игры
│   └── database/        # Prisma + миграции
├── pnpm-workspace.yaml
└── package.json
```

---

## Быстрый старт

### Требования

- Node.js 20+
- pnpm 12+
- PostgreSQL 18+

### Установка

```bash
git clone https://github.com/schoky/SOUL.git
cd soul
pnpm install
```

### Переменные окружения

Создайте `.env` в корне проекта:

```ini
NODE_ENV=development
PORT=3000
HOST=127.0.0.1

POSTGRES_DB=soul
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@127.0.0.1:5432/soul?schema=public

VITE_API_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
OAUTH_REDIRECT_BASE=http://localhost:3000

SESSION_SECRET=change-me
JWT_SECRET=change-me
COOKIE_SECRET=change-me
```

### Миграции

```bash
pnpm --filter @soul/database db:migrate
```

### Запуск

В отдельных терминалах:

```bash
pnpm --filter @soul/server dev
pnpm --filter @soul/client dev
```

Клиент: http://localhost:5173  
Сервер: http://localhost:3000

---

## 🛠 Скрипты

| Команда                                   | Описание                  |
|-------------------------------------------|---------------------------|
| `pnpm --filter @soul/client dev`          | Запуск клиента            |
| `pnpm --filter @soul/server dev`          | Запуск сервера            |
| `pnpm --filter @soul/client build`        | Сборка клиента            |
| `pnpm --filter @soul/server build`        | Сборка сервера            |
| `pnpm --filter @soul/shared typecheck`    | Проверка типов `shared`   |
| `pnpm --filter @soul/server typecheck`    | Проверка типов сервера    |
| `pnpm --filter @soul/client typecheck`    | Проверка типов клиента    |
| `pnpm --filter @soul/database db:migrate` | Миграции Prisma           |
| `pnpm --filter @soul/database db:seed`    | Загрузка начальных данных |                         |

---

## Архитектура

```
[ React Client ] --HTTP/REST--> [ Fastify Server ] --Prisma--> [ PostgreSQL ]
        |                               |
        |------ WebSocket (Socket.IO) --|
                                        |
                                [ game-engine ]
```

- **shared** — DTO, события Socket.IO, константы.
- **game-engine** — чистые функции: создание игры, ход, проверка требований,
  риск, финальный раунд.
- **server** — Fastify-роуты, Socket.IO-хендлеры, репозитории, сохранение
  результатов.
- **client** — страницы, сторы, API-клиенты, UI-компоненты.

---

## Деплой

Рекомендуемая схема:

- **VPS** в Selectel (Ubuntu 22.04).
- **Nginx** — раздача статики клиента и reverse proxy для `/api` и `/socket.io`.
- **PM2** или **Docker** — для запуска Node.js-сервера.
- **Managed PostgreSQL** в Selectel.
- **SSL** — Let's Encrypt (Certbot).

Сборка:

```bash
pnpm install
pnpm --filter @soul/database db:migrate:deploy
pnpm --filter @soul/database db:generate
pnpm --filter @soul/client build
pnpm --filter @soul/server build
```

Пошаговая инструкция — в [`docs/Deploy.md`](./docs/Deploy.md).

---

## 📸 Скриншоты

### Лобби

![Лобби](docs/screenshots/lobby.png)

### Игровой стол — общий вид

![Игровой стол, вид 1](docs/screenshots/game-1.png)

### Игровой стол — выбор персонажей

![Игровой стол, вид 2](docs/screenshots/game-2.png)

### Библиотека карточек — персонажи

![Библиотека карточек, персонажи](docs/screenshots/cards.png)

### Библиотека карточек — события

![Библиотека карточек, события](docs/screenshots/cards-2.png)

### Профиль

![Профиль](docs/screenshots/profile.png)

### Таблица лидеров

![Таблица лидеров](docs/screenshots/leaderboard.png)
