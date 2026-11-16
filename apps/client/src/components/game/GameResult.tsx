import type { GameState, GameResultDto } from '@soul/shared';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getGameResult } from '../../services/api/games';
import { useAuthStore } from '../../stores/authStore';
import { useRoomStore } from '../../stores/roomStore';
import { useToastStore } from '../../stores/toastStore';

type GameResultProps = {
  gameState: GameState;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) {
    return '—';
  }

  const start = new Date(startedAt).getTime();

  const end = new Date(finishedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return '—';
  }

  const totalSeconds = Math.round((end - start) / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} сек`;
  }

  return `${minutes} мин ${seconds} сек`;
}

function GameResult({ gameState }: GameResultProps) {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const leaveRoom = useRoomStore((state) => state.leaveRoom);

  const createRoom = useRoomStore((state) => state.createRoom);

  const isMutating = useRoomStore((state) => state.isMutating);

  const pushToast = useToastStore((state) => state.push);

  const [result, setResult] = useState<GameResultDto | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isStartingNew, setIsStartingNew] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        const data = await getGameResult(gameState.id);

        if (cancelled) {
          return;
        }

        setResult(data);
      } catch {
        // Если результат ещё не записан (например,
        // сохранение в БД упало) — не показываем ошибку,
        // просто используем gameState.
        if (!cancelled) {
          setResult(null);
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
  }, [gameState.id]);

  // Если result не пришёл, собираем места из gameState.
  const fallbackPlayers = [...gameState.players]
    .sort((a, b) => {
      if (b.soul !== a.soul) {
        return b.soul - a.soul;
      }

      const aIsInitiator = a.id === gameState.finalRoundStartedBy;

      const bIsInitiator = b.id === gameState.finalRoundStartedBy;

      if (aIsInitiator && !bIsInitiator) {
        return -1;
      }

      if (!aIsInitiator && bIsInitiator) {
        return 1;
      }

      return 0;
    })
    .map((player, index) => ({
      userId: player.id,
      name: player.name,
      place: index + 1,
      finalSoul: player.soul
    }));

  const players = result?.players ?? fallbackPlayers;

  const winnerId = result?.winnerId ?? gameState.winnerId;

  const winner = players.find((p) => p.userId === winnerId);

  async function handleReturnToLobby() {
    try {
      await leaveRoom(gameState.id);
    } catch {
      // игнорируем — уходим в лобби в любом случае
    }

    navigate('/lobby');
  }

  async function handlePlayAgain() {
    setIsStartingNew(true);

    try {
      await leaveRoom(gameState.id);

      const room = await createRoom();

      if (!room) {
        pushToast('error', 'Не удалось создать комнату');

        setIsStartingNew(false);

        return;
      }

      navigate(`/room/${room.id}`);
    } catch {
      pushToast('error', 'Не удалось создать комнату');

      setIsStartingNew(false);
    }
  }

  return (
    <main className='game-result'>
      <section className='game-result__hero'>
        <p className='game-result__eyebrow'>ИГРА ЗАВЕРШЕНА</p>

        {winner ? (
          <h1 className='game-result__title'>
            Победил <span className='game-result__winner'>{winner.name}</span>
          </h1>
        ) : (
          <h1 className='game-result__title'>Ничья</h1>
        )}

        {result && (
          <p className='game-result__subtitle'>
            {result.turns} ход · {formatDuration(result.startedAt, result.finishedAt)}
          </p>
        )}
      </section>

      <section className='game-result__board'>
        <div className='game-result__board-header'>
          <p className='game-result__eyebrow'>ИТОГИ</p>

          <h2 className='game-result__board-title'>Финальная таблица</h2>
        </div>

        {isLoading ? (
          <p className='game-result__loading'>Загружаем результаты...</p>
        ) : (
          <div className='game-result__rows'>
            {players.map((player) => {
              const isSelf = player.userId === user?.id;

              const isWinner = player.userId === winnerId;

              return (
                <article
                  className={['game-result__row', isWinner ? 'game-result__row--winner' : '']
                    .filter(Boolean)
                    .join(' ')}
                  key={player.userId}
                >
                  <div className='game-result__row-place'>
                    <span className='game-result__place-number'>{player.place}</span>

                    <span className='game-result__place-label'>место</span>
                  </div>

                  <div className='game-result__row-name'>
                    <strong>{player.name}</strong>

                    {isSelf && <span className='game-result__row-tag'>Ты</span>}

                    {isWinner && (
                      <span className='game-result__row-tag game-result__row-tag--winner'>
                        Победитель
                      </span>
                    )}
                  </div>

                  <div className='game-result__row-soul'>
                    <span>Soul</span>

                    <strong>{player.finalSoul}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {result && (
          <div className='game-result__meta'>
            <div className='game-result__meta-item'>
              <span>Начало</span>
              <strong>{formatDateTime(result.startedAt)}</strong>
            </div>

            <div className='game-result__meta-item'>
              <span>Конец</span>
              <strong>{formatDateTime(result.finishedAt)}</strong>
            </div>

            <div className='game-result__meta-item'>
              <span>Длительность</span>
              <strong>{formatDuration(result.startedAt, result.finishedAt)}</strong>
            </div>
          </div>
        )}
      </section>

      <section className='game-result__actions'>
        <button
          className='game-result__button game-result__button--primary'
          type='button'
          onClick={() => {
            void handlePlayAgain();
          }}
          disabled={isMutating || isStartingNew}
        >
          {isStartingNew ? 'Создаём комнату...' : 'Играть снова'}
        </button>

        <button
          className='game-result__button'
          type='button'
          onClick={() => {
            void handleReturnToLobby();
          }}
          disabled={isMutating || isStartingNew}
        >
          Вернуться в лобби
        </button>
      </section>
    </main>
  );
}

export default GameResult;
