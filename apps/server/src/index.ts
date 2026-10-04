import { database } from "./database/index.js";
import { createHttpApp } from "./http/app.js";
import { createSocketServer } from "./socket/index.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";

async function startServer() {
  const app = await createHttpApp();

  await database.$connect();

  console.log("Подключение к PostgreSQL установлено");

  // Healthcheck для мониторинга и Nginx/PM2
  app.get("/health", async () => ({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  createSocketServer(app.server);

  await app.listen({ port: PORT, host: HOST });

  console.log(`SOUL server запущен на http://${HOST}:${PORT}`);
}

async function shutdown(signal: string) {
  console.log(`Получен ${signal}, останавливаем сервер...`);

  try {
    await database.$disconnect();
  } catch (error) {
    console.error("Ошибка при отключении от БД:", error);
  }

  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

startServer().catch((error) => {
  console.error("Не удалось запустить сервер:", error);
  process.exit(1);
});
