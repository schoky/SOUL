import type { FastifyPluginAsync } from "fastify";

import { authenticateRequest } from "../authMiddleware.js";

import { notificationService } from "../../notifications/notificationService.js";

const notificationsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/unread",
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      const data = await notificationService.getUnreadCount(user.id);

      return reply.send(data);
    },
  );

  app.post(
    "/read",
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: "Not authenticated" });
      }

      await notificationService.markAllAsRead(user.id);

      return reply.send({ success: true });
    },
  );
};

export default notificationsRoutes;
