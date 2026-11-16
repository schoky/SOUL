import { apiRequest } from './client';

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  body: string;
  publishedAt: string | null;
};

export async function getNews(): Promise<NewsItem[]> {
  const response = await apiRequest<{
    news: NewsItem[];
  }>('/api/news');

  return response.news;
}

export async function getNewsArticle(slug: string): Promise<NewsItem> {
  const response = await apiRequest<{
    article: NewsItem;
  }>(`/api/news/${slug}`);

  return response.article;
}
