import type {EventCard, Player} from '@soul/shared';

import {changeSoul} from './changeSoul.js';

export type FailureResult = {
	soul: number;
	status: Player['status'];
	skipNextTurn: boolean;
	gambleWon: boolean | null;
};

export function resolveFailure(
	player: Player,
	event: EventCard,
	random: () => number = Math.random
): FailureResult {
	switch (event.mainStat) {
		case 'tuller':
			return {
				soul: changeSoul(player.soul, -1),
				status: 'za-kafan',
				skipNextTurn: false,
				gambleWon: null
			};
		
		case 'perekup': {
			const gambleWon = random() < 0.5;
			
			return {
				soul: gambleWon
					? player.soul
					: changeSoul(player.soul, -2),
				
				status: 'v-prolete',
				skipNextTurn: false,
				gambleWon
			};
		}
		
		case 'farmila':
			return {
				soul: player.soul,
				status: 'vygoranie',
				skipNextTurn: true,
				gambleWon: null
			};
	}
}