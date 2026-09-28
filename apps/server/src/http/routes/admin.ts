import type { FastifyPluginAsync } from "fastify";

import { requireAdmin } from "../adminMiddleware.js";

import { adminStatsRepository } from "../../admin/adminStatsRepository.js";
import { adminUserRepository } from "../../admin/adminUserRepository.js";
import { adminRoomRepository } from "../../admin/adminRoomRepository.js";
import { adminCardRepository } from "../../admin/adminCardRepository.js";
import { newsRepository } from "../../news/newsRepository.js";

type ListUsersQuery = {
  search?: string;
  limit?: string;
  offset?: string;
};

type BlockUserBody = {
  isBlocked: boolean;
};

type SetRoleBody = {
  role: "USER" | "ADMIN";
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

  app.get("/stats", { preHandler: requireAdmin }, async () => {
    const stats = await adminStatsRepository.getOverview();

    return stats;
  });

  // ---------- Пользователи ----------

  app.get<{ Querystring: ListUsersQuery }>(
    "/users",
    { preHandler: requireAdmin },
    async (request) => {
      const rawLimit = Number(request.query.limit ?? 20);
      const rawOffset = Number(request.query.offset ?? 0);

      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100
          ? Math.floor(rawLimit)
          : 20;

      const offset =
        Number.isFinite(rawOffset) && rawOffset >= 0
          ? Math.floor(rawOffset)
          : 0;

      return adminUserRepository.findMany({
        search: request.query.search,
        limit,
        offset,
      });
    },
  );

  app.patch<{
    Params: { id: string };
    Body: BlockUserBody;
  }>("/users/:id/blocked", { preHandler: requireAdmin }, async (request) => {
    await adminUserRepository.setBlocked(
      request.params.id,
      request.body.isBlocked,
    );

    return { success: true };
  });

  app.patch<{
    Params: { id: string };
    Body: SetRoleBody;
  }>(
    "/users/:id/role",
    { preHandler: requireAdmin },
    async (request, reply) => {
      const me = request.user;

      if (me && me.id === request.params.id && request.body.role === "USER") {
        return reply.code(400).send({
          error: "Cannot demote yourself",
        });
      }

      await adminUserRepository.setRole(request.params.id, request.body.role);

      return { success: true };
    },
  );

  // ---------- Комнаты и игры ----------

  app.get("/rooms", { preHandler: requireAdmin }, async () => {
    const rooms = await adminRoomRepository.findActive();

    return { rooms };
  });

  app.get("/games", { preHandler: requireAdmin }, async () => {
    const games = await adminRoomRepository.findRecentGames();

    return { games };
  });

  // ---------- Персонажи ----------

  app.get("/characters", { preHandler: requireAdmin }, async () => {
    const characters = await adminCardRepository.listCharacters();

    return { characters };
  });

  app.post<{ Body: CharacterBody }>(
    "/characters",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const character = await adminCardRepository.createCharacter(
          request.body,
        );

        return reply.code(201).send({ character });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось создать персонажа";

        return reply.code(400).send({ error: message });
      }
    },
  );

  app.patch<{
    Params: { id: string };
    Body: Partial<CharacterBody>;
  }>(
    "/characters/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const character = await adminCardRepository.updateCharacter(
          request.params.id,
          request.body,
        );

        return { character };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось обновить персонажа";

        return reply.code(400).send({ error: message });
      }
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/characters/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        await adminCardRepository.deleteCharacter(request.params.id);

        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось удалить персонажа";

        return reply.code(400).send({ error: message });
      }
    },
  );

  // ---------- События ----------

  app.get("/events", { preHandler: requireAdmin }, async () => {
    const events = await adminCardRepository.listEvents();

    return { events };
  });

  app.post<{ Body: EventBody }>(
    "/events",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        const event = await adminCardRepository.createEvent(request.body);

        return reply.code(201).send({ event });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось создать событие";

        return reply.code(400).send({ error: message });
      }
    },
  );

  app.patch<{
    Params: { id: string };
    Body: Partial<EventBody>;
  }>("/events/:id", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const event = await adminCardRepository.updateEvent(
        request.params.id,
        request.body,
      );

      return { event };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось обновить событие";

      return reply.code(400).send({ error: message });
    }
  });

  app.delete<{ Params: { id: string } }>(
    "/events/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        await adminCardRepository.deleteEvent(request.params.id);

        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось удалить событие";

        return reply.code(400).send({ error: message });
      }
    },
  );

  // ---------- Новости ----------

  app.get("/news", { preHandler: requireAdmin }, async () => {
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
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  });

  app.post<{ Body: NewsBody }>(
    "/news",
    { preHandler: requireAdmin },
    async (request, reply) => {
      const me = request.user;

      if (!me) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      try {
        const created = await newsRepository.create({
          slug: request.body.slug,
          title: request.body.title,
          body: request.body.body,
          isPublished: request.body.isPublished,
          authorId: me.id,
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
            updatedAt: created.updatedAt.toISOString(),
          },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось создать новость";

        return reply.code(400).send({ error: message });
      }
    },
  );

  app.patch<{
    Params: { id: string };
    Body: Partial<NewsBody>;
  }>("/news/:id", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const updated = await newsRepository.update(
        request.params.id,
        request.body,
      );

      if (!updated) {
        return reply.code(404).send({
          error: "Новость не найдена",
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
          updatedAt: updated.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось обновить новость";

      return reply.code(400).send({ error: message });
    }
  });

  app.delete<{ Params: { id: string } }>(
    "/news/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
      try {
        await newsRepository.delete(request.params.id);

        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось удалить новость";

        return reply.code(400).send({ error: message });
      }
    },
  );
};

export default adminRoutes;
