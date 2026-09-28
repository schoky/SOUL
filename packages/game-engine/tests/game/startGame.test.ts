import { describe, expect, it } from "vitest";

import type { Player } from "@soul/shared";

import { characters } from "../../src/data/characters";
import { events } from "../../src/data/events";
import { createGame } from "../../src/game/createGame";
import { startGame } from "../../src/game/startGame";

const player: Player = {
  id: "player-1",
  name: "Игрок 1",
  soul: 3,
  characters: [],
  status: null,
  isReady: false,
  skipNextTurn: false,
};

describe("startGame", () => {
  it("переводит игру из waiting в playing", () => {
    const game = createGame("game-1", [player], events, () => 0);

    const expectedEvent = game.eventDeck.drawPile[0];

    const startedGame = startGame(game, player.id, characters, () => 0);

    expect(startedGame.status).toBe("playing");
    expect(startedGame.currentPlayerId).toBe(player.id);
    expect(startedGame.currentEvent).toBe(expectedEvent);
    expect(startedGame.turnNumber).toBe(1);
  });

  it("перемещает первое событие в discardPile", () => {
    const game = createGame("game-1", [player], events, () => 0);

    const expectedEvent = game.eventDeck.drawPile[0];

    const startedGame = startGame(game, player.id, characters, () => 0);

    expect(startedGame.eventDeck.discardPile).toHaveLength(1);
    expect(startedGame.eventDeck.discardPile[0]).toBe(expectedEvent);
  });

  it("выбрасывает ошибку, если первого игрока нет в игре", () => {
    const game = createGame("game-1", [player], events);

    expect(() => {
      startGame(game, "unknown-player", characters, () => 0);
    }).toThrow('Player "unknown-player" not found');
  });

  it("выдаёт каждому игроку двух персонажей", () => {
    const player2: Player = {
      id: "player-2",
      name: "Игрок 2",
      soul: 3,
      characters: [],
      status: null,
      isReady: true,
      skipNextTurn: false,
    };

    const game = createGame("game-1", [player, player2], events, () => 0);

    const startedGame = startGame(game, player.id, characters, () => 0);

    expect(startedGame.players[0].characters).toHaveLength(2);
    expect(startedGame.players[1].characters).toHaveLength(2);

    const cardIds = startedGame.players.flatMap((item) =>
      item.characters.map((character) => character.cardId),
    );

    expect(cardIds).toHaveLength(4);
    expect(new Set(cardIds).size).toBe(4);
  });
});
