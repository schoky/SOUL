import { useEffect, useState } from "react";

import { getAdminRooms, type AdminRoom } from "../../services/api/admin";

function AdminRooms() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__eyebrow">КОМНАТЫ</p>

        <h1 className="admin-page__title">Активные комнаты</h1>
      </header>

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
              </tr>
            </thead>

            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <strong>{room.code}</strong>
                  </td>
                  <td>
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
                  <td>{room.host.nickname}</td>
                  <td>
                    {room.members.length} / {room.maxPlayers}
                  </td>
                  <td>{new Date(room.createdAt).toLocaleString("ru-RU")}</td>
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
