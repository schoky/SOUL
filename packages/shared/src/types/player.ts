import type { PlayerCharacter } from './player-character.js';
import type { Status } from './status.js';

export type Player = {
  id: string;
  name: string;
  soul: number;
  characters: PlayerCharacter[];
  status: Status | null;
  isReady: boolean;
  skipNextTurn: boolean;

  /**
   * Сколько раз подряд игрок пропустил ход.
   * Сбрасывается при обычном ходе (событии).
   */
  consecutiveSkips: number;
};
