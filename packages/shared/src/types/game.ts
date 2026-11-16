import type { Character } from './character.js';
import type { EventDeck } from './event-deck.js';
import type { EventCard } from './event.js';
import type { Player } from './player.js';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export type GameState = {
  id: string;
  status: GameStatus;
  players: Player[];

  /**
   * Снимок карточек персонажей на момент старта игры.
   *
   * Заполняется в startGame и больше не меняется.
   * Это гарантирует, что правки в админке
   * не повлияют на уже идущую партию.
   */
  characters: Character[];

  currentPlayerId: string | null;
  currentEvent: EventCard | null;
  eventDeck: EventDeck;
  turnNumber: number;
  winnerId: string | null;
  finalRoundStartedBy: string | null;
};
