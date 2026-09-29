import type { FastifyPluginAsync } from "fastify";
import { authenticateRequest } from "../authMiddleware.js";
import { gameHistoryRepository } from "../../game/gameHistoryRepository.js";

const historyRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Querystring: { limit?: string; offset?: string };
  }>(
    "/me/games",
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      const rawLimit = Number(request.query.limit ?? 10);
      const rawOffset = Number(request.query.offset ?? 0);

      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 50
          ? Math.floor(rawLimit)
          : 10;

      const offset =
        Number.isFinite(rawOffset) && rawOffset >= 0
          ? Math.floor(rawOffset)
          : 0;

      const games = await gameHistoryRepository.getUserGames(
        user.id,
        limit,
        offset,
      );

      return reply.send({ games });
    },
  );
};

export default historyRoutes;
