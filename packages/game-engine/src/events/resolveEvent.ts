import type { Character, EventCard, Player } from "@soul/shared";

import { resolveCharacterAbilities } from "../players/resolveCharacterAbilities.js";
import { resolveCharacters } from "../players/resolveCharacters.js";
import { checkRequirements } from "../rules/checkRequirements.js";
import { changeSoul } from "../rules/changeSoul.js";
import { resolveFailure } from "../rules/resolveFailure.js";
import { resolveRisk } from "../rules/resolveRisk.js";

export type EventResult = {
  success: boolean;
  soul: number;
  status: Player["status"];
  skipNextTurn: boolean;
  gambleWon: boolean | null;
  riskWon: boolean | null;
  abilityUsedCardIds: string[];
};

export function resolveEvent(
  player: Player,
  characterCardIds: string[],
  event: EventCard,
  characters: Character[],
  risk = false,
  random: () => number = Math.random,
): EventResult {
  const resolvedCharacters = resolveCharacters(
    player,
    characterCardIds,
    characters,
  );

  const baseSuccess = checkRequirements(resolvedCharacters.stats, event);

  const cardCount = characterCardIds.length;

  // ==========================================
  // Игра без риска
  // ==========================================

  if (!risk) {
    if (!baseSuccess) {
      const failure = resolveFailure(player, event, random);

      const abilityResult = resolveCharacterAbilities({
        player,
        cards: resolvedCharacters.cards,
        characters: resolvedCharacters.characters,
        event,
        success: false,
        currentSoul: failure.soul,
        risk: false,
        riskWon: null,
        baseSuccess,
        cardCount,
      });

      const cancelled = abilityResult.cancelFailure;

      return {
        success: false,
        soul: cancelled ? player.soul : abilityResult.soul,
        status: cancelled ? null : failure.status,
        skipNextTurn: cancelled ? false : failure.skipNextTurn,
        gambleWon: cancelled ? null : failure.gambleWon,
        riskWon: null,
        abilityUsedCardIds: abilityResult.abilityUsedCardIds,
      };
    }

    const baseSoul = changeSoul(player.soul, event.reward);

    const abilityResult = resolveCharacterAbilities({
      player,
      cards: resolvedCharacters.cards,
      characters: resolvedCharacters.characters,
      event,
      success: true,
      currentSoul: baseSoul,
      risk: false,
      riskWon: null,
      baseSuccess,
      cardCount,
    });

    return {
      success: true,
      soul: abilityResult.soul,
      status: null,
      skipNextTurn: false,
      gambleWon: null,
      riskWon: null,
      abilityUsedCardIds: abilityResult.abilityUsedCardIds,
    };
  }

  // ==========================================
  // Риск
  // ==========================================

  const riskWon = resolveRisk(baseSuccess, random);

  if (riskWon) {
    const baseSoul = changeSoul(player.soul, event.riskReward);

    const abilityResult = resolveCharacterAbilities({
      player,
      cards: resolvedCharacters.cards,
      characters: resolvedCharacters.characters,
      event,
      success: true,
      currentSoul: baseSoul,
      risk: true,
      riskWon: true,
      baseSuccess,
      cardCount,
    });

    return {
      success: true,
      soul: abilityResult.soul,
      status: null,
      skipNextTurn: false,
      gambleWon: null,
      riskWon: true,
      abilityUsedCardIds: abilityResult.abilityUsedCardIds,
    };
  }

  const failure = resolveFailure(player, event, random);

  const abilityResult = resolveCharacterAbilities({
    player,
    cards: resolvedCharacters.cards,
    characters: resolvedCharacters.characters,
    event,
    success: false,
    currentSoul: failure.soul,
    risk: true,
    riskWon: false,
    baseSuccess,
    cardCount,
  });

  const cancelled = abilityResult.cancelFailure;

  return {
    success: false,
    soul: cancelled ? player.soul : abilityResult.soul,
    status: cancelled ? null : failure.status,
    skipNextTurn: cancelled ? false : failure.skipNextTurn,
    gambleWon: cancelled ? null : failure.gambleWon,
    riskWon: false,
    abilityUsedCardIds: abilityResult.abilityUsedCardIds,
  };
}
