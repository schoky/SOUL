import type { FastifyPluginAsync } from "fastify";

import { characters, events } from "@soul/game-engine";

import { authenticateRequest } from "../authMiddleware.js";

const cardsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    {
      preHandler: authenticateRequest,
    },
    async (_request, reply) => {
      return reply.send({
        characters,
        events,
      });
    },
  );
};

export default cardsRoutes;
