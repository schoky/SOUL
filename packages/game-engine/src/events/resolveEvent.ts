import type {EventCard, Player} from '@soul/shared';

import {checkRequirements} from '../rules/checkRequirements.js';
import {changeSoul} from '../rules/changeSoul.js';
import {resolveFailure} from '../rules/resolveFailure.js';

export type EventResult = {
	success: boolean;
	soul: number;
	status: Player['status'];
	skipNextTurn: boolean;
	gambleWon: boolean | null;
};

export function resolveEvent(
	player: Player,
	characterId: string,
	event: EventCard,
	random: () => number = Math.random
): EventResult {
	const character = player.characters.find(
		(item) => item.id === characterId
	);
	
	if (!character) {
		throw new Error(`Character "${characterId}" not found`);
	}
	
	const success = checkRequirements(character, event);
	
	if (success) {
		return {
			success: true,
			soul: changeSoul(player.soul, event.reward),
			status: null,
			skipNextTurn: false,
			gambleWon: null
		};
	}
	
	const failure = resolveFailure(player, event, random);
	
	return {
		success: false,
		soul: failure.soul,
		status: failure.status,
		skipNextTurn: failure.skipNextTurn,
		gambleWon: failure.gambleWon
	};
}