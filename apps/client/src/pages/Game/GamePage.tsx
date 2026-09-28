import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  RISK_CHANCES,
  SOCKET_EVENTS,
  type Character,
  type GameEndTurnPayload,
  type GamePlayEventPayload,
  type GameSessionPayload,
  type GameStateUpdatedPayload,
  type GameStartedPayload,
  type PlayerCharacter,
  type SocketErrorPayload,
  type StatType,
} from "@soul/shared";

import CardImage from "../../components/game/CardImage";

import MainLayout from "../../components/layout/MainLayout";

import { socket } from "../../services/socket";

import { useAuthStore } from "../../stores/authStore";
import { useGameStore } from "../../stores/gameStore";
import { useRoomStore } from "../../stores/roomStore";

const MAX_CARDS_PER_ACTION = 2;

function findCharacter(
  characters: Character[],
  characterId: string,
): Character | undefined {
  return characters.find((item) => item.id === characterId);
}

function checkRequirements(
  stats: Record<StatType, number>,
  requirements: {
    farmila: number;
    perekup: number;
    tuller: number;
  },
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

  const setGameSession = useGameStore((state) => state.setGameSession);

  const leaveRoom = useRoomStore((state) => state.leaveRoom);

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      navigate("/lobby", {
        replace: true,
      });

      return;
    }

    const handleConnect = () => {
      socket.emit(SOCKET_EVENTS.ROOM_SUBSCRIBE, {
        roomId,
      });
    };

    const handleGameState = (payload: GameSessionPayload) => {
      setGameSession(payload.gameState, payload.characters);
    };

    const handleGameStarted = (payload: GameStartedPayload) => {
      setGameSession(payload.gameState, payload.characters);
    };

    const handleGameStateUpdated = (payload: GameStateUpdatedPayload) => {
      setGameSession(payload.gameState, payload.characters);

      setSelectedCardIds([]);
    };

    const handleSocketError = (payload: SocketErrorPayload) => {
      setActionError(payload.message);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on(SOCKET_EVENTS.GAME_STATE, handleGameState);
    socket.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
    socket.on(SOCKET_EVENTS.GAME_STATE_UPDATED, handleGameStateUpdated);
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off(SOCKET_EVENTS.GAME_STATE, handleGameState);
      socket.off(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
      socket.off(SOCKET_EVENTS.GAME_STATE_UPDATED, handleGameStateUpdated);
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError);
    };
  }, [roomId, navigate, setGameSession]);

  useEffect(() => {
    setSelectedCardIds([]);
  }, [gameState?.currentPlayerId, gameState?.turnNumber]);

  const self = useMemo(() => {
    if (!gameState || !user) {
      return undefined;
    }

    return gameState.players.find((player) => player.id === user.id);
  }, [gameState, user]);

  const isMyTurn =
    !!gameState && !!user && gameState.currentPlayerId === user.id;

  const currentPlayer = gameState?.players.find(
    (player) => player.id === gameState.currentPlayerId,
  );

  const selectedCharacters = useMemo(() => {
    if (!self) {
      return [];
    }

    return self.characters
      .filter((card) => selectedCardIds.includes(card.cardId))
      .map((card) => ({
        card,
        character: findCharacter(characters, card.characterId),
      }));
  }, [self, selectedCardIds, characters]);

  const stats = useMemo<Record<StatType, number>>(() => {
    const result: Record<StatType, number> = {
      farmila: 0,
      perekup: 0,
      tuller: 0,
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

  const riskChance = canSatisfy ? RISK_CHANCES.SUCCESS : RISK_CHANCES.FAILURE;

  const riskPercent = Math.round(riskChance * 100);

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
        return previous.filter((id) => id !== cardId);
      }

      if (previous.length >= MAX_CARDS_PER_ACTION) {
        return previous;
      }

      return [...previous, cardId];
    });
  }

  function handlePlayEvent(risk: boolean) {
    if (!gameState || selectedCardIds.length === 0) {
      return;
    }

    setActionError(null);

    const payload: GamePlayEventPayload = {
      roomId: gameState.id,
      characterCardIds: selectedCardIds,
      risk,
    };

    socket.emit(SOCKET_EVENTS.GAME_PLAY_EVENT, payload);
  }

  function handleEndTurn() {
    if (!gameState) {
      return;
    }

    setActionError(null);

    const payload: GameEndTurnPayload = {
      roomId: gameState.id,
    };

    socket.emit(SOCKET_EVENTS.GAME_END_TURN, payload);
  }

  async function handleReturnToLobby() {
    if (gameState) {
      try {
        await leaveRoom(gameState.id);
      } catch {
        // даже если ошибка — уходим в лобби,
        // чтобы пользователь не залипал
      }
    }

    navigate("/lobby");
  }

  if (!gameState) {
    return (
      <MainLayout>
        <main className="game-page">
          <section className="game-page__empty">
            <p className="game-page__eyebrow">ИГРА</p>

            <h1 className="game-page__title">Подключаемся...</h1>

            <p className="game-page__description">Загружаем состояние игры.</p>
          </section>
        </main>
      </MainLayout>
    );
  }

  if (gameState.status === "finished") {
    const winner = gameState.players.find(
      (player) => player.id === gameState.winnerId,
    );

    return (
      <MainLayout>
        <main className="game-page">
          <section className="game-page__empty">
            <p className="game-page__eyebrow">ИГРА ЗАВЕРШЕНА</p>

            <h1 className="game-page__title">
              {winner ? `Победил ${winner.name}` : "Ничья"}
            </h1>

            <p className="game-page__description">Финальный раунд завершён.</p>

            <button
              className="
                game-page__button
                game-page__button--primary
              "
              type="button"
              onClick={() => {
                void handleReturnToLobby();
              }}
            >
              Вернуться в лобби
            </button>
          </section>
        </main>
      </MainLayout>
    );
  }

  const event = gameState.currentEvent;

  const requirementByStat: Record<StatType, number> | null = event
    ? {
        farmila: event.requirements.farmila,
        perekup: event.requirements.perekup,
        tuller: event.requirements.tuller,
      }
    : null;

  return (
    <MainLayout>
      <main className="game-page">
        <section className="game-page__header">
          <div>
            <p className="game-page__eyebrow">ИГРА</p>

            <h1 className="game-page__title">Ход {gameState.turnNumber}</h1>

            <p className="game-page__description">
              Сейчас ходит: <strong>{currentPlayer?.name ?? "—"}</strong>
            </p>
          </div>

          <div className="game-page__meta">
            <span>Статус</span>

            <strong>{gameState.status}</strong>
          </div>
        </section>

        <section className="game-page__content">
          <div className="game-page__event">
            <p className="game-page__eyebrow">СОБЫТИЕ</p>

            {event ? (
              <>
                <div className="game-page__event-image">
                  <CardImage
                    src={event.image}
                    fallbackSrc={`/cards/events/${event.id}.webp`}
                    alt={event.name}
                    placeholderLabel={event.name}
                  />
                </div>

                <h2 className="game-page__event-title">{event.name}</h2>

                <p className="game-page__event-description">
                  {event.description}
                </p>

                <div className="game-page__requirements">
                  <div className="game-page__requirement">
                    <span>Фармила</span>

                    <strong>{event.requirements.farmila}</strong>
                  </div>

                  <div className="game-page__requirement">
                    <span>Перекуп</span>

                    <strong>{event.requirements.perekup}</strong>
                  </div>

                  <div className="game-page__requirement">
                    <span>Туллер</span>

                    <strong>{event.requirements.tuller}</strong>
                  </div>
                </div>

                <div className="game-page__event-main">
                  <span>Основная характеристика</span>

                  <strong>{event.mainStat}</strong>
                </div>

                <div className="game-page__rewards">
                  <div className="game-page__reward">
                    <span>Награда</span>

                    <strong>+{event.reward} Soul</strong>
                  </div>

                  <div className="game-page__reward">
                    <span>Риск</span>

                    <strong>+{event.riskReward} Soul</strong>
                  </div>
                </div>
              </>
            ) : (
              <p className="game-page__description">Событие не задано.</p>
            )}
          </div>

          <aside className="game-page__players">
            <p className="game-page__eyebrow">ИГРОКИ</p>

            <div className="game-page__players-list">
              {gameState.players.map((player) => {
                const isCurrent = player.id === gameState.currentPlayerId;

                return (
                  <article
                    className={[
                      "game-page__player",
                      isCurrent ? "game-page__player--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={player.id}
                  >
                    <div className="game-page__player-header">
                      <strong>{player.name}</strong>

                      {isCurrent && (
                        <span className="game-page__player-tag">Ходит</span>
                      )}
                    </div>

                    <div className="game-page__player-stats">
                      <div>
                        <span>Soul</span>

                        <strong>{player.soul}</strong>
                      </div>

                      <div>
                        <span>Персонажей</span>

                        <strong>{player.characters.length}</strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>

        {self && (
          <section className="game-page__hand">
            <div className="game-page__section-header">
              <div>
                <p className="game-page__eyebrow">ТВОИ ПЕРСОНАЖИ</p>

                <h2 className="game-page__section-title">
                  {isMyTurn ? "Выбери персонажей" : "Ждём хода"}
                </h2>
              </div>

              <span className="game-page__counter">
                Выбрано: {selectedCardIds.length} / {MAX_CARDS_PER_ACTION}
              </span>
            </div>

            <div className="game-page__cards">
              {self.characters.map((card) => (
                <CharacterCard
                  card={card}
                  character={findCharacter(characters, card.characterId)}
                  isSelected={selectedCardIds.includes(card.cardId)}
                  isSelectable={isMyTurn}
                  onToggle={() => toggleCard(card.cardId)}
                  key={card.cardId}
                />
              ))}
            </div>

            {selectedCardIds.length > 0 && (
              <div className="game-page__selection">
                <div className="game-page__selection-stats">
                  <div
                    className={
                      requirementByStat &&
                      stats.farmila >= requirementByStat.farmila
                        ? "game-page__selection-stat--met"
                        : "game-page__selection-stat--unmet"
                    }
                  >
                    <span>Фармила</span>

                    <strong>{stats.farmila}</strong>
                  </div>

                  <div
                    className={
                      requirementByStat &&
                      stats.perekup >= requirementByStat.perekup
                        ? "game-page__selection-stat--met"
                        : "game-page__selection-stat--unmet"
                    }
                  >
                    <span>Перекуп</span>

                    <strong>{stats.perekup}</strong>
                  </div>

                  <div
                    className={
                      requirementByStat &&
                      stats.tuller >= requirementByStat.tuller
                        ? "game-page__selection-stat--met"
                        : "game-page__selection-stat--unmet"
                    }
                  >
                    <span>Туллер</span>

                    <strong>{stats.tuller}</strong>
                  </div>
                </div>

                <div className="game-page__selection-actions">
                  <button
                    className="
                      game-page__button
                      game-page__button--primary
                    "
                    type="button"
                    onClick={() => handlePlayEvent(false)}
                  >
                    Выполнить
                  </button>

                  <button
                    className="
                      game-page__button
                      game-page__button--risk
                    "
                    type="button"
                    onClick={() => handlePlayEvent(true)}
                  >
                    Рискнуть ({riskPercent}%)
                  </button>
                </div>
              </div>
            )}

            {selectedCardIds.length > 0 && !canSatisfy && (
              <p className="game-page__selection-hint">
                Требования события не выполнены. Шанс риска <strong>25%</strong>
                . Если риск не сыграет — сработает провал по основной
                характеристике. Ты можешь выбрать «Выполнить», чтобы принять
                обычный провал, или завершить ход, чтобы сохранить персонажей.
              </p>
            )}

            {actionError && (
              <p className="game-page__action-error">{actionError}</p>
            )}

            {isMyTurn && selectedCardIds.length === 0 && (
              <div className="game-page__turn-actions">
                <button
                  className="
                    game-page__button
                    game-page__button--secondary
                  "
                  type="button"
                  onClick={handleEndTurn}
                >
                  Завершить ход
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </MainLayout>
  );
}

type CharacterCardProps = {
  card: PlayerCharacter;
  character: Character | undefined;
  isSelected: boolean;
  isSelectable: boolean;
  onToggle: () => void;
};

function CharacterCard({
  card,
  character,
  isSelected,
  isSelectable,
  onToggle,
}: CharacterCardProps) {
  const disabled = !isSelectable || card.exhausted;

  return (
    <button
      className={[
        "game-page__card",
        isSelected ? "game-page__card--selected" : "",
        card.exhausted ? "game-page__card--exhausted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      type="button"
      disabled={disabled}
      onClick={onToggle}
    >
      <div className="game-page__card-image">
        <CardImage
          src={character?.image}
          fallbackSrc={`/cards/characters/${card.characterId}.webp`}
          alt={character?.name ?? card.characterId}
          placeholderLabel={character?.name ?? card.characterId}
        />

        {card.exhausted && (
          <span className="game-page__card-overlay game-page__card-overlay--exhausted">
            Устал
          </span>
        )}

        {isSelected && (
          <span className="game-page__card-overlay game-page__card-overlay--selected">
            Выбран
          </span>
        )}
      </div>

      <div className="game-page__card-header">
        <strong>{character?.name ?? card.characterId}</strong>

        {card.abilityUsed && (
          <span className="game-page__card-tag">Способность использована</span>
        )}
      </div>

      {character && (
        <div className="game-page__card-stats">
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
        <div className="game-page__card-ability">
          <span>{character.ability.name}</span>

          <p>{character.ability.description}</p>
        </div>
      )}
    </button>
  );
}

export default GamePage;
