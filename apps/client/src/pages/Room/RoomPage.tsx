import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ROOM_RULES, SOCKET_EVENTS } from "@soul/shared";

import type {
  GameStartedPayload,
  RoomDeletedPayload,
  RoomPreviewDto,
  RoomUpdatedPayload,
} from "@soul/shared";

import MainLayout from "../../components/layout/MainLayout";

import { socket } from "../../services/socket";

import { getRoomPreview } from "../../services/api/rooms";

import { useAuthStore } from "../../stores/authStore";
import { useGameStore } from "../../stores/gameStore";
import { useRoomStore } from "../../stores/roomStore";

function RoomPage() {
  const navigate = useNavigate();

  const { roomId } = useParams<{
    roomId: string;
  }>();

  const user = useAuthStore((state) => state.user);

  const currentRoom = useRoomStore((state) => state.currentRoom);

  const isLoading = useRoomStore((state) => state.isLoading);

  const isMutating = useRoomStore((state) => state.isMutating);

  const error = useRoomStore((state) => state.error);

  const errorCode = useRoomStore((state) => state.errorCode);

  const loadRoom = useRoomStore((state) => state.loadRoom);

  const joinRoom = useRoomStore((state) => state.joinRoom);

  const leaveRoom = useRoomStore((state) => state.leaveRoom);

  const setReady = useRoomStore((state) => state.setReady);

  const applyRoomUpdate = useRoomStore((state) => state.applyRoomUpdate);

  const clearCurrentRoom = useRoomStore((state) => state.clearCurrentRoom);

  const setGameSession = useGameStore((state) => state.setGameSession);

  const [preview, setPreview] = useState<RoomPreviewDto | null>(null);

  const [previewError, setPreviewError] = useState<string | null>(null);

  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const [joinError, setJoinError] = useState<string | null>(null);

  /**
   * Первая загрузка:
   * 1) пробуем загрузить комнату как участник;
   * 2) если пользователь не участник — тянем публичное превью.
   */
  useEffect(() => {
    if (!roomId) {
      navigate("/lobby", { replace: true });
      return;
    }

    void loadRoom(roomId);
  }, [roomId, loadRoom, navigate]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    if (errorCode !== "NOT_ROOM_MEMBER") {
      return;
    }

    let cancelled = false;

    async function loadPreview() {
      setPreviewError(null);

      try {
        const data = await getRoomPreview(roomId!);

        if (cancelled) {
          return;
        }

        setPreview(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPreviewError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить комнату",
        );
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [roomId, errorCode]);

  /**
   * Realtime-подписка на комнату.
   *
   * Работает только если мы уже участник —
   * иначе подписка не нужна.
   */
  useEffect(() => {
    if (!roomId || !currentRoom) {
      return;
    }

    const handleConnect = () => {
      socket.emit(SOCKET_EVENTS.ROOM_SUBSCRIBE, { roomId });
    };

    const handleRoomUpdated = (payload: RoomUpdatedPayload) => {
      if (payload.room.id === roomId) {
        applyRoomUpdate(payload.room);
      }
    };

    const handleRoomDeleted = (payload: RoomDeletedPayload) => {
      if (payload.roomId !== roomId) {
        return;
      }

      clearCurrentRoom();

      navigate("/lobby", { replace: true });
    };

    const handleGameStarted = (payload: GameStartedPayload) => {
      setGameSession(payload.gameState, payload.characters);

      navigate(`/game/${payload.gameState.id}`);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.ROOM_DELETED, handleRoomDeleted);
    socket.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      socket.off(SOCKET_EVENTS.ROOM_DELETED, handleRoomDeleted);
      socket.off(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);

      socket.emit(SOCKET_EVENTS.ROOM_UNSUBSCRIBE, { roomId });
    };
  }, [
    roomId,
    currentRoom,
    navigate,
    applyRoomUpdate,
    clearCurrentRoom,
    setGameSession,
  ]);

  async function handleLeaveRoom() {
    if (!currentRoom) {
      return;
    }

    const roomId = currentRoom.id;

    await leaveRoom(roomId);

    const currentError = useRoomStore.getState().error;

    if (currentError) {
      return;
    }

    navigate("/lobby", { replace: true });
  }

  async function handleToggleReady() {
    if (!currentRoom || !user) {
      return;
    }

    const self = currentRoom.members.find(
      (member) => member.userId === user.id,
    );

    if (!self) {
      return;
    }

    await setReady(currentRoom.id, !self.isReady);
  }

  function handleStartGame() {
    if (!currentRoom) {
      return;
    }

    socket.emit(SOCKET_EVENTS.GAME_START, {
      roomId: currentRoom.id,
    });
  }

  async function handleCopyInvite() {
    if (!currentRoom) {
      return;
    }

    const url = `${window.location.origin}/room/${currentRoom.id}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopyStatus("Ссылка скопирована");
    } catch {
      setCopyStatus("Не удалось скопировать");
    }

    setTimeout(() => setCopyStatus(null), 2000);
  }

  async function handleJoinFromPreview() {
    if (!roomId || !preview) {
      return;
    }

    setJoinError(null);

    const room = await joinRoom(roomId);

    if (room) {
      setPreview(null);
      return;
    }

    const currentError =
      useRoomStore.getState().error ?? "Не удалось войти в комнату";

    setJoinError(currentError);
  }

  /* ---------- Загрузка ---------- */

  if (isLoading && !preview) {
    return (
      <MainLayout>
        <main className="room-page">
          <section className="room-page__loading">
            <p className="room-page__eyebrow">КОМНАТА</p>

            <h1 className="room-page__title">Загружаем комнату...</h1>
          </section>
        </main>
      </MainLayout>
    );
  }

  /* ---------- Превью (не участник) ---------- */

  if (!currentRoom && errorCode === "NOT_ROOM_MEMBER") {
    if (previewError) {
      return (
        <MainLayout>
          <main className="room-page">
            <section className="room-page__error">
              <p className="room-page__eyebrow">ОШИБКА</p>

              <h1 className="room-page__title">Не удалось открыть комнату</h1>

              <p className="room-page__description">{previewError}</p>

              <button
                className="
                  room-page__button
                  room-page__button--secondary
                "
                type="button"
                onClick={() => navigate("/lobby", { replace: true })}
              >
                Вернуться в лобби
              </button>
            </section>
          </main>
        </MainLayout>
      );
    }

    if (!preview) {
      return (
        <MainLayout>
          <main className="room-page">
            <section className="room-page__loading">
              <p className="room-page__eyebrow">КОМНАТА</p>

              <h1 className="room-page__title">Загружаем приглашение...</h1>
            </section>
          </main>
        </MainLayout>
      );
    }

    const canJoin = preview.status === "WAITING";

    return (
      <MainLayout>
        <main className="room-page">
          <section className="room-page__invite">
            <p className="room-page__eyebrow">ПРИГЛАШЕНИЕ</p>

            <h1 className="room-page__code">{preview.code}</h1>

            <p className="room-page__description">
              Хост приглашает тебя в комнату.
            </p>

            <div className="room-page__invite-info">
              <div className="room-page__detail">
                <span>Хост</span>
                <strong>{preview.hostNickname}</strong>
              </div>

              <div className="room-page__detail">
                <span>Игроков</span>
                <strong>
                  {preview.membersCount} / {preview.maxPlayers}
                </strong>
              </div>

              <div className="room-page__detail">
                <span>Статус</span>
                <strong>
                  {preview.status === "WAITING"
                    ? "Ожидание игроков"
                    : preview.status === "PLAYING"
                      ? "Игра идёт"
                      : "Игра завершена"}
                </strong>
              </div>
            </div>

            {!canJoin && (
              <p className="room-page__invite-message">
                {preview.status === "PLAYING"
                  ? "Игра уже началась — присоединиться нельзя."
                  : "Игра завершена — присоединиться нельзя."}
              </p>
            )}

            {joinError && (
              <p className="room-page__invite-message room-page__invite-message--error">
                {joinError}
              </p>
            )}

            <div className="room-page__invite-actions">
              <button
                className="
                  room-page__button
                  room-page__button--primary
                "
                type="button"
                onClick={() => {
                  void handleJoinFromPreview();
                }}
                disabled={!canJoin || isMutating}
              >
                {isMutating ? "Присоединяемся..." : "Войти в комнату"}
              </button>

              <button
                className="
                  room-page__button
                  room-page__button--secondary
                "
                type="button"
                onClick={() => navigate("/lobby", { replace: true })}
              >
                Вернуться в лобби
              </button>
            </div>
          </section>
        </main>
      </MainLayout>
    );
  }

  /* ---------- Ошибка ---------- */

  if (error && !currentRoom) {
    return (
      <MainLayout>
        <main className="room-page">
          <section className="room-page__error">
            <p className="room-page__eyebrow">ОШИБКА</p>

            <h1 className="room-page__title">Не удалось открыть комнату</h1>

            <p className="room-page__description">{error}</p>

            <button
              className="
                room-page__button
                room-page__button--secondary
              "
              type="button"
              onClick={() => navigate("/lobby", { replace: true })}
            >
              Вернуться в лобби
            </button>
          </section>
        </main>
      </MainLayout>
    );
  }

  /* ---------- Заглушка загрузки ---------- */

  if (!currentRoom) {
    return (
      <MainLayout>
        <main className="room-page">
          <section className="room-page__loading">
            <p className="room-page__eyebrow">КОМНАТА</p>

            <h1 className="room-page__title">Загружаем комнату...</h1>
          </section>
        </main>
      </MainLayout>
    );
  }

  /* ---------- Основной экран комнаты ---------- */

  const isHost = currentRoom.hostUserId === user?.id;

  const self = user
    ? currentRoom.members.find((member) => member.userId === user.id)
    : undefined;

  const readyCount = currentRoom.members.filter(
    (member) => member.isReady,
  ).length;

  const hasMinPlayers = currentRoom.members.length >= ROOM_RULES.MIN_PLAYERS;

  const everyoneReady =
    currentRoom.members.length > 0 &&
    currentRoom.members.every((member) => member.isReady);

  const canStart = isHost && hasMinPlayers && everyoneReady;

  return (
    <MainLayout>
      <main className="room-page">
        <section className="room-page__header">
          <div>
            <p className="room-page__eyebrow">КОМНАТА</p>

            <h1 className="room-page__code">{currentRoom.code}</h1>

            <p className="room-page__description">
              Ожидание игроков перед началом игры.
            </p>

            <div className="room-page__invite-row">
              <button
                className="room-page__copy-button"
                type="button"
                onClick={() => {
                  void handleCopyInvite();
                }}
              >
                Скопировать приглашение
              </button>

              {copyStatus && (
                <span className="room-page__copy-status">{copyStatus}</span>
              )}
            </div>
          </div>

          <div className="room-page__meta">
            <span>Игроков</span>

            <strong>
              {currentRoom.members.length}
              {" / "}
              {currentRoom.maxPlayers}
            </strong>
          </div>
        </section>

        <section className="room-page__content">
          <div className="room-page__players">
            <div className="room-page__section-header">
              <div>
                <p className="room-page__eyebrow">УЧАСТНИКИ</p>

                <h2 className="room-page__section-title">Игроки</h2>
              </div>

              <span className="room-page__ready-counter">
                Готовы: {readyCount} / {currentRoom.members.length}
              </span>
            </div>

            <div className="room-page__players-list">
              {currentRoom.members.map((member) => {
                const memberIsHost = member.userId === currentRoom.hostUserId;

                const memberIsSelf = member.userId === user?.id;

                return (
                  <article
                    className={[
                      "room-page__player",
                      member.isReady ? "room-page__player--ready" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={member.userId}
                  >
                    <div className="room-page__player-main">
                      <strong>{member.user.profile.nickname}</strong>

                      <div className="room-page__player-tags">
                        {memberIsHost && (
                          <span className="room-page__player-tag">Хост</span>
                        )}

                        {memberIsSelf && (
                          <span className="room-page__player-tag room-page__player-tag--self">
                            Ты
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={[
                        "room-page__player-status",
                        member.isReady
                          ? "room-page__player-status--ready"
                          : "room-page__player-status--waiting",
                      ].join(" ")}
                    >
                      {member.isReady ? "Готов" : "Не готов"}
                    </span>
                  </article>
                );
              })}
            </div>

            {self && (
              <button
                className={[
                  "room-page__button",
                  "room-page__button--ready-toggle",
                  self.isReady ? "room-page__button--ghost" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                type="button"
                onClick={handleToggleReady}
                disabled={isMutating}
              >
                {self.isReady
                  ? isMutating
                    ? "Отменяем..."
                    : "Отменить готовность"
                  : isMutating
                    ? "Готовимся..."
                    : "Я готов"}
              </button>
            )}
          </div>

          <aside className="room-page__sidebar">
            <div className="room-page__room-info">
              <p className="room-page__eyebrow">ИНФОРМАЦИЯ</p>

              <div className="room-page__detail">
                <span>Хост</span>

                <strong>{currentRoom.host.profile.nickname}</strong>
              </div>

              <div className="room-page__detail">
                <span>Статус</span>

                <strong>
                  {canStart ? "Готовы к старту" : "Ожидание игроков"}
                </strong>
              </div>

              <div className="room-page__detail">
                <span>Готовы</span>

                <strong>
                  {readyCount}
                  {" / "}
                  {currentRoom.members.length}
                </strong>
              </div>
            </div>

            <div className="room-page__conditions">
              <p className="room-page__eyebrow">УСЛОВИЯ СТАРТА</p>

              <ul className="room-page__conditions-list">
                <li
                  className={[
                    "room-page__condition",
                    hasMinPlayers ? "room-page__condition--done" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  Минимум {ROOM_RULES.MIN_PLAYERS} игрока в комнате
                </li>

                <li
                  className={[
                    "room-page__condition",
                    everyoneReady ? "room-page__condition--done" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  Все игроки готовы
                </li>
              </ul>
            </div>

            {isHost && (
              <button
                className="
                  room-page__button
                  room-page__button--start
                "
                type="button"
                onClick={handleStartGame}
                disabled={!canStart}
              >
                Начать игру
              </button>
            )}

            <button
              className="
                room-page__button
                room-page__button--secondary
              "
              type="button"
              onClick={handleLeaveRoom}
              disabled={isMutating}
            >
              {isMutating ? "Выход..." : "Покинуть комнату"}
            </button>
          </aside>
        </section>
      </main>
    </MainLayout>
  );
}

export default RoomPage;
