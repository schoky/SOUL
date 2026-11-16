import type { FastifyPluginAsync } from 'fastify';

import { invitationService, InvitationServiceError } from '../../invitations/invitationService.js';
import { authenticateRequest } from '../authMiddleware.js';

const invitationsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: authenticateRequest }, async (request, reply) => {
    const user = request.user;

    if (!user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const data = await invitationService.listForUser(user.id);

    return reply.send(data);
  });

  app.post<{ Params: { id: string } }>(
    '/:id/accept',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: 'Not authenticated' });
      }

      try {
        const result = await invitationService.acceptInvitation(user.id, request.params.id);

        return reply.send(result);
      } catch (error) {
        if (error instanceof InvitationServiceError) {
          return reply.code(400).send({
            error: {
              code: error.code,
              message: error.message
            }
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: 'Internal server error'
        });
      }
    }
  );

  app.post<{ Params: { id: string } }>(
    '/:id/decline',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: 'Not authenticated' });
      }

      try {
        await invitationService.declineInvitation(user.id, request.params.id);

        return reply.send({ success: true });
      } catch (error) {
        if (error instanceof InvitationServiceError) {
          return reply.code(400).send({
            error: {
              code: error.code,
              message: error.message
            }
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          error: 'Internal server error'
        });
      }
    }
  );
};

export default invitationsRoutes;
