import { database } from "@soul/database";

import type { GameState } from "@soul/shared";

class GameRepository {
  /**
   * Сохраняет или обновляет состояние игры,
   * привязанной к комнате.
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
   * Сохраняет итоги завершённой игры:
   * GamePlayer для каждого игрока
   * и GameResult с победителем.
   *
   * Вызывается один раз после того,
   * как game.status === 'finished'.
   */
  async saveFinish(roomId: string, state: GameState): Promise<void> {
    if (state.status !== "finished") {
      return;
    }

    const game = await this.findByRoomId(roomId);

    if (!game) {
      return;
    }

    // Если итоги уже сохранены — второй раз не пишем.
    // GameResult имеет @unique на gameId,
    // поэтому проверка через него.
    const existingResult = await database.gameResult.findUnique({
      where: {
        gameId: game.id,
      },
    });

    if (existingResult) {
      return;
    }

    // Определяем места:
    // 1) по soul по убыванию;
    // 2) при равенстве — инициатор финального раунда выше;
    // 3) при равенстве и этого — по порядку в массиве players.
    const ordered = [...state.players].sort((a, b) => {
      if (b.soul !== a.soul) {
        return b.soul - a.soul;
      }

      const aIsInitiator = a.id === state.finalRoundStartedBy;

      const bIsInitiator = b.id === state.finalRoundStartedBy;

      if (aIsInitiator && !bIsInitiator) {
        return -1;
      }

      if (!aIsInitiator && bIsInitiator) {
        return 1;
      }

      return 0;
    });

    await database.$transaction(async (tx) => {
      for (let index = 0; index < ordered.length; index += 1) {
        const player = ordered[index];

        await tx.gamePlayer.create({
          data: {
            gameId: game.id,
            userId: player.id,
            finalSoul: player.soul,
            place: index + 1,
          },
        });
      }

      await tx.gameResult.create({
        data: {
          gameId: game.id,
          winnerId: state.winnerId,
        },
      });
    });
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
