import { useEffect, useState } from "react";

import { SOCKET_EVENTS } from "@soul/shared";

import {
  type AdminRoom,
  forceFinishRoom,
  getAdminRooms,
} from "../../services/api/admin";

import { socket } from "../../services/socket";

function AdminRooms() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [confirmingRoomId, setConfirmingRoomId] = useState<string | null>(null);

  const [processingRoomId, setProcessingRoomId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function loadRooms() {
    const data = await getAdminRooms();

    setRooms(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const data = await getAdminRooms();

        if (!cancelled) {
          setRooms(data);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: любое изменение комнаты — перечитываем список.
  useEffect(() => {
    function handleUpdate() {
      void loadRooms();
    }

    socket.on(SOCKET_EVENTS.ADMIN_ROOMS_UPDATED, handleUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.ADMIN_ROOMS_UPDATED, handleUpdate);
    };
  }, []);

  async function handleForceFinish(roomId: string) {
    setProcessingRoomId(roomId);
    setError(null);

    try {
      await forceFinishRoom(roomId);

      await loadRooms();

      setConfirmingRoomId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось завершить комнату",
      );
    } finally {
      setProcessingRoomId(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__eyebrow">КОМНАТЫ</p>

        <h1 className="admin-page__title">Активные комнаты</h1>
      </header>

      {error && <p className="admin-error">{error}</p>}

      {isLoading && <p className="admin-loading">Загружаем…</p>}

      {!isLoading && rooms.length === 0 && (
        <p className="admin-empty">Сейчас нет активных комнат</p>
      )}

      {!isLoading && rooms.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Статус</th>
                <th>Хост</th>
                <th>Игроков</th>
                <th>Создана</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td data-label="Код">
                    <strong>{room.code}</strong>
                  </td>

                  <td data-label="Статус">
                    <span
                      className={[
                        "admin-badge",
                        room.status === "PLAYING"
                          ? "admin-badge--warning"
                          : "admin-badge--success",
                      ].join(" ")}
                    >
                      {room.status}
                    </span>
                  </td>

                  <td data-label="Хост">{room.host.nickname}</td>

                  <td data-label="Игроков">
                    {room.members.length} / {room.maxPlayers}
                  </td>

                  <td data-label="Создана">
                    {new Date(room.createdAt).toLocaleString("ru-RU")}
                  </td>

                  <td data-label="Действия">
                    {confirmingRoomId === room.id ? (
                      <div className="admin-table__actions">
                        <button
                          className="admin-button admin-button--small admin-button--danger"
                          type="button"
                          disabled={processingRoomId === room.id}
                          onClick={() => {
                            void handleForceFinish(room.id);
                          }}
                        >
                          {processingRoomId === room.id
                            ? "Завершаем…"
                            : "Да, завершить"}
                        </button>

                        <button
                          className="admin-button admin-button--small"
                          type="button"
                          disabled={processingRoomId === room.id}
                          onClick={() => setConfirmingRoomId(null)}
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <div className="admin-table__actions">
                        <button
                          className="admin-button admin-button--small admin-button--danger"
                          type="button"
                          onClick={() => setConfirmingRoomId(room.id)}
                        >
                          Завершить
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminRooms;
