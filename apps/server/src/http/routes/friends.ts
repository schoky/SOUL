import type { FastifyPluginAsync } from "fastify";

import { authenticateRequest } from "../authMiddleware.js";

import {
  friendService,
  FriendServiceError,
} from "../../friends/friendService.js";

type SendRequestBody = {
  nickname: string;
};

const friendsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: authenticateRequest }, async (request, reply) => {
    const user = request.user;

    if (!user) {
      return reply.code(401).send({ error: "Not authenticated" });
    }

    const data = await friendService.listFriends(user.id);

    return reply.send(data);
  });

  app.get(
    "/requests",
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      const data = await friendService.listRequests(user.id);

      return reply.send(data);
    },
  );

  app.post<{ Body: SendRequestBody }>(
    "/requests",
    {
      preHandler: authenticateRequest,

      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
        },
      },

      schema: {
        body: {
          type: "object",
          required: ["nickname"],
          additionalProperties: false,
          properties: {
            nickname: {
              type: "string",
              minLength: 3,
              maxLength: 20,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      try {
        const result = await friendService.sendRequest(
          user.id,
          request.body.nickname,
        );

        return reply.code(201).send(result);
      } catch (error) {
        if (error instanceof FriendServiceError) {
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

  app.post<{ Params: { id: string } }>(
    "/requests/:id/accept",
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      try {
        const result = await friendService.acceptRequest(
          user.id,
          request.params.id,
        );

        return reply.send(result);
      } catch (error) {
        if (error instanceof FriendServiceError) {
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

  app.post<{ Params: { id: string } }>(
    "/requests/:id/decline",
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      try {
        await friendService.declineRequest(user.id, request.params.id);

        return reply.send({ success: true });
      } catch (error) {
        if (error instanceof FriendServiceError) {
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

  app.delete<{ Params: { userId: string } }>(
    "/:userId",
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      try {
        await friendService.removeFriend(user.id, request.params.userId);

        return reply.send({ success: true });
      } catch (error) {
        if (error instanceof FriendServiceError) {
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
};

export default friendsRoutes;
