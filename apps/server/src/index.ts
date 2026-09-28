import { database } from "./database/index.js";
import { createHttpApp } from "./http/app.js";
import { createSocketServer } from "./socket/index.js";

async function startServer() {
  const app = await createHttpApp();

  await database.$connect();

  console.log("Подключение к PostgreSQL установлено");

  createSocketServer(app.server);

  await app.listen({
    port: 3000,
    host: "127.0.0.1",
  });

  console.log("SOUL server запущен на http://127.0.0.1:3000");
}

startServer().catch((error) => {
  console.error("Не удалось запустить сервер:", error);

  process.exit(1);
});
