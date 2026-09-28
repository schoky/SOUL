import { database } from "@soul/database";

import type { GameState } from "@soul/shared";

class GameRepository {
  /**
   * Сохраняет или обновляет состояние игры,
   * привязанной к комнате.
   *
   * Одна комната — одна активная игра.
   */
  async save(roomId: string, state: GameState) {
    const existing = await database.game.findFirst({
      where: {
        roomId,
      },

      orderBy: {
        startedAt: "desc",
      },
    });

    if (!existing) {
      return database.game.create({
        data: {
          roomId,
          status: "PLAYING",
          state: state as unknown as object,
        },
      });
    }

    return database.game.update({
      where: {
        id: existing.id,
      },

      data: {
        status: state.status === "finished" ? "FINISHED" : "PLAYING",

        winnerId: state.winnerId,

        finishedAt: state.status === "finished" ? new Date() : null,

        state: state as unknown as object,
      },
    });
  }

  /**
   * Находит игру по комнате.
   */
  async findByRoomId(roomId: string) {
    return database.game.findFirst({
      where: {
        roomId,
      },

      orderBy: {
        startedAt: "desc",
      },
    });
  }

  /**
   * Возвращает состояние игры по комнате
   * или null, если игры нет.
   */
  async findStateByRoomId(roomId: string): Promise<GameState | null> {
    const game = await this.findByRoomId(roomId);

    if (!game || !game.state) {
      return null;
    }

    return game.state as unknown as GameState;
  }

  /**
   * Удаляет все игры комнаты.
   */
  async deleteByRoomId(roomId: string) {
    return database.game.deleteMany({
      where: {
        roomId,
      },
    });
  }
}

export const gameRepository = new GameRepository();
