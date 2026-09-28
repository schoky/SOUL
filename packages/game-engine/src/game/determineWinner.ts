import type { Player } from "@soul/shared";

export function determineWinner(
  players: Player[],
  finalRoundStartedBy: string | null,
): string {
  if (players.length === 0) {
    throw new Error("Cannot determine winner: no players");
  }

  const maxSoul = Math.max(...players.map((p) => p.soul));

  const leaders = players.filter((p) => p.soul === maxSoul);

  if (leaders.length === 1) {
    return leaders[0].id;
  }

  // При равенстве Soul преимущество у того,
  // кто первым запустил финальный раунд.
  if (
    finalRoundStartedBy &&
    leaders.some((p) => p.id === finalRoundStartedBy)
  ) {
    return finalRoundStartedBy;
  }

  return leaders[0].id;
}
