import { useEffect, useState } from "react";

import { getAdminStats, type AdminStats } from "../../services/api/admin";

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAdminStats();

        if (!cancelled) {
          setStats(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Ошибка");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  if (!stats) {
    return <p className="admin-loading">Загружаем…</p>;
  }

  const tiles: Array<{
    label: string;
    value: number;
  }> = [
    { label: "Всего игроков", value: stats.totalUsers },
    { label: "Сейчас онлайн", value: stats.onlineUsers },
    { label: "Завершённых партий", value: stats.totalGames },
    { label: "Активных комнат", value: stats.activeRooms },
    { label: "Игр в процессе", value: stats.activeGames },
    {
      label: "Новостей без публикации",
      value: stats.unpublishedNews,
    },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <p className="admin-page__eyebrow">ОБЗОР</p>

        <h1 className="admin-page__title">Статистика сервера</h1>
      </header>

      <div className="admin-stats">
        {tiles.map((tile) => (
          <article className="admin-stats__tile" key={tile.label}>
            <span>{tile.label}</span>
            <strong>{tile.value}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
