import type {GameState} from '@soul/shared';

import {determineWinner} from './determineWinner.js';

export function finishGame(
	game: GameState
): GameState {
	if (game.status !== 'playing') {
		throw new Error(
			'Cannot finish game: game is not playing'
		);
	}
	
	const winnerId =
		determineWinner(
			game.players,
			game.finalRoundStartedBy
		);
	
	return {
		...game,
		status: 'finished',
		currentPlayerId: null,
		currentEvent: null,
		winnerId
	};
}