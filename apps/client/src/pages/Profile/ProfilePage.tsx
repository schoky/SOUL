import { useEffect, useState } from "react";

import { useAuthStore } from "../../stores/authStore";

import MainLayout from "../../components/layout/MainLayout";

import {
  getProfileStats,
  getRecentGames,
  type ProfileGameEntry,
  type ProfileOverview,
} from "../../services/api/profile";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState<ProfileOverview | null>(null);

  const [games, setGames] = useState<ProfileGameEntry[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [overview, recent] = await Promise.all([
          getProfileStats(),
          getRecentGames(10),
        ]);

        if (cancelled) {
          return;
        }

        setStats(overview);
        setGames(recent);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить профиль",
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

  const winRatePercent = stats ? Math.round(stats.winRate * 100) : 0;

  return (
    <MainLayout>
      <main className="profile-page">
        <section className="profile-page__header">
          <div className="profile-page__identity">
            <div className="profile-page__avatar">
              {user?.profile.avatar ? (
                <img src={user.profile.avatar} alt={user.profile.nickname} />
              ) : (
                <span>{user?.profile.nickname?.[0]?.toUpperCase() ?? "?"}</span>
              )}
            </div>

            <div>
              <p className="profile-page__eyebrow">ПРОФИЛЬ</p>

              <h1 className="profile-page__title">
                {user?.profile.nickname ?? "—"}
              </h1>

              <p className="profile-page__description">{user?.email ?? ""}</p>
            </div>
          </div>
        </section>

        {isLoading && (
          <section className="profile-page__empty">
            <p className="profile-page__empty-title">Загружаем профиль...</p>
          </section>
        )}

        {error && (
          <section className="profile-page__empty">
            <p className="profile-page__empty-title">{error}</p>
          </section>
        )}

        {!isLoading && !error && stats && (
          <>
            <section className="profile-page__stats">
              <article className="profile-page__stat">
                <span>Всего игр</span>
                <strong>{stats.totalGames}</strong>
              </article>

              <article className="profile-page__stat">
                <span>Побед</span>
                <strong>{stats.wins}</strong>
              </article>

              <article className="profile-page__stat">
                <span>Процент побед</span>
                <strong>{winRatePercent}%</strong>
              </article>

              <article className="profile-page__stat">
                <span>Средний Soul</span>
                <strong>{stats.averageSoul.toFixed(1)}</strong>
              </article>

              <article className="profile-page__stat">
                <span>Лучший Soul</span>
                <strong>{stats.bestSoul}</strong>
              </article>
            </section>

            <section className="profile-page__history">
              <div className="profile-page__history-header">
                <div>
                  <p className="profile-page__eyebrow">ИСТОРИЯ</p>

                  <h2 className="profile-page__section-title">
                    Последние игры
                  </h2>
                </div>
              </div>

              {games.length === 0 ? (
                <div className="profile-page__empty profile-page__empty--inline">
                  <p className="profile-page__empty-title">
                    Ты ещё не сыграл ни одной игры
                  </p>
                </div>
              ) : (
                <div className="profile-page__games">
                  {games.map((game) => (
                    <article
                      className={[
                        "profile-page__game",
                        game.won ? "profile-page__game--won" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={game.gameId}
                    >
                      <div className="profile-page__game-main">
                        <span className="profile-page__game-date">
                          {formatDate(game.finishedAt)}
                        </span>

                        <span className="profile-page__game-players">
                          {game.playersCount} игрока
                        </span>
                      </div>

                      <div className="profile-page__game-result">
                        <div>
                          <span>Место</span>
                          <strong>{game.place ?? "—"}</strong>
                        </div>

                        <div>
                          <span>Soul</span>
                          <strong>{game.soul ?? "—"}</strong>
                        </div>

                        <span
                          className={[
                            "profile-page__game-tag",
                            game.won
                              ? "profile-page__game-tag--won"
                              : "profile-page__game-tag--lost",
                          ].join(" ")}
                        >
                          {game.won ? "Победа" : "Поражение"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </MainLayout>
  );
}

export default ProfilePage;
