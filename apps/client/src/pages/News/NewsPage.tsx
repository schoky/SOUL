import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import { getNews, type NewsItem } from "../../services/api/news";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getExcerpt(body: string, length = 200): string {
  const trimmed = body.trim();

  if (trimmed.length <= length) {
    return trimmed;
  }

  return `${trimmed.slice(0, length).trimEnd()}…`;
}

function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getNews();

        if (!cancelled) {
          setNews(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить новости",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MainLayout>
      <main className="news-page">
        <section className="news-page__hero">
          <p className="news-page__eyebrow">НОВОСТИ</p>

          <h1 className="news-page__title">Что нового в SOUL</h1>

          <p className="news-page__description">
            Обновления, анонсы и патчи проекта.
          </p>
        </section>

        {isLoading && (
          <section className="news-page__empty">
            <p className="news-page__empty-title">Загружаем новости...</p>
          </section>
        )}

        {error && (
          <section className="news-page__empty">
            <p className="news-page__empty-title">{error}</p>
          </section>
        )}

        {!isLoading && !error && news.length === 0 && (
          <section className="news-page__empty">
            <p className="news-page__empty-title">Пока нет новостей</p>

            <p className="news-page__empty-description">
              Как только появятся обновления — они появятся здесь.
            </p>
          </section>
        )}

        {!isLoading && !error && news.length > 0 && (
          <section className="news-page__list">
            {news.map((item) => (
              <article className="news-page__card" key={item.id}>
                <div className="news-page__card-header">
                  <p className="news-page__card-date">
                    {formatDate(item.publishedAt)}
                  </p>
                </div>

                <h2 className="news-page__card-title">{item.title}</h2>

                <p className="news-page__card-excerpt">
                  {getExcerpt(item.body)}
                </p>

                <Link
                  className="news-page__card-link"
                  to={`/news/${item.slug}`}
                >
                  Читать полностью →
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </MainLayout>
  );
}

export default NewsPage;
