import { SOCKET_EVENTS } from '@soul/shared';
import { useEffect, useState } from 'react';

import { type AdminActiveGame, getAdminActiveGames } from '../../services/api/admin';
import { socket } from '../../services/socket';

function AdminActiveGames() {
  const [games, setGames] = useState<AdminActiveGame[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    const data = await getAdminActiveGames();

    setGames(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const data = await getAdminActiveGames();

        if (!cancelled) {
          setGames(data);
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

  // Realtime: любое обновление игры — перечитываем список.
  useEffect(() => {
    function handleUpdate() {
      void load();
    }

    socket.on(SOCKET_EVENTS.ADMIN_GAMES_UPDATED, handleUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.ADMIN_GAMES_UPDATED, handleUpdate);
    };
  }, []);

  return (
    <div className='admin-page'>
      <header className='admin-page__header'>
        <p className='admin-page__eyebrow'>ИГРЫ</p>

        <h1 className='admin-page__title'>Активные партии</h1>
      </header>

      {isLoading && <p className='admin-loading'>Загружаем…</p>}

      {!isLoading && games.length === 0 && (
        <p className='admin-empty'>Сейчас нет активных партий</p>
      )}

      {!isLoading && games.length > 0 && (
        <div className='admin-table-wrapper'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Комната</th>
                <th>Ход</th>
                <th>Сейчас ходит</th>
                <th>Игроков</th>
                <th>Начало</th>
              </tr>
            </thead>

            <tbody>
              {games.map((game) => {
                const currentPlayer = game.players.find((p) => p.userId === game.currentPlayerId);

                return (
                  <tr key={game.id}>
                    <td data-label='Комната'>
                      <strong>{game.roomCode}</strong>
                    </td>

                    <td data-label='Ход'>{game.turnNumber}</td>

                    <td data-label='Сейчас ходит'>{currentPlayer?.nickname ?? '—'}</td>

                    <td data-label='Игроков'>{game.players.length}</td>

                    <td data-label='Начало'>{new Date(game.startedAt).toLocaleString('ru-RU')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminActiveGames;
