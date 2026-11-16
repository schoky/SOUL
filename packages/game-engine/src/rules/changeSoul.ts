export function changeSoul(currentSoul: number, amount: number): number {
  return Math.max(0, currentSoul + amount);
}
