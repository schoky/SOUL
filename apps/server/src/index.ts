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
    host: "localhost",
  });

  console.log("SOUL server запущен на http://localhost:3000");
}

startServer().catch((error) => {
  console.error("Не удалось запустить сервер:", error);

  process.exit(1);
});
