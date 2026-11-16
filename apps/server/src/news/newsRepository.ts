import { database } from '@soul/database';

class NewsRepository {
  async findPublished() {
    return database.news.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
  }

  async findPublishedBySlug(slug: string) {
    return database.news.findFirst({
      where: {
        slug,
        isPublished: true
      }
    });
  }

  async findAll() {
    return database.news.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string) {
    return database.news.findUnique({
      where: { id }
    });
  }

  async create(data: {
    slug: string;
    title: string;
    body: string;
    isPublished: boolean;
    authorId: string;
  }) {
    return database.news.create({
      data: {
        slug: data.slug,
        title: data.title,
        body: data.body,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
        authorId: data.authorId
      }
    });
  }

  async update(
    id: string,
    data: {
      slug?: string;
      title?: string;
      body?: string;
      isPublished?: boolean;
    }
  ) {
    const existing = await database.news.findUnique({
      where: { id }
    });

    if (!existing) {
      return null;
    }

    const publishedAt =
      data.isPublished === true && !existing.publishedAt
        ? new Date()
        : data.isPublished === false
          ? null
          : existing.publishedAt;

    return database.news.update({
      where: { id },
      data: {
        ...data,
        publishedAt
      }
    });
  }

  async delete(id: string) {
    return database.news.delete({
      where: { id }
    });
  }
}

export const newsRepository = new NewsRepository();
