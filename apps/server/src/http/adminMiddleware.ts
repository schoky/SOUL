import type { FastifyReply, FastifyRequest } from "fastify";

import { authenticateRequest } from "./authMiddleware.js";

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Сначала обычная аутентификация
  await authenticateRequest(request, reply);

  // Если authenticateRequest уже ответил ошибкой — прерываемся
  if (reply.sent) {
    return;
  }

  const user = request.user;

  if (!user || user.role !== "ADMIN") {
    return reply.code(403).send({
      error: "Forbidden",
    });
  }
}
