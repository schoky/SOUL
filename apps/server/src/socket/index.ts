import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { SOCKET_EVENTS } from "@soul/shared";

import { getCurrentUserByToken } from "../auth/authService.js";

import { socketLogs } from "../admin/socketLogs.js";

import { gameManager } from "../game/gameManager.js";

import { connectionTracker } from "./connectionTracker.js";
import { handlePlayerDisconnect } from "./disconnectHandler.js";
import { registerGameHandlers } from "./gameHandlers.js";
import { setIO } from "./io.js";

const SESSION_COOKIE = "soul_session";

const CLIENT_ORIGIN = process.env.CLIENT_URL ?? "http://localhost:5173";

const LOBBY_CHANNEL = "lobby";

const ADMIN_CHANNEL = "admin";

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
        socketLogs.add({
          type: "auth:failed",
          socketId: socket.id,
          message: "Нет токена сессии",
        });

        return next(new Error("Not authenticated"));
      }

      const user = await getCurrentUserByToken(token);

      if (!user) {
        socketLogs.add({
          type: "auth:failed",
          socketId: socket.id,
          message: "Невалидный токен сессии",
        });

        return next(new Error("Not authenticated"));
      }

      socket.data.userId = user.id;
      socket.data.userRole = user.role;

      next();
    } catch (error) {
      socketLogs.add({
        type: "auth:failed",
        socketId: socket.id,
        message: error instanceof Error ? error.message : "Ошибка авторизации",
      });

      next(error instanceof Error ? error : new Error("Auth failed"));
    }
  });

  // Один слушатель на все новые логи — рассылаем
  // их всем админам, кто подписан на канал.
  socketLogs.on("log", (log) => {
    io.to(ADMIN_CHANNEL).emit(SOCKET_EVENTS.ADMIN_LOG_ADDED, log);
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    const userRole = socket.data.userRole as string | undefined;

    connectionTracker.addSocket(userId, socket.id);

    // Подписываем сокет на личный канал пользователя.
    // Сюда летят события друзей и приглашений в игру.
    void socket.join(`user:${userId}`);

    // Если игрок был отключён и вернулся —
    // отменяем автопас.
    connectionTracker.cancelAutoPass(userId);

    socketLogs.add({
      type: "socket:connected",
      userId,
      socketId: socket.id,
      message: `Socket подключён: ${socket.id} (user: ${userId})`,
    });

    // Админ автоматически подписывается на канал админки.
    if (userRole === "ADMIN") {
      void socket.join(ADMIN_CHANNEL);
    }

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
      socketLogs.add({
        type: "socket:disconnected",
        userId,
        socketId: socket.id,
        roomId: connectionTracker.getRoom(userId),
        message: `Socket отключён: ${socket.id} (user: ${userId})`,
      });

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
