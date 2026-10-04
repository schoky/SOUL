import Fastify from "fastify";

import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import cardsRoutes from "./routes/cards.js";
import gamesRoutes from "./routes/games.js";
import newsRoutes from "./routes/news.js";
import profileRoutes from "./routes/profile.js";
import { roomRoutes } from "./routes/rooms.js";
import historyRoutes from "./routes/history.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import friendsRoutes from "./routes/friends.js";
import invitationsRoutes from "./routes/invitations.js";
import notificationsRoutes from "./routes/notifications.js";

import oauthRoutes from "../auth/oauth/oauthRoutes.js";

export async function createHttpApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  await app.register(cors, {
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(cookie);

  await app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (_request, context) => ({
      error: {
        code: "RATE_LIMIT",
        message: `Слишком много запросов. Подожди ${Math.ceil(
          context.ttl / 1000,
        )} сек.`,
      },
    }),
  });

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

  await app.register(historyRoutes, {
    prefix: "/api/users",
  });

  await app.register(leaderboardRoutes, {
    prefix: "/api/leaderboard",
  });

  await app.register(friendsRoutes, {
    prefix: "/api/friends",
  });

  await app.register(invitationsRoutes, {
    prefix: "/api/invitations",
  });

  await app.register(notificationsRoutes, {
    prefix: "/api/notifications",
  });

  await app.register(adminRoutes, {
    prefix: "/api/admin",
  });

  return app;
}
