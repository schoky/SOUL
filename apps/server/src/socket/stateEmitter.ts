import { SOCKET_EVENTS } from "@soul/shared";

import type { GameState } from "@soul/shared";

import { gameManager } from "../game/gameManager.js";
import { roomRepository } from "../rooms/roomRepository.js";

import { getIO } from "./io.js";
import { emitRoomUpdated } from "./roomEvents.js";

/**
 * Отправляет всем в комнате актуальный GameState
 * и, если игра завершена, сохраняет результат в БД
 * и переводит комнату в FINISHED.
 */
export async function emitStateUpdate(
  roomId: string,
  game: GameState,
): Promise<void> {
  const io = getIO();

  io.to(`room:${roomId}`).emit(SOCKET_EVENTS.GAME_STATE_UPDATED, {
    gameState: game,
    characters: game.characters,
  });

  if (game.status !== "finished") {
    return;
  }

  await gameManager.saveFinish(roomId, game);

  try {
    await roomRepository.updateStatus(roomId, "FINISHED");

    await roomRepository.setFinishedAt(roomId, new Date());

    const updatedRoom = await roomRepository.findById(roomId);

    if (updatedRoom) {
      emitRoomUpdated(updatedRoom);
    }
  } catch (error) {
    console.error("Не удалось обновить комнату после финиша:", error);
  }
}
