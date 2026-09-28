import { FormEvent, useEffect, useState } from "react";

import { ApiError } from "../../services/api/client";

import { useAuthStore } from "../../stores/authStore";

import MainLayout from "../../components/layout/MainLayout";

import {
  getProfileStats,
  getRecentGames,
  updateProfile,
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

  const setUser = useAuthStore((state) => state.setUser);

  const [stats, setStats] = useState<ProfileOverview | null>(null);

  const [games, setGames] = useState<ProfileGameEntry[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [formNickname, setFormNickname] = useState("");

  const [formAvatar, setFormAvatar] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

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

  function startEditing() {
    setFormError(null);

    setFormNickname(user?.profile.nickname ?? "");

    setFormAvatar(user?.profile.avatar ?? "");

    setIsEditing(true);
  }

  function cancelEditing() {
    setFormError(null);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setFormError(null);

    const trimmedNickname = formNickname.trim();

    const trimmedAvatar = formAvatar.trim();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 20) {
      setFormError("Ник должен содержать от 3 до 20 символов");
      return;
    }

    const payload: {
      nickname?: string;
      avatar?: string | null;
    } = {};

    if (trimmedNickname !== user.profile.nickname) {
      payload.nickname = trimmedNickname;
    }

    const currentAvatar = user.profile.avatar ?? "";

    if (trimmedAvatar !== currentAvatar) {
      payload.avatar = trimmedAvatar.length > 0 ? trimmedAvatar : null;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await updateProfile(payload);

      setUser({
        ...user,
        profile: updatedProfile,
      });

      setIsEditing(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Не удалось сохранить профиль");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const winRatePercent = stats ? Math.round(stats.winRate * 100) : 0;

  const avatarPreview = formAvatar.trim() || user?.profile.avatar;

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

            <div className="profile-page__identity-info">
              <p className="profile-page__eyebrow">ПРОФИЛЬ</p>

              <h1 className="profile-page__title">
                {user?.profile.nickname ?? "—"}
              </h1>

              <p className="profile-page__description">{user?.email ?? ""}</p>

              {!isEditing && (
                <button
                  className="profile-page__edit-button"
                  type="button"
                  onClick={startEditing}
                >
                  Редактировать профиль
                </button>
              )}
            </div>
          </div>
        </section>

        {isEditing && (
          <section className="profile-page__editor">
            <div className="profile-page__editor-header">
              <p className="profile-page__eyebrow">РЕДАКТИРОВАНИЕ</p>

              <h2 className="profile-page__section-title">Настройки профиля</h2>
            </div>

            <form className="profile-page__form" onSubmit={handleSubmit}>
              <div className="profile-page__field">
                <label className="profile-page__label" htmlFor="nickname">
                  Никнейм
                </label>

                <input
                  className="profile-page__input"
                  id="nickname"
                  type="text"
                  value={formNickname}
                  onChange={(event) => setFormNickname(event.target.value)}
                  minLength={3}
                  maxLength={20}
                  autoComplete="nickname"
                  required
                />

                <span className="profile-page__hint">
                  От 3 до 20 символов. Никнейм должен быть уникальным.
                </span>
              </div>

              <div className="profile-page__field">
                <label className="profile-page__label" htmlFor="avatar">
                  Ссылка на аватар
                </label>

                <input
                  className="profile-page__input"
                  id="avatar"
                  type="url"
                  value={formAvatar}
                  onChange={(event) => setFormAvatar(event.target.value)}
                  placeholder="https://..."
                  maxLength={500}
                />

                <span className="profile-page__hint">
                  Оставь пустым, чтобы убрать аватар. Пока поддерживаются только
                  прямые ссылки на изображения.
                </span>
              </div>

              {avatarPreview && (
                <div className="profile-page__avatar-preview">
                  <span className="profile-page__label">Превью</span>

                  <div className="profile-page__avatar">
                    <img src={avatarPreview} alt="Превью аватара" />
                  </div>
                </div>
              )}

              {formError && (
                <p className="profile-page__form-error">{formError}</p>
              )}

              <div className="profile-page__form-actions">
                <button
                  className="profile-page__button profile-page__button--primary"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Сохраняем..." : "Сохранить"}
                </button>

                <button
                  className="profile-page__button"
                  type="button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Отмена
                </button>
              </div>
            </form>
          </section>
        )}

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
