import { database } from '@soul/database';

class AdminStatsRepository {
  async getOverview() {
    const [totalUsers, totalGames, activeRooms, activeGames, unpublishedNews] = await Promise.all([
      database.user.count(),
      database.game.count({
        where: { status: 'FINISHED' }
      }),
      database.room.count({
        where: { status: { in: ['WAITING', 'PLAYING'] } }
      }),
      database.game.count({
        where: { status: 'PLAYING' }
      }),
      database.news.count({
        where: { isPublished: false }
      })
    ]);

    // Игроки онлайн за последние 5 минут
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const onlineUsers = await database.session.count({
      where: {
        lastUsedAt: { gte: fiveMinutesAgo }
      }
    });

    return {
      totalUsers,
      totalGames,
      activeRooms,
      activeGames,
      onlineUsers,
      unpublishedNews
    };
  }
}

export const adminStatsRepository = new AdminStatsRepository();
