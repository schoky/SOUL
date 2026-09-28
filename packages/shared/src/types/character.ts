import type { CharacterStats } from "./stats.js";

export type CharacterAbility = {
  id: string;
  name: string;
  description: string;
};

export type Character = {
  id: string;
  name: string;

  /**
   * Путь к картинке карточки.
   *
   * Если не указан — клиент попробует
   * /cards/characters/{id}.webp.
   */
  image?: string;

  stats: CharacterStats;
  ability?: CharacterAbility;
};
