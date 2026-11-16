import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const rootDir = path.resolve(__dirname, '../..');

const envProduction = path.join(rootDir, '.env.production');
const envDevelopment = path.join(rootDir, '.env');

// Приоритет: .env.production, если есть, иначе .env
// Если файлов нет — переменные придут из окружения (PM2)
if (fs.existsSync(envProduction)) {
  dotenv.config({ path: envProduction, override: true });
} else if (fs.existsSync(envDevelopment)) {
  dotenv.config({ path: envDevelopment, override: true });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: env('DATABASE_URL')
  }
});
