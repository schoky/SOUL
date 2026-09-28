import type { FastifyPluginAsync } from "fastify";

import { authenticateRequest } from "../authMiddleware.js";

const newsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: authenticateRequest }, async (_request, reply) => {
    // Полноценная реализация — на этапе 7.
    return reply.send({
      news: [],
    });
  });
};

export default newsRoutes;
