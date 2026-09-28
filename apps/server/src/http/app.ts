import Fastify from "fastify";

import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import { roomRoutes } from "./routes/rooms.js";

export async function createHttpApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });

  await app.register(cookie);

  await app.register(authRoutes, {
    prefix: "/api/auth",
  });

  await app.register(profileRoutes, {
    prefix: "/api/profile",
  });

  await app.register(roomRoutes, {
    prefix: "/api/rooms",
  });

  return app;
}
