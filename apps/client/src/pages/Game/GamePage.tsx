import {
  type Character,
  GAME_RULES,
  type GameEndTurnPayload,
  type GameEventResolvedPayload,
  type GamePlayEventPayload,
  type GameSessionPayload,
  type GameStartedPayload,
  type GameStateUpdatedPayload,
  type PlayerCharacter,
  type PlayerConnectionPayload,
  type PlayersConnectionPayload,
  RISK_CHANCES,
  SOCKET_EVENTS,
  type SocketErrorPayload,
  type StatType
} from '@soul/shared';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AbilityModal from '../../components/game/AbilityModal';
import CardImage from '../../components/game/CardImage';
import GameResult from '../../components/game/GameResult';
import MainLayout from '../../components/layout/MainLayout';
import Tooltip from '../../components/ui/Tooltip';
import { useYourTurnNotification } from '../../hooks/useYourTurnNotification';
import { socket } from '../../services/socket';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import { useToastStore } from '../../stores/toastStore';
import { playSound, playYourTurnSound } from '../../utils/sounds';

// Не хардкодим — берём из общих правил игры.
const MAX_CARDS_PER_ACTION = GAME_RULES.CHARACTERS_PER_PLAYER;
const WINNING_SOUL = GAME_RULES.WINNING_SOUL;
const RISK_FAILURE_PERCENT = Math.round(RISK_CHANCES.FAILURE * 100);

function findCharacter(characters: Character[], characterId: string): Character | undefined {
  return characters.find((item) => item.id === characterId);
}

function checkRequirements(
  stats: Record<StatType, number>,
  requirements: {
    farmila: number;
    perekup: number;
    tuller: number;
  }
): boolean {
  return (
    stats.farmila >= requirements.farmila &&
    stats.perekup >= requirements.perekup &&
    stats.tuller >= requirements.tuller
  );
}

function GamePage() {
  const navigate = useNavigate();

  const { roomId } = useParams<{
    roomId: string;
  }>();

  const user = useAuthStore((state) => state.user);

  const gameState = useGameStore((state) => state.gameState);

  const characters = useGameStore((state) => state.characters);

  const history = useGameStore((state) => state.history);

  const playersConnection = useGameStore((state) => state.playersConnection);

  const setGameSession = useGameStore((state) => state.setGameSession);

  const pushHistory = useGameStore((state) => state.pushHistory);

  const clearHistory = useGameStore((state) => state.clearHistory);

  const setPlayerConnection = useGameStore((state) => state.setPlayerConnection);

  const setPlayersConnection = useGameStore((state) => state.setPlayersConnection);

  const pushToast = useToastStore((state) => state.push);

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);

  const [finalRoundStartTurn, setFinalRoundStartTurn] = useState<number | null>(null);

  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);

  const [highlightedCharacterId, setHighlightedCharacterId] = useState<string | null>(null);

  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/lobby', {
        replace: true
      });

      return;
    }

    const handleConnect = () => {
      socket.emit(SOCKET_EVENTS.ROOM_SUBSCRIBE, {
        roomId
      });
    };

    const handleGameState = (payload: GameSessionPayload) => {
      setGameSession(payload.gameState, payload.characters);
    };

    const handleGameStarted = (payload: GameStartedPayload) => {
      clearHistory();

      setFinalRoundStartTurn(null);

      setGameSession(payload.gameState, payload.characters);
    };

    const handleGameStateUpdated = (payload: GameStateUpdatedPayload) => {
      setGameSession(payload.gameState, payload.characters);

      setSelectedCardIds([]);
    };

    const handleSocketError = (payload: SocketErrorPayload) => {
      setActionError(payload.message);

      pushToast('error', payload.message);
    };

    const handleEventResolved = (payload: GameEventResolvedPayload) => {
      const isSelf = payload.playerId === user?.id;

      const prefix = isSelf ? 'Ты' : payload.playerName;

      const soulDelta = payload.soulAfter - payload.soulBefore;

      const soulText =
        soulDelta > 0
          ? `+${soulDelta} Soul`
          : soulDelta < 0
            ? `${soulDelta} Soul`
            : 'без изменений Soul';

      // Звук играем только для себя — иначе будет
      // какофония, когда все ходят по кругу.
      if (isSelf) {
        if (!payload.risk) {
          playSound(payload.success ? 'success' : 'fail');
        } else {
          playSound(payload.riskWon ? 'risk-win' : 'risk-lose');
        }
      }

      const currentGameState = useGameStore.getState().gameState;

      pushHistory({
        turnNumber: currentGameState?.turnNumber ?? 0,
        playerId: payload.playerId,
        playerName: payload.playerName,
        eventName: currentGameState?.currentEvent?.name ?? 'Событие',
        success: payload.success,
        risk: payload.risk,
        riskWon: payload.riskWon,
        soulDelta
      });

      if (!payload.risk) {
        if (payload.success) {
          pushToast('success', `${prefix}: успех! ${soulText}`);
        } else {
          pushToast('error', `${prefix}: провал. ${soulText}`);
        }

        return;
      }

      if (payload.riskWon) {
        pushToast('success', `${prefix}: риск сработал! ${soulText}`);
        return;
      }

      pushToast('error', `${prefix}: риск не сработал. ${soulText}`);
    };

    const handlePlayerConnection = (payload: PlayerConnectionPayload) => {
      setPlayerConnection(payload.playerId, payload.connected);
    };

    const handlePlayersConnection = (payload: PlayersConnectionPayload) => {
      setPlayersConnection(payload.connections);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on(SOCKET_EVENTS.GAME_STATE, handleGameState);
    socket.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
    socket.on(SOCKET_EVENTS.GAME_STATE_UPDATED, handleGameStateUpdated);
    socket.on(SOCKET_EVENTS.GAME_EVENT_RESOLVED, handleEventResolved);
    socket.on(SOCKET_EVENTS.PLAYER_CONNECTION, handlePlayerConnection);
    socket.on(SOCKET_EVENTS.PLAYERS_CONNECTION, handlePlayersConnection);
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off(SOCKET_EVENTS.GAME_STATE, handleGameState);
      socket.off(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
      socket.off(SOCKET_EVENTS.GAME_STATE_UPDATED, handleGameStateUpdated);
      socket.off(SOCKET_EVENTS.GAME_EVENT_RESOLVED, handleEventResolved);
      socket.off(SOCKET_EVENTS.PLAYER_CONNECTION, handlePlayerConnection);
      socket.off(SOCKET_EVENTS.PLAYERS_CONNECTION, handlePlayersConnection);
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [
    roomId,
    navigate,
    setGameSession,
    pushToast,
    pushHistory,
    clearHistory,
    setPlayerConnection,
    setPlayersConnection,
    user?.id
  ]);

  useEffect(() => {
    if (!gameState) {
      return;
    }

    if (gameState.finalRoundStartedBy && finalRoundStartTurn === null) {
      setFinalRoundStartTurn(gameState.turnNumber);
    }

    if (!gameState.finalRoundStartedBy && finalRoundStartTurn !== null) {
      setFinalRoundStartTurn(null);
    }
  }, [gameState, finalRoundStartTurn]);

  useEffect(() => {
    setSelectedCardIds([]);
    setIsConfirmingSkip(false);
  }, [gameState?.currentPlayerId, gameState?.turnNumber]);

  // Звук завершения игры — один раз при переходе в finished.
  useEffect(() => {
    if (gameState?.status === 'finished') {
      playSound('game-over');
    }
  }, [gameState?.status]);

  const self = useMemo(() => {
    if (!gameState || !user) {
      return undefined;
    }

    return gameState.players.find((player) => player.id === user.id);
  }, [gameState, user]);

  const isMyTurn = !!gameState && !!user && gameState.currentPlayerId === user.id;

  const currentPlayer = gameState?.players.find(
    (player) => player.id === gameState.currentPlayerId
  );

  const selectedCharacters = useMemo(() => {
    if (!self) {
      return [];
    }

    return self.characters
      .filter((card) => selectedCardIds.includes(card.cardId))
      .map((card) => ({
        card,
        character: findCharacter(characters, card.characterId)
      }));
  }, [self, selectedCardIds, characters]);

  const stats = useMemo<Record<StatType, number>>(() => {
    const result: Record<StatType, number> = {
      farmila: 0,
      perekup: 0,
      tuller: 0
    };

    for (const item of selectedCharacters) {
      if (!item.character) {
        continue;
      }

      result.farmila += item.character.stats.farmila;
      result.perekup += item.character.stats.perekup;
      result.tuller += item.character.stats.tuller;
    }

    return result;
  }, [selectedCharacters]);

  const canSatisfy = useMemo(() => {
    if (!gameState?.currentEvent) {
      return false;
    }

    if (selectedCardIds.length === 0) {
      return false;
    }

    return checkRequirements(stats, gameState.currentEvent.requirements);
  }, [gameState?.currentEvent, selectedCardIds.length, stats]);

  // Список персонажей игрока — для модалки со способностями.
  const selfAbilities = useMemo<Character[]>(() => {
    if (!self) {
      return [];
    }

    return self.characters
      .map((card) => findCharacter(characters, card.characterId))
      .filter((item): item is Character => Boolean(item));
  }, [self, characters]);

  // Пропуски хода: сколько уже сделано подряд и сколько осталось.
  const skipsUsed = self?.consecutiveSkips ?? 0;
  const skipsRemaining = Math.max(0, GAME_RULES.MAX_CONSECUTIVE_SKIPS - skipsUsed);
  const canSkip = skipsRemaining > 0;

  const riskChance = canSatisfy ? RISK_CHANCES.SUCCESS : RISK_CHANCES.FAILURE;

  const riskPercent = Math.round(riskChance * 100);

  useYourTurnNotification({
    currentPlayerId: gameState?.currentPlayerId ?? null,
    userId: user?.id,
    onYourTurn: () => {
      playYourTurnSound();

      pushToast('info', 'Твой ход');
    }
  });

  function toggleCard(cardId: string) {
    if (!self) {
      return;
    }

    const card = self.characters.find((item) => item.cardId === cardId);

    if (!card || card.exhausted) {
      return;
    }

    setActionError(null);

    setSelectedCardIds((previous) => {
      if (previous.includes(cardId)) {
        playSound('card-deselect');
        return previous.filter((id) => id !== cardId);
      }

      if (previous.length >= MAX_CARDS_PER_ACTION) {
        return previous;
      }

      playSound('card-select');
      return [...previous, cardId];
    });
  }

  function openAbilityModal(characterId: string | null = null) {
    setHighlightedCharacterId(characterId);
    setIsAbilityModalOpen(true);
  }

  function closeAbilityModal() {
    setIsAbilityModalOpen(false);
    setHighlightedCharacterId(null);
  }

  function handlePlayEvent(risk: boolean) {
    if (!gameState || selectedCardIds.length === 0) {
      return;
    }

    setActionError(null);

    const payload: GamePlayEventPayload = {
      roomId: gameState.id,
      characterCardIds: selectedCardIds,
      risk
    };

    socket.emit(SOCKET_EVENTS.GAME_PLAY_EVENT, payload);
  }

  function handleSkipTurn() {
    if (!gameState || !isMyTurn) {
      return;
    }

    setActionError(null);
    setIsConfirmingSkip(false);

    const payload: GameEndTurnPayload = {
      roomId: gameState.id
    };

    socket.emit(SOCKET_EVENTS.GAME_END_TURN, payload);
  }

  if (!gameState) {
    return (
      <MainLayout>
        <main className='game-page'>
          <section className='game-page__empty'>
            <p className='game-page__eyebrow'>ИГРА</p>

            <h1 className='game-page__title'>Подключаемся...</h1>

            <p className='game-page__description'>Загружаем состояние игры.</p>
          </section>
        </main>
      </MainLayout>
    );
  }

  if (gameState.status === 'finished') {
    return (
      <MainLayout>
        <GameResult gameState={gameState} />
      </MainLayout>
    );
  }

  const event = gameState.currentEvent;

  const requirementByStat: Record<StatType, number> | null = event
    ? {
        farmila: event.requirements.farmila,
        perekup: event.requirements.perekup,
        tuller: event.requirements.tuller
      }
    : null;

  const finalRoundInitiator = gameState.finalRoundStartedBy
    ? gameState.players.find((player) => player.id === gameState.finalRoundStartedBy)
    : null;

  const isFinalRound = finalRoundInitiator !== null;

  const isSelfFinalRoundInitiator = !!user && gameState.finalRoundStartedBy === user.id;

  const maxSoul = gameState.players.reduce((acc, player) => Math.max(acc, player.soul), 0);

  const soulToFinal = Math.max(0, WINNING_SOUL - maxSoul);

  const soulProgressPercent = Math.min(100, Math.round((maxSoul / WINNING_SOUL) * 100));

  const finalRoundTurnsRemaining =
    isFinalRound && finalRoundStartTurn !== null
      ? Math.max(0, gameState.players.length - (gameState.turnNumber - finalRoundStartTurn))
      : null;

  return (
    <MainLayout>
      <main className='game-page'>
        {!isFinalRound && (
          <section className='game-page__progress'>
            <div className='game-page__progress-header'>
              <span className='game-page__progress-label'>До финала</span>

              <span className='game-page__progress-value'>
                {soulToFinal > 0 ? `${soulToFinal} Soul` : 'готово'}
              </span>
            </div>

            <div className='game-page__progress-bar'>
              <div
                className='game-page__progress-fill'
                style={{ width: `${soulProgressPercent}%` }}
              />
            </div>

            <p className='game-page__progress-hint'>
              Лидер: {maxSoul} / {WINNING_SOUL} Soul
            </p>
          </section>
        )}

        {finalRoundInitiator && (
          <section
            className={[
              'game-page__final-banner',
              isSelfFinalRoundInitiator ? 'game-page__final-banner--initiator' : '',
              isMyTurn ? 'game-page__final-banner--active' : ''
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <p className='game-page__final-banner-eyebrow'>ФИНАЛЬНЫЙ РАУНД</p>

            {isSelfFinalRoundInitiator ? (
              <h2 className='game-page__final-banner-title'>Ты запустил финальный раунд</h2>
            ) : (
              <h2 className='game-page__final-banner-title'>
                {finalRoundInitiator.name} достиг {finalRoundInitiator.soul} Soul
              </h2>
            )}

            <p className='game-page__final-banner-description'>
              {isSelfFinalRoundInitiator
                ? 'Остальные игроки делают по одному последнему ходу. Кто наберёт больше Soul — победит.'
                : isMyTurn
                  ? 'У тебя последний ход. Постарайся набрать больше Soul, чем лидер.'
                  : 'Все игроки доигрывают свои последние ходы. Победит тот, у кого больше Soul.'}
            </p>

            {finalRoundTurnsRemaining !== null && (
              <p className='game-page__final-banner-turns'>
                Осталось ходов: {finalRoundTurnsRemaining}
              </p>
            )}
          </section>
        )}

        <section className='game-page__header'>
          <div>
            <p className='game-page__eyebrow'>ИГРА</p>

            <h1 className='game-page__title'>Ход {gameState.turnNumber}</h1>

            <p className='game-page__description'>
              Сейчас ходит: <strong>{currentPlayer?.name ?? '—'}</strong>
            </p>
          </div>

          <div className='game-page__meta'>
            <span>Статус</span>

            <strong>{gameState.status}</strong>
          </div>
        </section>

        <section className='game-page__content'>
          <div className='game-page__event'>
            <p className='game-page__eyebrow'>СОБЫТИЕ</p>

            {event ? (
              <>
                <div className='game-page__event-image'>
                  <CardImage
                    src={event.image}
                    fallbackSrc={`/cards/events/${event.id}.webp`}
                    alt={event.name}
                    placeholderLabel={event.name}
                  />
                </div>

                <h2 className='game-page__event-title'>{event.name}</h2>

                <p className='game-page__event-description'>{event.description}</p>

                <div className='game-page__requirements'>
                  <div className='game-page__requirement'>
                    <span>Фармила</span>

                    <strong>{event.requirements.farmila}</strong>
                  </div>

                  <div className='game-page__requirement'>
                    <span>Перекуп</span>

                    <strong>{event.requirements.perekup}</strong>
                  </div>

                  <div className='game-page__requirement'>
                    <span>Туллер</span>

                    <strong>{event.requirements.tuller}</strong>
                  </div>
                </div>

                <div className='game-page__event-main'>
                  <span>Основная характеристика</span>

                  <strong>{event.mainStat}</strong>
                </div>

                <div className='game-page__rewards'>
                  <div className='game-page__reward'>
                    <span>Награда</span>

                    <strong>+{event.reward} Soul</strong>
                  </div>

                  <div className='game-page__reward'>
                    <span>Риск</span>

                    <strong>+{event.riskReward} Soul</strong>
                  </div>
                </div>
              </>
            ) : (
              <p className='game-page__description'>Событие не задано.</p>
            )}
          </div>

          <aside className='game-page__players'>
            <p className='game-page__eyebrow'>ИГРОКИ</p>

            <div className='game-page__players-list'>
              {gameState.players.map((player) => {
                const isCurrent = player.id === gameState.currentPlayerId;

                const isFinalInitiator = player.id === gameState.finalRoundStartedBy;

                const isDisconnected = playersConnection[player.id] === false;

                return (
                  <article
                    className={[
                      'game-page__player',
                      isCurrent ? 'game-page__player--active' : '',
                      isFinalInitiator ? 'game-page__player--final' : '',
                      isDisconnected ? 'game-page__player--disconnected' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={player.id}
                  >
                    <div className='game-page__player-header'>
                      <strong>{player.name}</strong>

                      <div className='game-page__player-tags'>
                        {isFinalInitiator && (
                          <span className='game-page__player-tag game-page__player-tag--final'>
                            Финал
                          </span>
                        )}

                        {isDisconnected && (
                          <span className='game-page__player-tag game-page__player-tag--offline'>
                            Отключён
                          </span>
                        )}

                        {isCurrent && !isDisconnected && (
                          <span className='game-page__player-tag'>Ходит</span>
                        )}
                      </div>
                    </div>

                    <div className='game-page__player-stats'>
                      <div>
                        <span>Soul</span>

                        <strong>{player.soul}</strong>
                      </div>

                      <div>
                        <span>Персонажей</span>

                        <strong>{player.characters.length}</strong>
                      </div>

                      {player.consecutiveSkips > 0 && (
                        <div>
                          <span>Пропусков</span>

                          <strong>{player.consecutiveSkips}</strong>
                        </div>
                      )}
                    </div>

                    {isDisconnected && isCurrent && (
                      <p className='game-page__player-offline-hint'>
                        Ход будет передан через 30 секунд.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {history.length > 0 && (
              <div className='game-page__history'>
                <p className='game-page__eyebrow'>ИСТОРИЯ ХОДОВ</p>

                <div className='game-page__history-list'>
                  {history.map((entry, index) => {
                    const isRisk = entry.risk;

                    const resultLabel = !isRisk
                      ? entry.success
                        ? 'успех'
                        : 'провал'
                      : entry.riskWon
                        ? 'риск сработал'
                        : 'риск не сработал';

                    const soulText =
                      entry.soulDelta > 0
                        ? `+${entry.soulDelta}`
                        : entry.soulDelta < 0
                          ? `${entry.soulDelta}`
                          : '0';

                    return (
                      <div
                        className={[
                          'game-page__history-entry',
                          entry.success
                            ? 'game-page__history-entry--success'
                            : 'game-page__history-entry--failure'
                        ].join(' ')}
                        key={`${entry.turnNumber}-${index}`}
                      >
                        <span className='game-page__history-turn'>Ход {entry.turnNumber}</span>

                        <span className='game-page__history-text'>
                          <strong>{entry.playerName}</strong>: {resultLabel} ({soulText})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </section>

        {self && (
          <section
            className={['game-page__hand', isMyTurn ? 'game-page__hand--active' : '']
              .filter(Boolean)
              .join(' ')}
          >
            {isMyTurn && <div className='game-page__your-turn-banner'>Твой ход</div>}

            <div className='game-page__section-header'>
              <div>
                <p className='game-page__eyebrow'>ТВОИ ПЕРСОНАЖИ</p>

                <h2 className='game-page__section-title'>
                  {isMyTurn ? 'Выбери персонажей' : 'Ждём хода'}
                </h2>
              </div>

              <div className='game-page__counter-wrap'>
                <button
                  className='game-page__ability-button'
                  type='button'
                  onClick={() => openAbilityModal(null)}
                >
                  <span className='game-page__ability-button-icon'>?</span>

                  <span className='game-page__ability-button-label'>Способности</span>
                </button>

                <span className='game-page__counter'>
                  Выбрано: {selectedCardIds.length} / {MAX_CARDS_PER_ACTION}
                </span>
              </div>
            </div>

            <div
              className={['game-page__cards', !isMyTurn ? 'game-page__cards--inactive' : '']
                .filter(Boolean)
                .join(' ')}
              key={gameState.turnNumber}
            >
              {self.characters.map((card, index) => (
                <CharacterCard
                  card={card}
                  character={findCharacter(characters, card.characterId)}
                  isSelected={selectedCardIds.includes(card.cardId)}
                  isSelectable={isMyTurn}
                  onToggle={() => toggleCard(card.cardId)}
                  onOpenAbility={(characterId) => openAbilityModal(characterId)}
                  index={index}
                  key={card.cardId}
                />
              ))}
            </div>

            {selectedCardIds.length > 0 && (
              <div className='game-page__selection'>
                <div className='game-page__selection-stats'>
                  <div
                    className={
                      requirementByStat && stats.farmila >= requirementByStat.farmila
                        ? 'game-page__selection-stat--met'
                        : 'game-page__selection-stat--unmet'
                    }
                  >
                    <span>Фармила</span>

                    <strong>{stats.farmila}</strong>
                  </div>

                  <div
                    className={
                      requirementByStat && stats.perekup >= requirementByStat.perekup
                        ? 'game-page__selection-stat--met'
                        : 'game-page__selection-stat--unmet'
                    }
                  >
                    <span>Перекуп</span>

                    <strong>{stats.perekup}</strong>
                  </div>

                  <div
                    className={
                      requirementByStat && stats.tuller >= requirementByStat.tuller
                        ? 'game-page__selection-stat--met'
                        : 'game-page__selection-stat--unmet'
                    }
                  >
                    <span>Туллер</span>

                    <strong>{stats.tuller}</strong>
                  </div>
                </div>

                <div className='game-page__selection-actions'>
                  <button
                    className='game-page__button game-page__button--primary'
                    type='button'
                    onClick={() => handlePlayEvent(false)}
                  >
                    Выполнить
                  </button>

                  <button
                    className='game-page__button game-page__button--risk'
                    type='button'
                    onClick={() => handlePlayEvent(true)}
                  >
                    Рискнуть ({riskPercent}%)
                  </button>
                </div>
              </div>
            )}

            {selectedCardIds.length > 0 && !canSatisfy && (
              <p className='game-page__selection-hint'>
                Требования события не выполнены. Шанс риска <strong>{RISK_FAILURE_PERCENT}%</strong>
                . Если риск не сыграет — сработает провал по основной характеристике.
              </p>
            )}

            {actionError && <p className='game-page__action-error'>{actionError}</p>}

            {isMyTurn && (
              <div className='game-page__turn-actions'>
                {!canSkip ? (
                  <p className='game-page__skip-limit'>
                    Лимит пропусков исчерпан — придётся ходить
                  </p>
                ) : isConfirmingSkip ? (
                  <>
                    <button
                      className='game-page__button game-page__button--risk'
                      type='button'
                      onClick={handleSkipTurn}
                    >
                      Пропустить (−{GAME_RULES.SKIP_PENALTY} Soul)
                    </button>

                    <button
                      className='game-page__button game-page__button--secondary'
                      type='button'
                      onClick={() => setIsConfirmingSkip(false)}
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <button
                    className='game-page__button game-page__button--secondary'
                    type='button'
                    onClick={() => setIsConfirmingSkip(true)}
                  >
                    Пропустить ход ({skipsRemaining} из {GAME_RULES.MAX_CONSECUTIVE_SKIPS})
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <AbilityModal
        isOpen={isAbilityModalOpen}
        onClose={closeAbilityModal}
        title={highlightedCharacterId ? 'Способность персонажа' : 'Способности твоих персонажей'}
        characters={selfAbilities}
        highlightId={highlightedCharacterId}
      />
    </MainLayout>
  );
}

type CharacterCardProps = {
  card: PlayerCharacter;
  character: Character | undefined;
  isSelected: boolean;
  isSelectable: boolean;
  onToggle: () => void;
  onOpenAbility?: (characterId: string) => void;
  index: number;
};

function CharacterCard({
  card,
  character,
  isSelected,
  isSelectable,
  onToggle,
  onOpenAbility,
  index
}: CharacterCardProps) {
  const disabled = !isSelectable || card.exhausted;

  return (
    <button
      className={[
        'game-page__card',
        isSelected ? 'game-page__card--selected' : '',
        card.exhausted ? 'game-page__card--exhausted' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ animationDelay: `${index * 60}ms` }}
      type='button'
      disabled={disabled}
      onClick={onToggle}
    >
      <div className='game-page__card-image'>
        <CardImage
          src={character?.image}
          fallbackSrc={`/cards/characters/${card.characterId}.webp`}
          alt={character?.name ?? card.characterId}
          placeholderLabel={character?.name ?? card.characterId}
        />

        {card.exhausted && (
          <span className='game-page__card-overlay game-page__card-overlay--exhausted'>Устал</span>
        )}

        {isSelected && (
          <span className='game-page__card-overlay game-page__card-overlay--selected'>Выбран</span>
        )}
      </div>

      <div className='game-page__card-header'>
        <strong>{character?.name ?? card.characterId}</strong>

        {card.abilityUsed && <span className='game-page__card-tag'>Способность использована</span>}
      </div>

      {character && (
        <div className='game-page__card-stats'>
          <div>
            <span>Фармила</span>

            <strong>{character.stats.farmila}</strong>
          </div>

          <div>
            <span>Перекуп</span>

            <strong>{character.stats.perekup}</strong>
          </div>

          <div>
            <span>Туллер</span>

            <strong>{character.stats.tuller}</strong>
          </div>
        </div>
      )}

      {character?.ability && (
        <div className='game-page__card-ability'>
          <div className='game-page__card-ability-header'>
            <span className='game-page__card-ability-name'>{character.ability.name}</span>

            {onOpenAbility && (
              <Tooltip content='Подробнее о способности'>
                <span
                  className='game-page__card-ability-help'
                  role='button'
                  tabIndex={0}
                  aria-label='Подробнее о способности'
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onOpenAbility(character.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onOpenAbility(character.id);
                    }
                  }}
                >
                  ?
                </span>
              </Tooltip>
            )}
          </div>

          <p>{character.ability.description}</p>
        </div>
      )}
    </button>
  );
}

export default GamePage;
