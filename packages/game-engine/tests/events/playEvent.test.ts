import { describe, expect, it } from "vitest";

import type { GameState, Player, PlayerCharacter } from "@soul/shared";

import { characters } from "../../src/data/characters";
import { events } from "../../src/data/events";
import { playEvent } from "../../src/game/playEvent";

const killerCard: PlayerCharacter = {
  cardId: "player-1-character-1",
  characterId: "killer",
  exhausted: false,
  abilityUsed: false,
};

const workaholicCard: PlayerCharacter = {
  cardId: "player-1-character-2",
  characterId: "workaholic",
  exhausted: false,
  abilityUsed: false,
};

const player: Player = {
  id: "player-1",
  name: "Игрок 1",
  soul: 5,
  characters: [killerCard],
  status: null,
  isReady: false,
  skipNextTurn: false,
};

function createPlayingGame(): GameState {
  const event = events.find((item) => item.id === "raid-on-warehouse");

  if (!event) {
    throw new Error("Событие не найдено");
  }

  return {
    id: "game-1",
    status: "playing",
    players: [player],
    characters,
    currentPlayerId: player.id,
    currentEvent: event,
    eventDeck: { drawPile: [], discardPile: [] },
    turnNumber: 1,
    winnerId: null,
    finalRoundStartedBy: null,
  };
}

describe("playEvent", () => {
  it("изменяет Soul текущего игрока после успешного события", () => {
    const game = createPlayingGame();

    const result = playEvent(game, ["player-1-character-1"]);

    expect(result.success).toBe(true);
    expect(result.gambleWon).toBeNull();
    expect(result.riskWon).toBeNull();
    expect(result.game.players[0].soul).toBe(7);
  });

  it("делает выбранного персонажа уставшим после события", () => {
    const game = createPlayingGame();

    const result = playEvent(game, ["player-1-character-1"]);

    expect(result.game.players[0].characters[0].exhausted).toBe(true);
  });

  it("делает обоих персонажей уставшими после связки", () => {
    const game: GameState = {
      ...createPlayingGame(),
      players: [
        {
          ...player,
          characters: [killerCard, workaholicCard],
        },
      ],
      currentEvent: {
        id: "combo-event",
        name: "Тестовая связка",
        requirements: { farmila: 8, perekup: 4, tuller: 6 },
        mainStat: "farmila",
        reward: 2,
        riskReward: 4,
        description: "Событие для проверки связки.",
      },
    };

    const result = playEvent(game, [
      "player-1-character-1",
      "player-1-character-2",
    ]);

    expect(result.success).toBe(true);
    expect(result.game.players[0].characters[0].exhausted).toBe(true);
    expect(result.game.players[0].characters[1].exhausted).toBe(true);
  });

  it("не изменяет исходный GameState", () => {
    const game = createPlayingGame();

    playEvent(game, ["player-1-character-1"]);

    expect(game.players[0].soul).toBe(5);
    expect(game.players[0].characters[0].exhausted).toBe(false);
  });

  it("отмечает способность Киллера использованной после первого провала по Туллеру", () => {
    const game = {
      ...createPlayingGame(),
      currentEvent: {
        id: "tuller-failure",
        name: "Провал по Туллеру",
        requirements: { farmila: 99, perekup: 99, tuller: 99 },
        mainStat: "tuller" as const,
        reward: 0,
        riskReward: 0,
        description: "Тест.",
      },
    };

    const result = playEvent(game, ["player-1-character-1"], false, () => 0);

    expect(result.success).toBe(false);
    expect(result.game.players[0].characters[0].abilityUsed).toBe(true);
    expect(result.game.players[0].soul).toBe(5);
  });

  it("выигрывает риск и получает повышенную награду", () => {
    const game = createPlayingGame();

    const result = playEvent(game, ["player-1-character-1"], true, () => 0);

    expect(result.success).toBe(true);
    expect(result.riskWon).toBe(true);
    expect(result.game.players[0].soul).toBe(9);
  });

  it("проигрывает риск и получает эффект основной характеристики", () => {
    const game = createPlayingGame();

    const result = playEvent(game, ["player-1-character-1"], true, () => 0.99);

    expect(result.success).toBe(false);
    expect(result.riskWon).toBe(false);
    expect(result.game.players[0].status).toBe("za-kafan");
  });

  it("запускает финальный раунд, когда игрок достигает 15 Soul", () => {
    const game: GameState = {
      ...createPlayingGame(),
      players: [
        {
          ...player,
          soul: 13,
        },
      ],
    };

    const result = playEvent(game, ["player-1-character-1"]);

    expect(result.game.players[0].soul).toBe(15);
    expect(result.game.finalRoundStartedBy).toBe("player-1");
    expect(result.game.status).toBe("playing");
  });

  it("выбрасывает ошибку, если игра не запущена", () => {
    const game = {
      ...createPlayingGame(),
      status: "waiting" as const,
    };

    expect(() => {
      playEvent(game, ["player-1-character-1"]);
    }).toThrow("Cannot play event: game is not playing");
  });

  it("выбрасывает ошибку, если нет текущего события", () => {
    const game = {
      ...createPlayingGame(),
      currentEvent: null,
    };

    expect(() => {
      playEvent(game, ["player-1-character-1"]);
    }).toThrow("Cannot play event: current event is not set");
  });
});
