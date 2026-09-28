import type { FastifyInstance } from "fastify";

import { authenticateRequest } from "../authMiddleware.js";

import { roomService, RoomServiceError } from "../../rooms/roomService.js";

import {
  emitLobbyUpdated,
  emitRoomDeleted,
  emitRoomUpdated,
} from "../../socket/roomEvents.js";

type CreateRoomBody = {
  maxPlayers?: number;
};

export async function roomRoutes(app: FastifyInstance) {
  /**
   * Получить список комнат.
   */
  app.get(
    "/",
    {
      preHandler: authenticateRequest,
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      const rooms = await roomService.getWaitingRooms();

      return reply.send({
        rooms,
      });
    },
  );

  /**
   * Получить активную комнату текущего пользователя.
   */
  app.get(
    "/current",
    {
      preHandler: authenticateRequest,
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      const room = await roomService.getCurrentRoom(user.id);

      return reply.send({
        room,
      });
    },
  );
  /**
   * Публичное превью комнаты по ссылке-приглашению.
   */
  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/:id/preview",
    {
      preHandler: authenticateRequest,
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      const preview = await roomService.getRoomPreview(request.params.id);

      if (!preview) {
        return reply.code(404).send({
          error: {
            code: "ROOM_NOT_FOUND",
            message: "Комната не найдена",
          },
        });
      }

      return reply.send({
        room: preview,
      });
    },
  );
  /**
   * Получить конкретную комнату.
   */
  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      preHandler: authenticateRequest,
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      try {
        const room = await roomService.getRoom(request.params.id, user.id);

        return reply.send({
          room,
        });
      } catch (error) {
        if (error instanceof RoomServiceError) {
          return reply.code(400).send({
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: "Internal server error",
        });
      }
    },
  );

  /**
   * Создать новую комнату.
   */
  app.post<{
    Body: CreateRoomBody;
  }>(
    "/",
    {
      preHandler: authenticateRequest,
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      try {
        const room = await roomService.createRoom(
          user.id,
          request.body?.maxPlayers,
        );

        emitLobbyUpdated();

        return reply.code(201).send({
          room,
        });
      } catch (error) {
        if (error instanceof RoomServiceError) {
          return reply.code(400).send({
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: "Internal server error",
        });
      }
    },
  );

  /**
   * Присоединиться к комнате.
   */
  app.post<{
    Params: {
      id: string;
    };
  }>(
    "/:id/join",
    {
      preHandler: authenticateRequest,
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      try {
        const room = await roomService.joinRoom(request.params.id, user.id);

        emitRoomUpdated(room);
        emitLobbyUpdated();

        return reply.send({
          room,
        });
      } catch (error) {
        if (error instanceof RoomServiceError) {
          return reply.code(400).send({
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: "Internal server error",
        });
      }
    },
  );

  /**
   * Изменить готовность участника.
   */
  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      isReady: boolean;
    };
  }>(
    "/:id/ready",
    {
      preHandler: authenticateRequest,

      schema: {
        body: {
          type: "object",
          required: ["isReady"],
          additionalProperties: false,
          properties: {
            isReady: {
              type: "boolean",
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      try {
        const room = await roomService.setReady(
          request.params.id,
          user.id,
          request.body.isReady,
        );

        emitRoomUpdated(room);

        return reply.send({
          room,
        });
      } catch (error) {
        if (error instanceof RoomServiceError) {
          return reply.code(400).send({
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: "Internal server error",
        });
      }
    },
  );

  /**
   * Выйти из комнаты.
   */
  app.post<{
    Params: {
      id: string;
    };
  }>(
    "/:id/leave",
    {
      preHandler: authenticateRequest,
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      try {
        const room = await roomService.leaveRoom(request.params.id, user.id);

        if (room) {
          emitRoomUpdated(room);
        } else {
          emitRoomDeleted(request.params.id);
        }

        emitLobbyUpdated();

        return reply.send({
          room,
        });
      } catch (error) {
        if (error instanceof RoomServiceError) {
          return reply.code(400).send({
            error: {
              code: error.code,
              message: error.message,
            },
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: "Internal server error",
        });
      }
    },
  );
}
