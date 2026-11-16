import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

import { PrismaClient } from './generated/prisma/client.js';

dotenv.config({
  path: '../../.env'
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString
});

export const database = new PrismaClient({
  adapter
});
