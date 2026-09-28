import { database } from "@soul/database";

import type { GameResultDto, GameResultPlayerDto } from "@soul/shared";

class GameResultRepository {
  /**
   * Возвращает итоги завершённой игры по roomId.
   *
   * Возвращает null, если игры нет или она ещё
   * не завершена.
   */
  async findByRoomId(roomId: string): Promise<GameResultDto | null> {
    const game = await database.game.findFirst({
      where: {
        roomId,
      },

      orderBy: {
        startedAt: "desc",
      },

      include: {
        players: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      return null;
    }

    if (game.status !== "FINISHED") {
      return null;
    }

    const players: GameResultPlayerDto[] = game.players
      .filter((p) => p.place !== null && p.finalSoul !== null)
      .sort((a, b) => (a.place ?? 0) - (b.place ?? 0))
      .map((p) => ({
        userId: p.userId,
        name: p.user.profile?.nickname ?? `Игрок ${p.userId.slice(0, 4)}`,
        place: p.place ?? 0,
        finalSoul: p.finalSoul ?? 0,
      }));

    const state = game.state as { turnNumber?: number } | null;

    return {
      gameId: game.id,
      roomId: game.roomId,
      startedAt: game.startedAt.toISOString(),
      finishedAt: game.finishedAt?.toISOString() ?? null,
      turns: state?.turnNumber ?? 0,
      winnerId: game.winnerId,
      players,
    };
  }
}

export const gameResultRepository = new GameResultRepository();
