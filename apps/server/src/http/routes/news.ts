import type { FastifyPluginAsync } from "fastify";

import { newsRepository } from "../../news/newsRepository.js";

const newsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (_request, reply) => {
    const news = await newsRepository.findPublished();

    return reply.send({
      news: news.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        body: item.body,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      })),
    });
  });

  app.get<{
    Params: { slug: string };
  }>("/:slug", async (request, reply) => {
    const article = await newsRepository.findPublishedBySlug(
      request.params.slug,
    );

    if (!article) {
      return reply.code(404).send({
        error: {
          code: "NEWS_NOT_FOUND",
          message: "Новость не найдена",
        },
      });
    }

    return reply.send({
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        body: article.body,
        publishedAt: article.publishedAt?.toISOString() ?? null,
      },
    });
  });
};

export default newsRoutes;
