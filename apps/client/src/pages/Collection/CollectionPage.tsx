import { useEffect, useState } from "react";

import type { Character, EventCard } from "@soul/shared";

import CardImage from "../../components/game/CardImage";

import MainLayout from "../../components/layout/MainLayout";

import { getCards } from "../../services/api/cards";

type TabId = "characters" | "events";

function CollectionPage() {
  const [tab, setTab] = useState<TabId>("characters");

  const [characters, setCharacters] = useState<Character[]>([]);

  const [events, setEvents] = useState<EventCard[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getCards();

        if (cancelled) {
          return;
        }

        setCharacters(data.characters);
        setEvents(data.events);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить карточки",
        );
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
      <main className="collection-page">
        <section className="collection-page__header">
          <div>
            <p className="collection-page__eyebrow">КОЛЛЕКЦИЯ</p>

            <h1 className="collection-page__title">Все карточки SOUL</h1>

            <p className="collection-page__description">
              Полный список персонажей и событий, доступных в игре.
            </p>
          </div>
        </section>

        <section className="collection-page__tabs">
          <button
            className={[
              "collection-page__tab",
              tab === "characters" ? "collection-page__tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="button"
            onClick={() => setTab("characters")}
          >
            Персонажи
            <span className="collection-page__tab-count">
              {characters.length}
            </span>
          </button>

          <button
            className={[
              "collection-page__tab",
              tab === "events" ? "collection-page__tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="button"
            onClick={() => setTab("events")}
          >
            События
            <span className="collection-page__tab-count">{events.length}</span>
          </button>
        </section>

        {isLoading && (
          <section className="collection-page__empty">
            <p className="collection-page__empty-title">
              Загружаем карточки...
            </p>
          </section>
        )}

        {error && (
          <section className="collection-page__empty">
            <p className="collection-page__empty-title">{error}</p>
          </section>
        )}

        {!isLoading && !error && tab === "characters" && (
          <section className="collection-page__grid">
            {characters.map((character) => (
              <article className="collection-page__card" key={character.id}>
                <div className="collection-page__card-image">
                  <CardImage
                    src={character.image}
                    fallbackSrc={`/cards/characters/${character.id}.webp`}
                    alt={character.name}
                    placeholderLabel={character.name}
                  />
                </div>

                <div className="collection-page__card-body">
                  <h2 className="collection-page__card-title">
                    {character.name}
                  </h2>

                  <div className="collection-page__card-stats">
                    <div>
                      <span>Фармила</span>
                      <strong>{character.stats.farmila}</strong>
                    </div>

                    <div>
                      <span>Перекуп</span>
                      <strong>{character.stats.perekup}</strong>
                    </div>

                    <div>
                      <span>Туллер</span>
                      <strong>{character.stats.tuller}</strong>
                    </div>
                  </div>

                  {character.ability && (
                    <div className="collection-page__card-ability">
                      <span>{character.ability.name}</span>
                      <p>{character.ability.description}</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {!isLoading && !error && tab === "events" && (
          <section className="collection-page__grid">
            {events.map((event) => (
              <article className="collection-page__card" key={event.id}>
                <div className="collection-page__card-image">
                  <CardImage
                    src={event.image}
                    fallbackSrc={`/cards/events/${event.id}.webp`}
                    alt={event.name}
                    placeholderLabel={event.name}
                  />
                </div>

                <div className="collection-page__card-body">
                  <h2 className="collection-page__card-title">{event.name}</h2>

                  <p className="collection-page__card-description">
                    {event.description}
                  </p>

                  <div className="collection-page__card-requirements">
                    <div>
                      <span>Фармила</span>
                      <strong>{event.requirements.farmila}</strong>
                    </div>

                    <div>
                      <span>Перекуп</span>
                      <strong>{event.requirements.perekup}</strong>
                    </div>

                    <div>
                      <span>Туллер</span>
                      <strong>{event.requirements.tuller}</strong>
                    </div>
                  </div>

                  <div className="collection-page__card-footer">
                    <div className="collection-page__card-main">
                      <span>Основная</span>
                      <strong>{event.mainStat}</strong>
                    </div>

                    <div className="collection-page__card-rewards">
                      <div>
                        <span>Награда</span>
                        <strong>+{event.reward}</strong>
                      </div>

                      <div>
                        <span>Риск</span>
                        <strong>+{event.riskReward}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </MainLayout>
  );
}

export default CollectionPage;
