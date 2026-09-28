import type { FastifyInstance } from "fastify";

import { authenticateRequest } from "../authMiddleware.js";

import { roomService, RoomServiceError } from "../../rooms/roomService.js";

type CreateRoomBody = {
  maxPlayers?: number;
};

export async function roomRoutes(app: FastifyInstance) {
  /**
   * Получить список комнат,
   * которые ждут игроков.
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
