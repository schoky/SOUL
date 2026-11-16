import type { FastifyPluginAsync } from 'fastify';

import { gameResultRepository } from '../../game/gameResultRepository.js';
import { authenticateRequest } from '../authMiddleware.js';

const gamesRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Params: {
      roomId: string;
    };
  }>(
    '/:roomId/result',
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: 'Not authenticated'
        });
      }

      const result = await gameResultRepository.findByRoomId(request.params.roomId);

      if (!result) {
        return reply.code(404).send({
          error: {
            code: 'RESULT_NOT_FOUND',
            message: 'Результат игры не найден'
          }
        });
      }

      return reply.send({
        result
      });
    }
  );
};

export default gamesRoutes;
