import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import { useAuthStore } from "../../stores/authStore";
import { useRoomStore } from "../../stores/roomStore";

function getRoomCountLabel(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${count} комната`;
  }

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
  ) {
    return `${count} комнаты`;
  }

  return `${count} комнат`;
}

function LobbyPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const rooms = useRoomStore((state) => state.rooms);
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const isLoading = useRoomStore((state) => state.isLoading);
  const isMutating = useRoomStore((state) => state.isMutating);
  const storeError = useRoomStore((state) => state.error);

  const loadRooms = useRoomStore((state) => state.loadRooms);
  const createRoom = useRoomStore((state) => state.createRoom);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);

  const [roomCode, setRoomCode] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadRooms(user.id);
  }, [loadRooms, user]);

  async function handleCreateRoom() {
    setActionMessage(null);

    const room = await createRoom();

    if (!room) {
      return;
    }

    navigate(`/room/${room.id}`);
  }

  async function handleJoinRoomById(roomId: string) {
    setActionMessage(null);

    const room = await joinRoom(roomId);

    if (!room) {
      return;
    }

    navigate(`/room/${room.id}`);
  }

  async function handleJoinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = roomCode.trim().toUpperCase();

    if (normalizedCode.length !== 6) {
      return;
    }

    const room = rooms.find((item) => item.code === normalizedCode);

    if (!room) {
      setActionMessage("Комната с таким кодом не найдена");
      return;
    }

    const joinedRoom = await joinRoom(room.id);

    if (!joinedRoom) {
      return;
    }

    setRoomCode("");
    navigate(`/room/${joinedRoom.id}`);
  }

  async function handleLeaveRoom() {
    if (!currentRoom) {
      return;
    }

    setActionMessage(null);

    const leftRoom = await leaveRoom(currentRoom.id);

    const currentError = useRoomStore.getState().error;

    if (currentError) {
      return;
    }

    if (leftRoom) {
      setActionMessage(`Ты покинул комнату ${leftRoom.code}`);
      return;
    }

    setActionMessage("Ты покинул комнату");
  }

  function handleEnterCurrentRoom() {
    if (!currentRoom) {
      return;
    }

    if (currentRoom.status === "PLAYING") {
      navigate(`/game/${currentRoom.id}`);
      return;
    }

    navigate(`/room/${currentRoom.id}`);
  }

  return (
    <MainLayout>
      <main className="lobby-page">
        <section className="lobby-page__hero">
          <div>
            <p className="lobby-page__eyebrow">ИГРОВОЕ ЛОББИ</p>

            <h1 className="lobby-page__title">Найди свою игру</h1>

            <p className="lobby-page__description">
              Создай комнату или присоединись к уже существующей.
            </p>
          </div>

          <div className="lobby-page__player">
            <span className="lobby-page__player-label">ТЫ ИГРАЕШЬ КАК</span>

            <strong className="lobby-page__player-name">
              {user?.profile.nickname}
            </strong>
          </div>
        </section>

        {currentRoom && (
          <section className="lobby-page__active-room">
            <div className="lobby-page__active-room-info">
              <p className="lobby-page__eyebrow">ТЫ УЖЕ В КОМНАТЕ</p>

              <h2 className="lobby-page__active-room-code">
                {currentRoom.code}
              </h2>

              <p className="lobby-page__active-room-status">
                {currentRoom.status === "WAITING"
                  ? "Ожидание игроков"
                  : currentRoom.status === "PLAYING"
                    ? "Игра идёт"
                    : "Игра завершена"}
                {" · "}
                {currentRoom.members.length} / {currentRoom.maxPlayers} игроков
              </p>
            </div>

            <div className="lobby-page__active-room-actions">
              <button
                className="
                  lobby-page__action-button
                "
                type="button"
                onClick={handleEnterCurrentRoom}
                disabled={isMutating}
              >
                {currentRoom.status === "PLAYING"
                  ? "Вернуться в игру"
                  : "Вернуться в комнату"}
              </button>

              <button
                className="
                  lobby-page__action-button
                  lobby-page__action-button--secondary
                "
                type="button"
                onClick={handleLeaveRoom}
                disabled={isMutating}
              >
                {isMutating ? "Выходим..." : "Покинуть комнату"}
              </button>
            </div>
          </section>
        )}

        <section className="lobby-page__actions">
          <article
            className="
              lobby-page__action
              lobby-page__action--primary
            "
          >
            <div className="lobby-page__action-number">01</div>

            <div className="lobby-page__action-content">
              <h2 className="lobby-page__action-title">Создать комнату</h2>

              <p className="lobby-page__action-description">
                Создай новую игру и пригласи других игроков.
              </p>

              <button
                className="lobby-page__action-button"
                type="button"
                onClick={handleCreateRoom}
                disabled={isMutating || currentRoom !== null}
              >
                {isMutating ? "Создание..." : "Создать комнату"}
              </button>
            </div>
          </article>

          <article className="lobby-page__action">
            <div className="lobby-page__action-number">02</div>

            <div className="lobby-page__action-content">
              <h2 className="lobby-page__action-title">Войти по коду</h2>

              <p className="lobby-page__action-description">
                Введи код комнаты, который передал тебе хост.
              </p>

              <form className="lobby-page__join-form" onSubmit={handleJoinRoom}>
                <input
                  className="lobby-page__join-input"
                  type="text"
                  value={roomCode}
                  onChange={(event) =>
                    setRoomCode(
                      event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, ""),
                    )
                  }
                  placeholder="КОД КОМНАТЫ"
                  maxLength={6}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={currentRoom !== null}
                />

                <button
                  className="
                    lobby-page__action-button
                    lobby-page__action-button--secondary
                  "
                  type="submit"
                  disabled={
                    roomCode.length !== 6 || isMutating || currentRoom !== null
                  }
                >
                  Войти
                </button>
              </form>
            </div>
          </article>
        </section>

        {(storeError || actionMessage) && (
          <div className="lobby-page__message">
            {storeError || actionMessage}
          </div>
        )}

        <section className="lobby-page__rooms">
          <div className="lobby-page__rooms-header">
            <div>
              <p className="lobby-page__eyebrow">ОТКРЫТЫЕ ИГРЫ</p>

              <h2 className="lobby-page__section-title">Доступные комнаты</h2>
            </div>

            <span className="lobby-page__rooms-count">
              {getRoomCountLabel(rooms.length)}
            </span>
          </div>

          {isLoading ? (
            <div className="lobby-page__rooms-empty">
              <div className="lobby-page__rooms-empty-icon">...</div>

              <h3 className="lobby-page__rooms-empty-title">
                Загружаем комнаты
              </h3>

              <p className="lobby-page__rooms-empty-description">
                Получаем актуальный список игр.
              </p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="lobby-page__rooms-empty">
              <div className="lobby-page__rooms-empty-icon">+</div>

              <h3 className="lobby-page__rooms-empty-title">
                Пока нет открытых комнат
              </h3>

              <p className="lobby-page__rooms-empty-description">
                Создай первую комнату и начни игру.
              </p>
            </div>
          ) : (
            <div className="lobby-page__rooms-list">
              {rooms.map((room) => (
                <article className="lobby-page__room-card" key={room.id}>
                  <div className="lobby-page__room-info">
                    <div className="lobby-page__room-main">
                      <span className="lobby-page__room-code">{room.code}</span>

                      <span className="lobby-page__room-host">
                        Хост: {room.host.profile.nickname}
                      </span>
                    </div>

                    <div className="lobby-page__room-players">
                      {room.members.length}
                      {" / "}
                      {room.maxPlayers}
                    </div>
                  </div>

                  <button
                    className="
                      lobby-page__action-button
                      lobby-page__action-button--secondary
                    "
                    type="button"
                    onClick={() => handleJoinRoomById(room.id)}
                    disabled={isMutating || currentRoom !== null}
                  >
                    Войти
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}

export default LobbyPage;
