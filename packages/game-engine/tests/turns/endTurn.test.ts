import { describe, expect, it } from "vitest";

import type { Player } from "@soul/shared";

import { events } from "../../src/data/events";
import { createGame } from "../../src/game/createGame";
import { endTurn } from "../../src/turns/endTurn";

const player1: Player = {
  id: "player-1",
  name: "Игрок 1",
  soul: 0,
  characters: [],
  status: null,
  isReady: false,
  skipNextTurn: false,
};

const player2: Player = {
  id: "player-2",
  name: "Игрок 2",
  soul: 0,
  characters: [],
  status: null,
  isReady: false,
  skipNextTurn: false,
};

describe("endTurn", () => {
  it("передаёт ход следующему игроку", () => {
    const game = createGame("game-1", [player1, player2], events, () => 0);

    const startedGame = {
      ...game,
      status: "playing" as const,
      currentPlayerId: player1.id,
      turnNumber: 1,
    };

    const result = endTurn(startedGame, () => 0);

    expect(result.currentPlayerId).toBe(player2.id);
    expect(result.turnNumber).toBe(2);
  });

  it("вытягивает новое событие для следующего хода", () => {
    const game = createGame("game-1", [player1, player2], events, () => 0);

    const startedGame = {
      ...game,
      status: "playing" as const,
      currentPlayerId: player1.id,
      turnNumber: 1,
    };

    const expectedEvent = startedGame.eventDeck.drawPile[0];

    const result = endTurn(startedGame, () => 0);

    expect(result.currentEvent).toBe(expectedEvent);
    expect(result.eventDeck.discardPile).toContain(expectedEvent);
  });

  it("завершает игру, когда финальный раунд возвращается к его инициатору", () => {
    const finalPlayer1: Player = {
      ...player1,
      soul: 15,
    };

    const finalPlayer2: Player = {
      ...player2,
      soul: 18,
    };

    const finalPlayer3: Player = {
      id: "player-3",
      name: "Игрок 3",
      soul: 16,
      characters: [],
      status: null,
      isReady: false,
      skipNextTurn: false,
    };

    const game = {
      ...createGame(
        "game-1",
        [finalPlayer1, finalPlayer2, finalPlayer3],
        events,
      ),
      status: "playing" as const,
      currentPlayerId: finalPlayer3.id,
      turnNumber: 3,
      finalRoundStartedBy: finalPlayer1.id,
    };

    const result = endTurn(game, () => 0);

    expect(result.status).toBe("finished");
    expect(result.winnerId).toBe(finalPlayer2.id);
    expect(result.currentPlayerId).toBeNull();
    expect(result.currentEvent).toBeNull();
  });
});
