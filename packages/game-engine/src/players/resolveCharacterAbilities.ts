import type {
	Character,
	EventCard,
	Player,
	PlayerCharacter
} from '@soul/shared';

import {changeSoul} from '../rules/changeSoul.js';

export type CharacterAbilityResult = {
	soul: number;
	abilityUsedCardIds: string[];
};

type ResolveCharacterAbilitiesParams = {
	player: Player;
	cards: PlayerCharacter[];
	characters: Character[];
	event: EventCard;
	success: boolean;
	currentSoul: number;
};

export function resolveCharacterAbilities({
	                                          player,
	                                          cards,
	                                          characters,
	                                          event,
	                                          success,
	                                          currentSoul
                                          }: ResolveCharacterAbilitiesParams): CharacterAbilityResult {
	let soul = currentSoul;
	
	const abilityUsedCardIds: string[] = [];
	
	for (const card of cards) {
		const character = characters.find(
			(item) =>
				item.id === card.characterId
		);
		
		if (!character?.ability) {
			continue;
		}
		
		switch (character.ability.id) {
			case 'cold-blooded': {
				if (
					!success &&
					event.mainStat === 'tuller' &&
					!card.abilityUsed
				) {
					soul = player.soul;
					
					abilityUsedCardIds.push(
						card.cardId
					);
				}
				
				break;
			}
			
			case 'profitable-deal': {
				if (
					success &&
					event.mainStat === 'perekup'
				) {
					soul = changeSoul(
						soul,
						1
					);
				}
				
				break;
			}
			
			case 'work-to-exhaustion': {
				if (
					success &&
					event.mainStat === 'farmila'
				) {
					soul = changeSoul(
						soul,
						1
					);
				}
				
				break;
			}
		}
	}
	
	return {
		soul,
		abilityUsedCardIds
	};
}