export const GAME_RULES = {
  STARTING_SOUL: 2,
  CHARACTERS_PER_PLAYER: 2,
  WINNING_SOUL: 20,

  /**
   * Шанс, что Перекуп не потеряет Soul при провале
   * по своей основной характеристике (50/50).
   */
  PEREKUP_GAMBLE_CHANCE: 0.5,
} as const;

export const ROOM_RULES = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  ROOM_CODE_LENGTH: 6,
} as const;

/**
 * Шансы риска.
 *
 * SUCCESS — требования события выполнены.
 * FAILURE — требования не выполнены, но игрок всё равно рискует.
 */
export const RISK_CHANCES = {
  SUCCESS: 0.5,
  FAILURE: 0.25,
} as const;
