import { RISK_CHANCES } from "@soul/shared";

/**
 * Разрешает риск.
 *
 * Если базовые требования события выполнены —
 * шанс успеха 50%.
 *
 * Если требования не выполнены,
 * но игрок всё равно рискует —
 * шанс падает до 25%.
 */
export function resolveRisk(
  baseSuccess: boolean,
  random: () => number = Math.random,
): boolean {
  const chance = baseSuccess ? RISK_CHANCES.SUCCESS : RISK_CHANCES.FAILURE;

  return random() < chance;
}
