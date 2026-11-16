import { database } from '@soul/database';
import type { GameHistoryItemDto, GameResultPlayerDto } from '@soul/shared';

class GameHistoryRepository {
  async getUserGames(userId: string, limit: number, offset: number): Promise<GameHistoryItemDto[]> {
    const gamePlayers = await database.gamePlayer.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            players: {
              include: {
                user: {
                  include: { profile: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        game: { startedAt: 'desc' }
      },
      take: limit,
      skip: offset
    });

    return gamePlayers
      .filter((gp) => gp.game.status === 'FINISHED')
      .map((gp) => {
        const game = gp.game;
        const players: GameResultPlayerDto[] = game.players.map((p) => ({
          userId: p.userId,
          name: p.user.profile?.nickname ?? `Игрок ${p.userId.slice(0, 4)}`,
          place: p.place ?? 0,
          finalSoul: p.finalSoul ?? 0
        }));
        const state = game.state as { turnNumber?: number } | null;
        return {
          gameId: game.id,
          roomId: game.roomId,
          startedAt: game.startedAt.toISOString(),
          finishedAt: game.finishedAt?.toISOString() ?? null,
          turns: state?.turnNumber ?? 0,
          place: gp.place ?? 0,
          finalSoul: gp.finalSoul ?? 0,
          players
        };
      });
  }
}

export const gameHistoryRepository = new GameHistoryRepository();
