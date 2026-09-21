import type {GameState} from '@soul/shared';

import {drawEvent} from '../deck/drawEvent.js';
import {finishGame} from '../game/finishGame.js';
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
	
	const nextGame =
		nextTurn(game);
	
	if (
		game.finalRoundStartedBy &&
		nextGame.currentPlayerId ===
		game.finalRoundStartedBy
	) {
		return finishGame(
			nextGame
		);
	}
	
	const nextEvent =
		drawEvent(
			nextGame.eventDeck,
			random
		);
	
	return {
		...nextGame,
		currentEvent: nextEvent
	};
}