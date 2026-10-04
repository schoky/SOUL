import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import type { FormEvent } from "react";

import MainLayout from "../../components/layout/MainLayout";

import { useFriendsStore } from "../../stores/friendsStore";
import { useToastStore } from "../../stores/toastStore";

import {
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../../services/api/friends";

import {
  acceptRoomInvitation,
  declineRoomInvitation,
} from "../../services/api/invitations";

type Tab = "friends" | "requests" | "search";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function FriendsPage() {
  const navigate = useNavigate();

  const friends = useFriendsStore((state) => state.friends);

  const incoming = useFriendsStore((state) => state.incoming);

  const outgoing = useFriendsStore((state) => state.outgoing);

  const invitations = useFriendsStore((state) => state.invitations);

  const isLoading = useFriendsStore((state) => state.isLoading);

  const load = useFriendsStore((state) => state.load);

  const pushToast = useToastStore((state) => state.push);

  const [tab, setTab] = useState<Tab>("friends");

  const [searchNickname, setSearchNickname] = useState("");

  const [isSending, setIsSending] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const requestsCount = useMemo(() => incoming.length, [incoming.length]);

  async function handleSendRequest(event: FormEvent) {
    event.preventDefault();

    const nickname = searchNickname.trim();

    if (!nickname) {
      return;
    }

    setIsSending(true);

    try {
      await sendFriendRequest(nickname);

      pushToast("success", `Заявка отправлена: ${nickname}`);

      setSearchNickname("");

      await load();
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error ? error.message : "Не удалось отправить заявку",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    setProcessingId(requestId);

    try {
      await acceptFriendRequest(requestId);

      pushToast("success", "Заявка принята");

      await load();
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error ? error.message : "Не удалось принять заявку",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeclineRequest(requestId: string) {
    setProcessingId(requestId);

    try {
      await declineFriendRequest(requestId);

      await load();
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error ? error.message : "Не удалось отклонить заявку",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRemoveFriend(userId: string) {
    if (!window.confirm("Удалить из друзей?")) {
      return;
    }

    setProcessingId(userId);

    try {
      await removeFriend(userId);

      pushToast("info", "Пользователь удалён из друзей");

      await load();
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error ? error.message : "Не удалось удалить",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleAcceptInvitation(invitationId: string) {
    setProcessingId(invitationId);

    try {
      const roomId = await acceptRoomInvitation(invitationId);

      pushToast("success", "Ты присоединился к комнате");

      navigate(`/room/${roomId}`);
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error
          ? error.message
          : "Не удалось принять приглашение",
      );

      await load();
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeclineInvitation(invitationId: string) {
    setProcessingId(invitationId);

    try {
      await declineRoomInvitation(invitationId);

      await load();
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error ? error.message : "Не удалось отклонить",
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <MainLayout>
      <main className="friends-page">
        <header className="friends-page__header">
          <p className="friends-page__eyebrow">СОЦИАЛЬНОЕ</p>

          <h1 className="friends-page__title">Друзья</h1>

          <p className="friends-page__description">
            Добавляй друзей по никнейму, приглашай в комнаты и следи за их
            онлайн-статусом.
          </p>
        </header>

        {invitations.length > 0 && (
          <section className="friends-invitations">
            <p className="friends-page__eyebrow">ПРИГЛАШЕНИЯ В ИГРУ</p>

            <div className="friends-invitations__list">
              {invitations.map((invitation) => (
                <article className="friend-invitation" key={invitation.id}>
                  <div className="friend-invitation__main">
                    <strong className="friend-invitation__title">
                      {invitation.inviter.nickname} приглашает в комнату
                    </strong>

                    <span className="friend-invitation__meta">
                      Код: <code>{invitation.roomCode}</code> ·{" "}
                      {invitation.membersCount} / {invitation.maxPlayers}{" "}
                      игроков
                    </span>
                  </div>

                  <div className="friend-invitation__actions">
                    <button
                      className="friends-page__button friends-page__button--primary"
                      type="button"
                      disabled={processingId === invitation.id}
                      onClick={() => {
                        void handleAcceptInvitation(invitation.id);
                      }}
                    >
                      Присоединиться
                    </button>

                    <button
                      className="friends-page__button friends-page__button--secondary"
                      type="button"
                      disabled={processingId === invitation.id}
                      onClick={() => {
                        void handleDeclineInvitation(invitation.id);
                      }}
                    >
                      Отклонить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <nav className="friends-page__tabs">
          <button
            className={[
              "friends-page__tab",
              tab === "friends" ? "friends-page__tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="button"
            onClick={() => setTab("friends")}
          >
            Друзья
            <span className="friends-page__tab-count">{friends.length}</span>
          </button>

          <button
            className={[
              "friends-page__tab",
              tab === "requests" ? "friends-page__tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="button"
            onClick={() => setTab("requests")}
          >
            Заявки
            {requestsCount > 0 && (
              <span className="friends-page__tab-count friends-page__tab-count--accent">
                {requestsCount}
              </span>
            )}
          </button>

          <button
            className={[
              "friends-page__tab",
              tab === "search" ? "friends-page__tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="button"
            onClick={() => setTab("search")}
          >
            Поиск
          </button>
        </nav>

        {isLoading && <p className="friends-page__loading">Загружаем…</p>}

        {!isLoading && tab === "friends" && (
          <>
            {friends.length === 0 ? (
              <div className="friends-page__empty">
                <p>У тебя пока нет друзей.</p>

                <p className="friends-page__empty-hint">
                  Перейди на вкладку «Поиск» и добавь первого друга по никнейму.
                </p>
              </div>
            ) : (
              <div className="friends-list">
                {friends.map((friend) => (
                  <article className="friend-item" key={friend.userId}>
                    <div className="friend-item__avatar-wrap">
                      {friend.avatar ? (
                        <img
                          className="friend-item__avatar"
                          src={friend.avatar}
                          alt={friend.nickname}
                        />
                      ) : (
                        <div className="friend-item__avatar friend-item__avatar--placeholder">
                          {friend.nickname[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}

                      {friend.isOnline && (
                        <span
                          className="friend-item__online-dot"
                          title="Онлайн"
                        />
                      )}
                    </div>

                    <div className="friend-item__info">
                      <strong className="friend-item__name">
                        {friend.nickname}
                      </strong>

                      <span className="friend-item__meta">
                        {friend.isOnline ? "В сети" : "Не в сети"} · в друзьях с{" "}
                        {formatDate(friend.friendsSince)}
                      </span>
                    </div>

                    <div className="friend-item__actions">
                      <button
                        className="friends-page__button friends-page__button--danger"
                        type="button"
                        disabled={processingId === friend.userId}
                        onClick={() => {
                          void handleRemoveFriend(friend.userId);
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && tab === "requests" && (
          <>
            <section className="friends-requests">
              <h2 className="friends-requests__title">
                Входящие
                {incoming.length > 0 && (
                  <span className="friends-requests__count">
                    {incoming.length}
                  </span>
                )}
              </h2>

              {incoming.length === 0 ? (
                <p className="friends-page__empty-hint">Нет входящих заявок.</p>
              ) : (
                <div className="friends-list">
                  {incoming.map((request) => (
                    <article className="friend-item" key={request.id}>
                      <div className="friend-item__avatar-wrap">
                        {request.from.avatar ? (
                          <img
                            className="friend-item__avatar"
                            src={request.from.avatar}
                            alt={request.from.nickname}
                          />
                        ) : (
                          <div className="friend-item__avatar friend-item__avatar--placeholder">
                            {request.from.nickname[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>

                      <div className="friend-item__info">
                        <strong className="friend-item__name">
                          {request.from.nickname}
                        </strong>

                        <span className="friend-item__meta">
                          Заявка от {formatDate(request.createdAt)}
                        </span>
                      </div>

                      <div className="friend-item__actions">
                        <button
                          className="friends-page__button friends-page__button--primary"
                          type="button"
                          disabled={processingId === request.id}
                          onClick={() => {
                            void handleAcceptRequest(request.id);
                          }}
                        >
                          Принять
                        </button>

                        <button
                          className="friends-page__button friends-page__button--secondary"
                          type="button"
                          disabled={processingId === request.id}
                          onClick={() => {
                            void handleDeclineRequest(request.id);
                          }}
                        >
                          Отклонить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="friends-requests">
              <h2 className="friends-requests__title">
                Исходящие
                {outgoing.length > 0 && (
                  <span className="friends-requests__count">
                    {outgoing.length}
                  </span>
                )}
              </h2>

              {outgoing.length === 0 ? (
                <p className="friends-page__empty-hint">
                  Нет исходящих заявок.
                </p>
              ) : (
                <div className="friends-list">
                  {outgoing.map((request) => (
                    <article className="friend-item" key={request.id}>
                      <div className="friend-item__avatar-wrap">
                        {request.to.avatar ? (
                          <img
                            className="friend-item__avatar"
                            src={request.to.avatar}
                            alt={request.to.nickname}
                          />
                        ) : (
                          <div className="friend-item__avatar friend-item__avatar--placeholder">
                            {request.to.nickname[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>

                      <div className="friend-item__info">
                        <strong className="friend-item__name">
                          {request.to.nickname}
                        </strong>

                        <span className="friend-item__meta">
                          Отправлено {formatDate(request.createdAt)}
                        </span>
                      </div>

                      <div className="friend-item__actions">
                        <button
                          className="friends-page__button friends-page__button--secondary"
                          type="button"
                          disabled={processingId === request.id}
                          onClick={() => {
                            void handleDeclineRequest(request.id);
                          }}
                        >
                          Отменить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {!isLoading && tab === "search" && (
          <section className="friends-search">
            <h2 className="friends-search__title">Найти друга</h2>

            <p className="friends-search__description">
              Введи никнейм игрока — мы отправим ему заявку в друзья.
            </p>

            <form className="friends-search__form" onSubmit={handleSendRequest}>
              <input
                className="friends-search__input"
                type="text"
                value={searchNickname}
                onChange={(event) => setSearchNickname(event.target.value)}
                placeholder="Никнейм"
                minLength={3}
                maxLength={20}
                disabled={isSending}
              />

              <button
                className="friends-page__button friends-page__button--primary"
                type="submit"
                disabled={isSending || searchNickname.trim().length < 3}
              >
                {isSending ? "Отправляем…" : "Отправить заявку"}
              </button>
            </form>

            <p className="friends-search__hint">
              Заявка придёт пользователю мгновенно. Как только он её примет — он
              появится в списке друзей.
            </p>
          </section>
        )}
      </main>
    </MainLayout>
  );
}

export default FriendsPage;
