import type {GameState} from '@soul/shared';

import {drawEvent} from '../deck/drawEvent.js';
import {nextTurn} from '../game/nextTurn.js';

export function endTurn(
	game: GameState,
	random: () => number = Math.random
): GameState {
	if (game.status !== 'playing') {
		throw new Error(
			'Cannot end turn: game is not playing'
		);
	}
	
	const nextGame = nextTurn(game);
	
	const nextEvent = drawEvent(
		nextGame.eventDeck,
		random
	);
	
	return {
		...nextGame,
		currentEvent: nextEvent
	};
}