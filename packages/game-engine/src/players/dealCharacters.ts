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
	const requiredCharacters =
		players.length *
		GAME_RULES.CHARACTERS_PER_PLAYER;
	
	if (
		characters.length <
		requiredCharacters
	) {
		throw new Error(
			`Not enough characters: required ${requiredCharacters}, available ${characters.length}`
		);
	}
	
	const shuffledCharacters = shuffle(
		characters,
		random
	);
	
	return players.map(
		(player, playerIndex) => {
			const startIndex =
				playerIndex *
				GAME_RULES.CHARACTERS_PER_PLAYER;
			
			const endIndex =
				startIndex +
				GAME_RULES.CHARACTERS_PER_PLAYER;
			
			return {
				...player,
				characters:
					shuffledCharacters.slice(
						startIndex,
						endIndex
					)
			};
		}
	);
}