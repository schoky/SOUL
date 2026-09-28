import type {
  Character,
  EventCard,
  Player,
  PlayerCharacter,
} from "@soul/shared";

import { changeSoul } from "../rules/changeSoul.js";

export type CharacterAbilityResult = {
  soul: number;
  abilityUsedCardIds: string[];
  cancelFailure: boolean;
};

type ResolveCharacterAbilitiesParams = {
  player: Player;
  cards: PlayerCharacter[];
  characters: Character[];
  event: EventCard;
  success: boolean;
  currentSoul: number;
  risk: boolean;
  riskWon: boolean | null;
  baseSuccess: boolean;
  cardCount: number;
};

export function resolveCharacterAbilities({
  player,
  cards,
  characters,
  event,
  success,
  currentSoul,
  risk,
  riskWon,
  baseSuccess,
  cardCount,
}: ResolveCharacterAbilitiesParams): CharacterAbilityResult {
  let soul = currentSoul;
  let cancelFailure = false;

  const abilityUsedCardIds: string[] = [];

  for (const card of cards) {
    const character = characters.find((item) => item.id === card.characterId);

    if (!character?.ability) {
      continue;
    }

    switch (character.ability.id) {
      // -------- Существующие --------

      case "cold-blooded": {
        if (!success && event.mainStat === "tuller" && !card.abilityUsed) {
          soul = player.soul;

          abilityUsedCardIds.push(card.cardId);
        }

        break;
      }

      case "profitable-deal": {
        if (success && event.mainStat === "perekup") {
          soul = changeSoul(soul, 1);
        }

        break;
      }

      case "work-to-exhaustion": {
        if (success && event.mainStat === "farmila") {
          soul = changeSoul(soul, 1);
        }

        break;
      }

      // -------- Новые --------

      case "precise-shot": {
        if (risk && riskWon === true) {
          soul = changeSoul(soul, 1);
        }

        break;
      }

      case "agility": {
        if (!success && event.mainStat === "farmila") {
          cancelFailure = true;
        }

        break;
      }

      case "lone-wolf": {
        if (success && cardCount === 1) {
          soul = changeSoul(soul, 1);
        }

        break;
      }

      case "connections": {
        if (success && cardCount === 2) {
          soul = changeSoul(soul, 1);
        }

        break;
      }

      case "first-aid": {
        if (success && event.mainStat === "tuller") {
          soul = changeSoul(soul, 1);
        }

        break;
      }

      case "hunch": {
        if (!success && risk && baseSuccess && !card.abilityUsed) {
          cancelFailure = true;

          abilityUsedCardIds.push(card.cardId);
        }

        break;
      }

      // resilience обрабатывается в playEvent
    }
  }

  return {
    soul,
    abilityUsedCardIds,
    cancelFailure,
  };
}
