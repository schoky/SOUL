import {
	GAME_RULES,
	type GameState
} from '@soul/shared';

export function startFinalRound(
	game: GameState,
	playerId: string
): GameState {
	if (game.status !== 'playing') {
		throw new Error(
			'Cannot start final round: game is not playing'
		);
	}
	
	if (game.finalRoundStartedBy) {
		return game;
	}
	
	const player = game.players.find(
		(item) =>
			item.id === playerId
	);
	
	if (!player) {
		throw new Error(
			`Player "${playerId}" not found`
		);
	}
	
	if (
		player.soul <
		GAME_RULES.WINNING_SOUL
	) {
		throw new Error(
			`Player "${playerId}" has not reached ${GAME_RULES.WINNING_SOUL} Soul`
		);
	}
	
	return {
		...game,
		finalRoundStartedBy: playerId
	};
}