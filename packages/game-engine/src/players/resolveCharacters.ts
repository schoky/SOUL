import type {
	Character,
	CharacterStats,
	Player,
	PlayerCharacter
} from '@soul/shared';

import {characters} from '../data/characters.js';

export type ResolvedCharacters = {
	cards: PlayerCharacter[];
	characters: Character[];
	stats: CharacterStats;
};

export function resolveCharacters(
	player: Player,
	characterCardIds: string[]
): ResolvedCharacters {
	if (characterCardIds.length === 0) {
		throw new Error(
			'At least one character card must be selected'
		);
	}
	
	if (characterCardIds.length > 2) {
		throw new Error(
			'Cannot select more than two character cards'
		);
	}
	
	if (
		new Set(characterCardIds).size !==
		characterCardIds.length
	) {
		throw new Error(
			'Character cards must be unique'
		);
	}
	
	const cards =
		characterCardIds.map(
			(cardId) => {
				const card =
					player.characters.find(
						(item) =>
							item.cardId ===
							cardId
					);
				
				if (!card) {
					throw new Error(
						`Character card "${cardId}" not found`
					);
				}
				
				if (card.exhausted) {
					throw new Error(
						`Character card "${cardId}" is exhausted`
					);
				}
				
				return card;
			}
		);
	
	const resolvedCharacters =
		cards.map(
			(card) => {
				const character =
					characters.find(
						(item) =>
							item.id ===
							card.characterId
					);
				
				if (!character) {
					throw new Error(
						`Character "${card.characterId}" not found`
					);
				}
				
				return character;
			}
		);
	
	const stats: CharacterStats = {
		farmila: 0,
		perekup: 0,
		tuller: 0
	};
	
	for (
		const character of resolvedCharacters
		) {
		stats.farmila +=
			character.stats.farmila;
		
		stats.perekup +=
			character.stats.perekup;
		
		stats.tuller +=
			character.stats.tuller;
	}
	
	return {
		cards,
		characters: resolvedCharacters,
		stats
	};
}