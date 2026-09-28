import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { characters } from "@soul/game-engine";

import { SOCKET_EVENTS } from "@soul/shared";

import { getCurrentUserByToken } from "../auth/authService.js";

import { gameManager } from "../game/gameManager.js";

import { registerGameHandlers } from "./gameHandlers.js";
import { setIO } from "./io.js";

const SESSION_COOKIE = "soul_session";

const CLIENT_ORIGIN = process.env.CLIENT_URL ?? "http://localhost:5173";

const LOBBY_CHANNEL = "lobby";

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const pair of header.split(";")) {
    const trimmed = pair.trim();

    if (!trimmed) {
      continue;
    }

    const eq = trimmed.indexOf("=");

    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq);

    const value = trimmed.slice(eq + 1);

    if (!key) {
      continue;
    }

    result[key] = decodeURIComponent(value);
  }

  return result;
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);

      const token = cookies[SESSION_COOKIE];

      if (!token) {
        return next(new Error("Not authenticated"));
      }

      const user = await getCurrentUserByToken(token);

      if (!user) {
        return next(new Error("Not authenticated"));
      }

      socket.data.userId = user.id;

      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    console.log(`Socket подключён: ${socket.id} (user: ${userId})`);

    socket.on(SOCKET_EVENTS.LOBBY_SUBSCRIBE, () => {
      void socket.join(LOBBY_CHANNEL);
    });

    socket.on(SOCKET_EVENTS.LOBBY_UNSUBSCRIBE, () => {
      void socket.leave(LOBBY_CHANNEL);
    });

    socket.on(
      SOCKET_EVENTS.ROOM_SUBSCRIBE,
      async (payload: { roomId?: string }) => {
        if (!payload?.roomId) {
          return;
        }

        const roomId = payload.roomId;

        void socket.join(`room:${roomId}`);

        try {
          const game = await gameManager.resolve(roomId);

          if (game) {
            socket.emit(SOCKET_EVENTS.GAME_STATE, {
              gameState: game,
              characters,
            });
          }
        } catch (error) {
          console.error("Не удалось загрузить состояние игры:", error);
        }
      },
    );

    socket.on(
      SOCKET_EVENTS.ROOM_UNSUBSCRIBE,
      (payload: { roomId?: string }) => {
        if (!payload?.roomId) {
          return;
        }

        void socket.leave(`room:${payload.roomId}`);
      },
    );

    registerGameHandlers(socket);

    socket.on("disconnect", () => {
      console.log(`Socket отключён: ${socket.id}`);
    });
  });

  setIO(io);

  return io;
}
