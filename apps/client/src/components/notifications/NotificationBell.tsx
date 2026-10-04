import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useFriendsStore } from "../../stores/friendsStore";
import { useToastStore } from "../../stores/toastStore";

import {
  acceptFriendRequest,
  declineFriendRequest,
} from "../../services/api/friends";

import {
  acceptRoomInvitation,
  declineRoomInvitation,
} from "../../services/api/invitations";

function NotificationBell() {
  const navigate = useNavigate();

  const incoming = useFriendsStore((state) => state.incoming);

  const invitations = useFriendsStore((state) => state.invitations);

  const unread = useFriendsStore((state) => state.unread);

  const load = useFriendsStore((state) => state.load);

  const markAllAsRead = useFriendsStore((state) => state.markAllAsRead);

  const pushToast = useToastStore((state) => state.push);

  const [isOpen, setIsOpen] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const totalItems = incoming.length + invitations.length;

  // Закрываем при клике вне области колокольчика.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (rootRef.current.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // При открытии — помечаем всё прочитанным через небольшую задержку.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (unread.total === 0) {
      return;
    }

    const timer = setTimeout(() => {
      void markAllAsRead();
    }, 800);

    return () => clearTimeout(timer);
  }, [isOpen, unread.total, markAllAsRead]);

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
        error instanceof Error ? error.message : "Не удалось отклонить",
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

      setIsOpen(false);

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
    <div className="notification-bell" ref={rootRef}>
      <button
        className={[
          "notification-bell__button",
          unread.total > 0 ? "notification-bell__button--has-items" : "",
          isOpen ? "notification-bell__button--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        aria-label="Уведомления"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg
          className="notification-bell__icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 3a5 5 0 0 0-5 5v3.2c0 .8-.3 1.6-.9 2.2L5 14.5V16h14v-1.5l-1.1-1.1a3 3 0 0 1-.9-2.2V8a5 5 0 0 0-5-5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 18.5a2.5 2.5 0 0 0 5 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        {unread.total > 0 && (
          <span className="notification-bell__badge">
            {unread.total > 99 ? "99+" : unread.total}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell__dropdown" role="dialog">
          <header className="notification-bell__header">
            <strong>Уведомления</strong>
          </header>

          {totalItems === 0 ? (
            <p className="notification-bell__empty">
              Пока ничего нового.
              <br />
              Заявки в друзья и приглашения в игру появятся здесь.
            </p>
          ) : (
            <div className="notification-bell__scroll">
              {incoming.length > 0 && (
                <section className="notification-bell__section">
                  <p className="notification-bell__section-title">
                    Заявки в друзья
                  </p>

                  <ul className="notification-bell__list">
                    {incoming.map((request) => (
                      <li
                        className={[
                          "notification-item",
                          !request.isRead ? "notification-item--unread" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={request.id}
                      >
                        <div className="notification-item__avatar-wrap">
                          {request.from.avatar ? (
                            <img
                              className="notification-item__avatar"
                              src={request.from.avatar}
                              alt={request.from.nickname}
                            />
                          ) : (
                            <div className="notification-item__avatar notification-item__avatar--placeholder">
                              {request.from.nickname[0]?.toUpperCase() ?? "?"}
                            </div>
                          )}
                        </div>

                        <div className="notification-item__info">
                          <strong className="notification-item__title">
                            {request.from.nickname}
                          </strong>

                          <span className="notification-item__subtitle">
                            Хочет добавить тебя в друзья
                          </span>
                        </div>

                        <div className="notification-item__actions">
                          <button
                            className="notification-item__button notification-item__button--primary"
                            type="button"
                            disabled={processingId === request.id}
                            onClick={() => {
                              void handleAcceptRequest(request.id);
                            }}
                          >
                            Принять
                          </button>

                          <button
                            className="notification-item__button"
                            type="button"
                            disabled={processingId === request.id}
                            onClick={() => {
                              void handleDeclineRequest(request.id);
                            }}
                          >
                            Отклонить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {invitations.length > 0 && (
                <section className="notification-bell__section">
                  <p className="notification-bell__section-title">
                    Приглашения в игру
                  </p>

                  <ul className="notification-bell__list">
                    {invitations.map((invitation) => (
                      <li
                        className={[
                          "notification-item",
                          !invitation.isRead ? "notification-item--unread" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={invitation.id}
                      >
                        <div className="notification-item__avatar-wrap">
                          {invitation.inviter.avatar ? (
                            <img
                              className="notification-item__avatar"
                              src={invitation.inviter.avatar}
                              alt={invitation.inviter.nickname}
                            />
                          ) : (
                            <div className="notification-item__avatar notification-item__avatar--placeholder">
                              {invitation.inviter.nickname[0]?.toUpperCase() ??
                                "?"}
                            </div>
                          )}
                        </div>

                        <div className="notification-item__info">
                          <strong className="notification-item__title">
                            {invitation.inviter.nickname}
                          </strong>

                          <span className="notification-item__subtitle">
                            Приглашает в комнату{" "}
                            <code>{invitation.roomCode}</code> ·{" "}
                            {invitation.membersCount} / {invitation.maxPlayers}
                          </span>
                        </div>

                        <div className="notification-item__actions">
                          <button
                            className="notification-item__button notification-item__button--primary"
                            type="button"
                            disabled={processingId === invitation.id}
                            onClick={() => {
                              void handleAcceptInvitation(invitation.id);
                            }}
                          >
                            Войти
                          </button>

                          <button
                            className="notification-item__button"
                            type="button"
                            disabled={processingId === invitation.id}
                            onClick={() => {
                              void handleDeclineInvitation(invitation.id);
                            }}
                          >
                            Отклонить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          <footer className="notification-bell__footer">
            <Link
              className="notification-bell__footer-link"
              to="/friends"
              onClick={() => setIsOpen(false)}
            >
              Открыть страницу друзей →
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
