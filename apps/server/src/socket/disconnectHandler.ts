import { gameManager } from "../game/gameManager.js";
import { advanceTurnLoop } from "../game/turnLoop.js";

import { connectionTracker } from "./connectionTracker.js";
import { emitStateUpdate } from "./stateEmitter.js";

/**
 * Запускает автопас, если отключившийся игрок —
 * текущий активный игрок в незавершённой партии.
 */
export async function handlePlayerDisconnect(
  roomId: string,
  userId: string,
): Promise<void> {
  const game = await gameManager.resolve(roomId);

  if (!game) {
    return;
  }

  if (game.status !== "playing") {
    return;
  }

  if (game.currentPlayerId !== userId) {
    return;
  }

  connectionTracker.scheduleAutoPass(userId, async () => {
    // Игрок мог вернуться за эти 30 секунд
    if (connectionTracker.isConnected(userId)) {
      return;
    }

    const currentGame = await gameManager.resolve(roomId);

    if (!currentGame) {
      return;
    }

    if (currentGame.status !== "playing") {
      return;
    }

    if (currentGame.currentPlayerId !== userId) {
      return;
    }

    const nextGame = advanceTurnLoop(currentGame);

    await gameManager.set(roomId, nextGame);

    await emitStateUpdate(roomId, nextGame);

    // Если следующий игрок тоже отключён —
    // запускаем цепочку дальше.
    if (
      nextGame.status === "playing" &&
      nextGame.currentPlayerId &&
      !connectionTracker.isConnected(nextGame.currentPlayerId)
    ) {
      await handlePlayerDisconnect(roomId, nextGame.currentPlayerId);
    }
  });
}
