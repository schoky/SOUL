import type { LeaderboardEntryDto } from '@soul/shared';
import { useEffect, useState } from 'react';

import MainLayout from '../../components/layout/MainLayout';
import { getLeaderboard } from '../../services/api/leaderboard';

function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(50)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <main className='leaderboard-page'>
        <div className='leaderboard-page__header'>
          <p className='leaderboard-page__eyebrow'>РЕЙТИНГ</p>
          <h1 className='leaderboard-page__title'>Таблица лидеров</h1>
        </div>

        {loading ? (
          <p className='leaderboard-page__loading'>Загрузка...</p>
        ) : (
          <div className='leaderboard-page__table'>
            <div className='leaderboard-page__row leaderboard-page__row--head'>
              <span>#</span>
              <span>Игрок</span>
              <span>Победы</span>
              <span>Матчи</span>
              <span>Всего Soul</span>
              <span>Лучший Soul</span>
            </div>
            {entries.map((entry, index) => (
              <div className='leaderboard-page__row' key={entry.userId}>
                <span className='leaderboard-page__place'>{index + 1}</span>
                <span className='leaderboard-page__name'>{entry.name}</span>
                <span>{entry.wins}</span>
                <span>{entry.gamesPlayed}</span>
                <span>{entry.totalSoul}</span>
                <span>{entry.bestSoul}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
}

export default LeaderboardPage;
