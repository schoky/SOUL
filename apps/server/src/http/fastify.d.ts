import type { AuthenticatedUser } from '../auth/authService.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}
