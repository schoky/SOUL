import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import MainLayout from '../../components/layout/MainLayout';
import { getNewsArticle, type NewsItem } from '../../services/api/news';

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<NewsItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getNewsArticle(slug!);

        if (!cancelled) {
          setArticle(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : 'Не удалось загрузить новость');
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
  }, [slug]);

  if (isLoading) {
    return (
      <MainLayout>
        <main className='news-article-page'>
          <p className='news-article-page__loading'>Загружаем...</p>
        </main>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <main className='news-article-page'>
          <section className='news-article-page__error'>
            <p className='news-article-page__eyebrow'>ОШИБКА</p>

            <h1 className='news-article-page__title'>Новость не найдена</h1>

            <p className='news-article-page__description'>
              {error ?? 'Возможно, она была удалена или ещё не опубликована.'}
            </p>

            <Link className='news-article-page__back' to='/news'>
              ← Все новости
            </Link>
          </section>
        </main>
      </MainLayout>
    );
  }

  const paragraphs = article.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <MainLayout>
      <main className='news-article-page'>
        <Link className='news-article-page__back' to='/news'>
          ← Все новости
        </Link>

        <article className='news-article'>
          <header className='news-article__header'>
            <p className='news-article-page__eyebrow'>НОВОСТЬ</p>

            <h1 className='news-article__title'>{article.title}</h1>

            <p className='news-article__date'>{formatDate(article.publishedAt)}</p>
          </header>

          <div className='news-article__body'>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
    </MainLayout>
  );
}

export default NewsArticlePage;
