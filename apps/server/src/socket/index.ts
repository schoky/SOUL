import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { SOCKET_EVENTS } from "@soul/shared";

import { getCurrentUserByToken } from "../auth/authService.js";

import { gameManager } from "../game/gameManager.js";

import { connectionTracker } from "./connectionTracker.js";
import { handlePlayerDisconnect } from "./disconnectHandler.js";
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

    connectionTracker.addSocket(userId, socket.id);

    // Если игрок был отключён и вернулся —
    // отменяем автопас.
    connectionTracker.cancelAutoPass(userId);

    console.log(`Socket подключён: ${socket.id} (user: ${userId})`);

    // Сообщаем всем в его комнате, что он вернулся.
    const currentRoomId = connectionTracker.getRoom(userId);

    if (currentRoomId) {
      io.to(`room:${currentRoomId}`).emit(SOCKET_EVENTS.PLAYER_CONNECTION, {
        playerId: userId,
        connected: true,
      });
    }

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

        connectionTracker.setRoom(userId, roomId);

        try {
          const game = await gameManager.resolve(roomId);

          if (game) {
            socket.emit(SOCKET_EVENTS.GAME_STATE, {
              gameState: game,
              characters: game.characters,
            });
          }

          socket.emit(SOCKET_EVENTS.PLAYERS_CONNECTION, {
            connections: connectionTracker.getConnectionMap(roomId),
          });
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
      console.log(`Socket отключён: ${socket.id} (user: ${userId})`);

      const wasLast = connectionTracker.removeSocket(userId, socket.id);

      if (!wasLast) {
        // У игрока остались другие вкладки.
        return;
      }

      const roomId = connectionTracker.getRoom(userId);

      if (!roomId) {
        return;
      }

      io.to(`room:${roomId}`).emit(SOCKET_EVENTS.PLAYER_CONNECTION, {
        playerId: userId,
        connected: false,
      });

      void handlePlayerDisconnect(roomId, userId);
    });
  });

  setIO(io);

  return io;
}
