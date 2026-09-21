import type {Player} from '@soul/shared';

export function determineWinner(
	players: Player[],
	finalRoundStartedBy: string | null
): string {
	if (players.length === 0) {
		throw new Error(
			'Cannot determine winner: no players'
		);
	}
	
	const maxSoul = Math.max(
		...players.map(
			(player) =>
				player.soul
		)
	);
	
	const leaders = players.filter(
		(player) =>
			player.soul === maxSoul
	);
	
	if (leaders.length === 1) {
		return leaders[0].id;
	}
	
	const finalRoundStarter =
		leaders.find(
			(player) =>
				player.id ===
				finalRoundStartedBy
		);
	
	if (finalRoundStarter) {
		return finalRoundStarter.id;
	}
	
	return leaders[0].id;
}