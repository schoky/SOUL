import { defineConfig, oxfmt } from '@schoky/oxfmt';

export default defineConfig({
  ...oxfmt,
  ignorePatterns: [
    'node_modules',
    '.gitignore',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    '.vite',
    '.git',
    'dist',
    '*.prisma',
    '**/*.prisma',
    'packages/database/src/generated/**',
    'packages/database/prisma/migrations/**'
  ]
});
