import type {
	Character,
	Player
} from '@soul/shared';

import {GAME_RULES} from '@soul/shared';

import {shuffle} from '../deck/shuffle.js';

export function dealCharacters(
	players: Player[],
	characters: Character[],
	random: () => number = Math.random
): Player[] {
	if (
		characters.length <
		GAME_RULES.CHARACTERS_PER_PLAYER
	) {
		throw new Error(
			`Not enough character types: required at least ${GAME_RULES.CHARACTERS_PER_PLAYER}, available ${characters.length}`
		);
	}
	
	return players.map(
		(player) => {
			const shuffledCharacters =
				shuffle(
					characters,
					random
				);
			
			const selectedCharacters =
				shuffledCharacters.slice(
					0,
					GAME_RULES.CHARACTERS_PER_PLAYER
				);
			
			const playerCharacters =
				selectedCharacters.map(
					(character, index) => ({
						cardId:
							`${player.id}-character-${index + 1}`,
						characterId:
						character.id,
						exhausted: false,
						abilityUsed: false
					})
				);
			
			return {
				...player,
				characters:
				playerCharacters
			};
		}
	);
}