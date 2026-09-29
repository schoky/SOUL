import type { FastifyPluginAsync } from "fastify";
import { authenticateRequest } from "../authMiddleware.js";
import { leaderboardRepository } from "../../game/leaderboardRepository.js";

const leaderboardRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Querystring: { limit?: string };
  }>("/", { preHandler: authenticateRequest }, async (request, reply) => {
    const rawLimit = Number(request.query.limit ?? 50);

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100
        ? Math.floor(rawLimit)
        : 50;

    const entries = await leaderboardRepository.getLeaderboard(limit);

    return reply.send({ entries });
  });
};

export default leaderboardRoutes;
