import type { GameState } from "@soul/shared";
import { SOCKET_EVENTS } from "@soul/shared";

import { gameManager } from "../game/gameManager.js";
import { roomRepository } from "../rooms/roomRepository.js";

import { getIO } from "./io.js";
import { emitRoomUpdated } from "./roomEvents.js";

const ADMIN_CHANNEL = "admin";

/**
 * Отправляет всем в комнате актуальный GameState
 * и, если игра завершена, сохраняет результат в БД
 * и переводит комнату в FINISHED.
 *
 * Также сигналит админам, чтобы те перечитали
 * список активных партий.
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

  io.to(ADMIN_CHANNEL).emit(SOCKET_EVENTS.ADMIN_GAMES_UPDATED);

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
