import type { FastifyPluginAsync } from "fastify";

import { authenticateRequest } from "../authMiddleware.js";

import { updateProfile } from "../../players/profileService.js";
import { statsRepository } from "../../players/statsRepository.js";

type UpdateProfileBody = {
  nickname?: string;
  avatar?: string | null;
};

const profileRoutes: FastifyPluginAsync = async (app) => {
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

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      };
    },
  );

  app.get(
    "/stats",
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

      const stats = await statsRepository.getOverview(user.id);

      return reply.send(stats);
    },
  );

  app.get<{
    Querystring: {
      limit?: string;
    };
  }>(
    "/games",
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

      const rawLimit = Number(request.query.limit ?? 10);

      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 50
          ? Math.floor(rawLimit)
          : 10;

      const games = await statsRepository.getRecentGames(user.id, limit);

      return reply.send({ games });
    },
  );

  app.patch<{
    Body: UpdateProfileBody;
  }>(
    "/",
    {
      preHandler: authenticateRequest,

      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,

          properties: {
            nickname: {
              type: "string",
              minLength: 3,
              maxLength: 20,
            },

            avatar: {
              type: ["string", "null"],
              maxLength: 500,
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
        const profile = await updateProfile(user.id, request.body);

        return {
          profile,
        };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Nickname is already taken"
        ) {
          return reply.code(409).send({
            error: error.message,
          });
        }

        if (
          error instanceof Error &&
          (error.message.includes("Nickname must be") ||
            error.message.includes("At least one profile field"))
        ) {
          return reply.code(400).send({
            error: error.message,
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

export default profileRoutes;
