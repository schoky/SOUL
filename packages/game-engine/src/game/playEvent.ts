import type {GameState} from '@soul/shared';

import {resolveEvent} from '../events/resolveEvent.js';

export type PlayEventResult = {
	game: GameState;
	success: boolean;
	gambleWon: boolean | null;
};

export function playEvent(
	game: GameState,
	characterId: string,
	random: () => number = Math.random
): PlayEventResult {
	if (game.status !== 'playing') {
		throw new Error(
			'Cannot play event: game is not playing'
		);
	}
	
	if (!game.currentPlayerId) {
		throw new Error(
			'Cannot play event: current player is not set'
		);
	}
	
	if (!game.currentEvent) {
		throw new Error(
			'Cannot play event: current event is not set'
		);
	}
	
	const playerIndex = game.players.findIndex(
		(player) => player.id === game.currentPlayerId
	);
	
	if (playerIndex === -1) {
		throw new Error(
			`Current player "${game.currentPlayerId}" not found`
		);
	}
	
	const player = game.players[playerIndex];
	
	const result = resolveEvent(
		player,
		characterId,
		game.currentEvent,
		random
	);
	
	const updatedPlayer = {
		...player,
		soul: result.soul,
		status: result.status,
		skipNextTurn: result.skipNextTurn
	};
	
	const updatedPlayers = [...game.players];
	
	updatedPlayers[playerIndex] = updatedPlayer;
	
	return {
		game: {
			...game,
			players: updatedPlayers
		},
		success: result.success,
		gambleWon: result.gambleWon
	};
}