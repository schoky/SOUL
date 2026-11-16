import { finishGame } from '@soul/game-engine';
import type { FastifyPluginAsync } from 'fastify';

import { adminCardRepository } from '../../admin/adminCardRepository.js';
import { adminRoomRepository } from '../../admin/adminRoomRepository.js';
import { adminStatsRepository } from '../../admin/adminStatsRepository.js';
import { adminUserRepository } from '../../admin/adminUserRepository.js';
import { socketLogs, type SocketLogType } from '../../admin/socketLogs.js';
import { gameManager } from '../../game/gameManager.js';
import { newsRepository } from '../../news/newsRepository.js';
import { roomRepository } from '../../rooms/roomRepository.js';
import { emitRoomUpdated } from '../../socket/roomEvents.js';
import { emitStateUpdate } from '../../socket/stateEmitter.js';
import { requireAdmin } from '../adminMiddleware.js';

type ListUsersQuery = {
  search?: string;
  limit?: string;
  offset?: string;
};

type BlockUserBody = {
  isBlocked: boolean;
};

type SetRoleBody = {
  role: 'USER' | 'ADMIN';
};

type CharacterBody = {
  slug: string;
  name: string;
  image?: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  abilityId?: string | null;
  abilityName?: string | null;
  abilityDescription?: string | null;
};

type EventBody = {
  slug: string;
  name: string;
  image?: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  mainStat: string;
  reward: number;
  riskReward: number;
  description: string;
};

type NewsBody = {
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
};

const adminRoutes: FastifyPluginAsync = async (app) => {
  // ---------- Статистика ----------

  app.get('/stats', { preHandler: requireAdmin }, async () => {
    const stats = await adminStatsRepository.getOverview();

    return stats;
  });

  // ---------- Пользователи ----------

  app.get<{ Querystring: ListUsersQuery }>(
    '/users',
    { preHandler: requireAdmin },
    async (request) => {
      const rawLimit = Number(request.query.limit ?? 20);
      const rawOffset = Number(request.query.offset ?? 0);

      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? Math.floor(rawLimit) : 20;

      const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;

      return adminUserRepository.findMany({
        search: request.query.search,
        limit,
        offset
      });
    }
  );

  app.patch<{
    Params: { id: string };
    Body: BlockUserBody;
  }>('/users/:id/blocked', { preHandler: requireAdmin }, async (request) => {
    await adminUserRepository.setBlocked(request.params.id, request.body.isBlocked);

    return { success: true };
  });

  app.patch<{
    Params: { id: string };
    Body: SetRoleBody;
  }>('/users/:id/role', { preHandler: requireAdmin }, async (request, reply) => {
    const me = request.user;

    if (me && me.id === request.params.id && request.body.role === 'USER') {
      return reply.code(400).send({
        error: 'Cannot demote yourself'
      });
    }

    await adminUserRepository.setRole(request.params.id, request.body.role);

    return { success: true };
  });

  // ---------- Комнаты и игры ----------

  app.get('/rooms', { preHandler: requireAdmin }, async () => {
    const rooms = await adminRoomRepository.findActive();

    return { rooms };
  });

  app.get('/games/active', { preHandler: requireAdmin }, async () => {
    const games = await adminRoomRepository.findPlayingGames();

    return { games };
  });

  app.post<{ Params: { id: string } }>(
    '/rooms/:id/force-finish',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const roomId = request.params.id;

      try {
        const room = await roomRepository.findById(roomId);

        if (!room) {
          return reply.code(404).send({ error: 'Комната не найдена' });
        }

        if (room.status === 'FINISHED') {
          return reply.code(400).send({ error: 'Комната уже завершена' });
        }

        if (room.status === 'PLAYING') {
          const game = await gameManager.resolve(roomId);

          if (game && game.status === 'playing') {
            // emitStateUpdate сам сохранит итоги игры
            // и обновит статус комнаты в БД.
            const finishedGame = finishGame(game);

            await emitStateUpdate(roomId, finishedGame);
          } else {
            await roomRepository.updateStatus(roomId, 'FINISHED');
            await roomRepository.setFinishedAt(roomId, new Date());

            const updatedRoom = await roomRepository.findById(roomId);

            if (updatedRoom) {
              emitRoomUpdated(updatedRoom);
            }
          }
        } else {
          // Комната в статусе WAITING — игра ещё не стартовала.
          await roomRepository.updateStatus(roomId, 'FINISHED');
          await roomRepository.setFinishedAt(roomId, new Date());

          const updatedRoom = await roomRepository.findById(roomId);

          if (updatedRoom) {
            emitRoomUpdated(updatedRoom);
          }
        }

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось завершить комнату';

        return reply.code(400).send({ error: message });
      }
    }
  );

  app.get('/games', { preHandler: requireAdmin }, async () => {
    const games = await adminRoomRepository.findRecentGames();

    return { games };
  });

  // ---------- Персонажи ----------

  app.get('/characters', { preHandler: requireAdmin }, async () => {
    const characters = await adminCardRepository.listCharacters();

    return { characters };
  });

  app.post<{ Body: CharacterBody }>(
    '/characters',
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const character = await adminCardRepository.createCharacter(request.body);

        return reply.code(201).send({ character });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось создать персонажа';

        return reply.code(400).send({ error: message });
      }
    }
  );

  app.patch<{
    Params: { id: string };
    Body: Partial<CharacterBody>;
  }>('/characters/:id', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const character = await adminCardRepository.updateCharacter(request.params.id, request.body);

      return { character };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить персонажа';

      return reply.code(400).send({ error: message });
    }
  });

  app.delete<{ Params: { id: string } }>(
    '/characters/:id',
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        await adminCardRepository.deleteCharacter(request.params.id);

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось удалить персонажа';

        return reply.code(400).send({ error: message });
      }
    }
  );

  // ---------- События ----------

  app.get('/events', { preHandler: requireAdmin }, async () => {
    const events = await adminCardRepository.listEvents();

    return { events };
  });

  app.post<{ Body: EventBody }>('/events', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const event = await adminCardRepository.createEvent(request.body);

      return reply.code(201).send({ event });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать событие';

      return reply.code(400).send({ error: message });
    }
  });

  app.patch<{
    Params: { id: string };
    Body: Partial<EventBody>;
  }>('/events/:id', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const event = await adminCardRepository.updateEvent(request.params.id, request.body);

      return { event };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить событие';

      return reply.code(400).send({ error: message });
    }
  });

  app.delete<{ Params: { id: string } }>(
    '/events/:id',
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        await adminCardRepository.deleteEvent(request.params.id);

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось удалить событие';

        return reply.code(400).send({ error: message });
      }
    }
  );

  // ---------- Новости ----------

  app.get('/news', { preHandler: requireAdmin }, async () => {
    const items = await newsRepository.findAll();

    return {
      news: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        body: item.body,
        isPublished: item.isPublished,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        authorId: item.authorId,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }))
    };
  });

  app.post<{ Body: NewsBody }>('/news', { preHandler: requireAdmin }, async (request, reply) => {
    const me = request.user;

    if (!me) {
      return reply.code(401).send({
        error: 'Not authenticated'
      });
    }

    try {
      const created = await newsRepository.create({
        slug: request.body.slug,
        title: request.body.title,
        body: request.body.body,
        isPublished: request.body.isPublished,
        authorId: me.id
      });

      return reply.code(201).send({
        item: {
          id: created.id,
          slug: created.slug,
          title: created.title,
          body: created.body,
          isPublished: created.isPublished,
          publishedAt: created.publishedAt?.toISOString() ?? null,
          authorId: created.authorId,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString()
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать новость';

      return reply.code(400).send({ error: message });
    }
  });

  app.patch<{
    Params: { id: string };
    Body: Partial<NewsBody>;
  }>('/news/:id', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const updated = await newsRepository.update(request.params.id, request.body);

      if (!updated) {
        return reply.code(404).send({
          error: 'Новость не найдена'
        });
      }

      return {
        item: {
          id: updated.id,
          slug: updated.slug,
          title: updated.title,
          body: updated.body,
          isPublished: updated.isPublished,
          publishedAt: updated.publishedAt?.toISOString() ?? null,
          authorId: updated.authorId,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString()
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить новость';

      return reply.code(400).send({ error: message });
    }
  });

  app.delete<{ Params: { id: string } }>(
    '/news/:id',
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        await newsRepository.delete(request.params.id);

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось удалить новость';

        return reply.code(400).send({ error: message });
      }
    }
  );

  // ---------- Логи сокетов ----------

  app.get<{
    Querystring: { limit?: string; type?: string };
  }>('/logs', { preHandler: requireAdmin }, async (request) => {
    const rawLimit = Number(request.query.limit ?? 100);

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 500 ? Math.floor(rawLimit) : 100;

    const type = request.query.type as SocketLogType | undefined;

    return {
      logs: socketLogs.get({ limit, type })
    };
  });

  app.get<{
    Querystring: { type?: string };
  }>('/logs/export', { preHandler: requireAdmin }, async (request, reply) => {
    const type = request.query.type as SocketLogType | undefined;

    // Для CSV — старые сверху, чтобы читалось сверху вниз.
    const logs = socketLogs.get({ limit: 500, type }).reverse();

    function escapeCsv(value: string): string {
      return `"${value.replace(/"/g, '""')}"`;
    }

    const header = ['timestamp', 'type', 'userId', 'socketId', 'roomId', 'message'].join(',');

    const rows = logs.map((log) =>
      [
        escapeCsv(log.timestamp),
        escapeCsv(log.type),
        escapeCsv(log.userId ?? ''),
        escapeCsv(log.socketId ?? ''),
        escapeCsv(log.roomId ?? ''),
        escapeCsv(log.message)
      ].join(',')
    );

    const csv = '\uFEFF' + [header, ...rows].join('\n');

    const filename = `soul-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(csv);

    return reply;
  });
};

export default adminRoutes;
