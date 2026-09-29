import { database } from "@soul/database";
import type { LeaderboardEntryDto } from "@soul/shared";

class LeaderboardRepository {
  async getLeaderboard(limit: number): Promise<LeaderboardEntryDto[]> {
    const groups = await database.gamePlayer.groupBy({
      by: ["userId"],
      where: {
        game: { status: "FINISHED" },
      },
      _count: { _all: true },
      _sum: { finalSoul: true },
      _max: { finalSoul: true },
    });

    const winsGroups = await database.gamePlayer.groupBy({
      by: ["userId"],
      where: {
        game: { status: "FINISHED" },
        place: 1,
      },
      _count: { _all: true },
    });

    const winsMap = new Map(winsGroups.map((g) => [g.userId, g._count._all]));

    const userIds = groups.map((g) => g.userId);

    const users = await database.user.findMany({
      where: { id: { in: userIds } },
      include: { profile: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const entries = groups.map((g) => {
      const user = userMap.get(g.userId);
      const name = user?.profile?.nickname ?? `Игрок ${g.userId.slice(0, 4)}`;
      return {
        userId: g.userId,
        name,
        gamesPlayed: g._count._all,
        wins: winsMap.get(g.userId) ?? 0,
        totalSoul: g._sum.finalSoul ?? 0,
        bestSoul: g._max.finalSoul ?? 0,
      };
    });

    entries.sort((a, b) => b.wins - a.wins || b.totalSoul - a.totalSoul);

    return entries.slice(0, limit);
  }
}

export const leaderboardRepository = new LeaderboardRepository();
