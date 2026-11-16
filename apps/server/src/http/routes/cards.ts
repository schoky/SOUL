import type { FastifyPluginAsync } from 'fastify';

import { characterRepository } from '../../cards/characterRepository.js';
import { eventRepository } from '../../cards/eventRepository.js';
import { authenticateRequest } from '../authMiddleware.js';

const cardsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: authenticateRequest }, async (_request, reply) => {
    const [characters, events] = await Promise.all([
      characterRepository.findAll(),
      eventRepository.findAll()
    ]);

    return reply.send({
      characters,
      events
    });
  });
};

export default cardsRoutes;
