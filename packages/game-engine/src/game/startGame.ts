import type { Character, GameState } from '@soul/shared';

import { drawEvent } from '../deck/drawEvent.js';
import { dealCharacters } from '../players/dealCharacters.js';

export function startGame(
  game: GameState,
  firstPlayerId: string,
  characters: Character[],
  random: () => number = Math.random
): GameState {
  const playerExists = game.players.some((player) => player.id === firstPlayerId);

  if (!playerExists) {
    throw new Error(`Player "${firstPlayerId}" not found`);
  }

  const players = dealCharacters(game.players, characters, random);

  const firstEvent = drawEvent(game.eventDeck, random);

  return {
    ...game,
    status: 'playing',
    players,
    characters,
    currentPlayerId: firstPlayerId,
    currentEvent: firstEvent,
    turnNumber: 1
  };
}
