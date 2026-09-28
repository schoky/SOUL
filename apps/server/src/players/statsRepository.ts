import { database } from "@soul/database";

export type ProfileOverview = {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageSoul: number;
  bestSoul: number;
};

export type ProfileGameEntry = {
  gameId: string;
  finishedAt: Date | null;
  soul: number | null;
  place: number | null;
  won: boolean;
  playersCount: number;
};

class StatsRepository {
  async getOverview(userId: string): Promise<ProfileOverview> {
    const [totalGames, wins, agg] = await Promise.all([
      database.gamePlayer.count({
        where: { userId },
      }),

      database.gameResult.count({
        where: { winnerId: userId },
      }),

      database.gamePlayer.aggregate({
        where: { userId },

        _avg: { finalSoul: true },
        _max: { finalSoul: true },
      }),
    ]);

    return {
      totalGames,
      wins,
      losses: Math.max(0, totalGames - wins),
      winRate: totalGames > 0 ? wins / totalGames : 0,
      averageSoul: agg._avg.finalSoul ?? 0,
      bestSoul: agg._max.finalSoul ?? 0,
    };
  }

  async getRecentGames(
    userId: string,
    limit = 10,
  ): Promise<ProfileGameEntry[]> {
    const rows = await database.gamePlayer.findMany({
      where: { userId },

      orderBy: {
        game: {
          finishedAt: "desc",
        },
      },

      take: limit,

      include: {
        game: {
          include: {
            gameResult: true,

            players: {
              select: {
                userId: true,
                place: true,
                finalSoul: true,
              },
            },
          },
        },
      },
    });

    return rows.map((row) => ({
      gameId: row.gameId,
      finishedAt: row.game.finishedAt,
      soul: row.finalSoul,
      place: row.place,
      won: row.game.gameResult?.winnerId === userId,
      playersCount: row.game.players.length,
    }));
  }
}

export const statsRepository = new StatsRepository();
