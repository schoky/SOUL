import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import { getMyGames } from "../../services/api/history";

import type { GameHistoryItemDto } from "@soul/shared";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryPage() {
  const [games, setGames] = useState<GameHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyGames(20)
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <main className="history-page">
        <div className="history-page__header">
          <p className="history-page__eyebrow">ИСТОРИЯ</p>
          <h1 className="history-page__title">Мои матчи</h1>
        </div>

        {loading ? (
          <p className="history-page__loading">Загрузка...</p>
        ) : games.length === 0 ? (
          <p className="history-page__empty">
            У вас ещё нет завершённых матчей.
          </p>
        ) : (
          <div className="history-page__list">
            {games.map((game) => (
              <Link
                to={`/game/${game.roomId}`}
                key={game.gameId}
                className="history-page__item"
              >
                <div className="history-page__item-main">
                  <span className="history-page__date">
                    {formatDate(game.startedAt)}
                  </span>
                  <span className="history-page__place">
                    Место: {game.place} из {game.players.length}
                  </span>
                </div>
                <div className="history-page__item-soul">
                  <span>Soul</span>
                  <strong>{game.finalSoul}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
}

export default HistoryPage;
