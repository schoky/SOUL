#!/usr/bin/env bash
set -e

cd /var/www/soul

echo "==> git pull"
git pull

echo "==> pnpm install"
pnpm install --frozen-lockfile

echo "==> prisma migrate deploy"
pnpm --filter @soul/database db:migrate:deploy

echo "==> prisma generate"
pnpm --filter @soul/database db:generate

echo "==> build client"
pnpm --filter @soul/client build

echo "==> build server"
pnpm --filter @soul/server build

echo "==> restart PM2"
pm2 restart soul-server

echo "==> Деплой завершён"