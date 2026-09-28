import Fastify from "fastify";

import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import cardsRoutes from "./routes/cards.js";
import gamesRoutes from "./routes/games.js";
import newsRoutes from "./routes/news.js";
import profileRoutes from "./routes/profile.js";
import { roomRoutes } from "./routes/rooms.js";

import oauthRoutes from "../auth/oauth/oauthRoutes.js";

export async function createHttpApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });

  await app.register(cookie);

  await app.register(authRoutes, {
    prefix: "/api/auth",
  });

  await app.register(oauthRoutes, {
    prefix: "/api/auth/oauth",
  });

  await app.register(cardsRoutes, {
    prefix: "/api/cards",
  });

  await app.register(gamesRoutes, {
    prefix: "/api/games",
  });

  await app.register(newsRoutes, {
    prefix: "/api/news",
  });

  await app.register(profileRoutes, {
    prefix: "/api/profile",
  });

  await app.register(roomRoutes, {
    prefix: "/api/rooms",
  });

  await app.register(adminRoutes, {
    prefix: "/api/admin",
  });

  return app;
}
