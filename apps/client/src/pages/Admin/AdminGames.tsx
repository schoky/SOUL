import { useEffect, useState } from "react";

import { getAdminGames, type AdminGame } from "../../services/api/admin";

function AdminGames() {
  const [games, setGames] = useState<AdminGame[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAdminGames();

        if (!cancelled) {
          setGames(data);
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
        <p className="admin-page__eyebrow">ИГРЫ</p>

        <h1 className="admin-page__title">Последние партии</h1>
      </header>

      {isLoading && <p className="admin-loading">Загружаем…</p>}

      {!isLoading && games.length === 0 && (
        <p className="admin-empty">Ещё не было партий</p>
      )}

      {!isLoading && games.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Комната</th>
                <th>Статус</th>
                <th>Игроков</th>
                <th>Победитель</th>
                <th>Начало</th>
                <th>Конец</th>
              </tr>
            </thead>

            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <strong>{game.roomCode}</strong>
                  </td>
                  <td>
                    <span
                      className={[
                        "admin-badge",
                        game.status === "PLAYING"
                          ? "admin-badge--warning"
                          : "admin-badge--success",
                      ].join(" ")}
                    >
                      {game.status}
                    </span>
                  </td>
                  <td>{game.playersCount}</td>
                  <td>{game.winner?.nickname ?? "—"}</td>
                  <td>{new Date(game.startedAt).toLocaleString("ru-RU")}</td>
                  <td>
                    {game.finishedAt
                      ? new Date(game.finishedAt).toLocaleString("ru-RU")
                      : "—"}
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

export default AdminGames;
