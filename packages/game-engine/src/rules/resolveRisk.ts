export function resolveRisk(
	random: () => number = Math.random
): boolean {
	return random() < 0.5;
}