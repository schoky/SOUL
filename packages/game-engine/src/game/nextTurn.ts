import type {GameState} from '@soul/shared';

export function nextTurn(
	game: GameState
): GameState {
	if (game.status !== 'playing') {
		throw new Error(
			'Cannot start next turn: game is not playing'
		);
	}
	
	if (game.players.length === 0) {
		throw new Error(
			'Cannot start next turn: no players'
		);
	}
	
	if (!game.currentPlayerId) {
		throw new Error(
			'Cannot start next turn: current player is not set'
		);
	}
	
	const currentPlayerIndex = game.players.findIndex(
		(player) => player.id === game.currentPlayerId
	);
	
	if (currentPlayerIndex === -1) {
		throw new Error(
			`Current player "${game.currentPlayerId}" not found`
		);
	}
	
	const nextPlayerIndex =
		(currentPlayerIndex + 1) % game.players.length;
	
	const nextPlayer =
		game.players[nextPlayerIndex];
	
	return {
		...game,
		currentPlayerId: nextPlayer.id,
		currentEvent: null,
		turnNumber: game.turnNumber + 1
	};
}