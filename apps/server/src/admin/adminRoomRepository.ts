import { database } from "@soul/database";

class AdminRoomRepository {
  async findActive() {
    const rooms = await database.room.findMany({
      where: {
        status: {
          in: ["WAITING", "PLAYING"],
        },
      },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        members: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return rooms.map((room) => ({
      id: room.id,
      code: room.code,
      status: room.status,
      maxPlayers: room.maxPlayers,
      createdAt: room.createdAt.toISOString(),
      host: {
        id: room.host.id,
        nickname: room.host.profile?.nickname ?? "—",
      },
      members: room.members.map((m) => ({
        userId: m.userId,
        nickname: m.user.profile?.nickname ?? "—",
        isReady: m.isReady,
      })),
    }));
  }

  async findRecentGames(limit = 20) {
    const games = await database.game.findMany({
      include: {
        room: true,
        winner: {
          include: { profile: true },
        },
        players: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: limit,
    });

    return games.map((game) => ({
      id: game.id,
      roomId: game.roomId,
      roomCode: game.room.code,
      status: game.status,
      startedAt: game.startedAt.toISOString(),
      finishedAt: game.finishedAt?.toISOString() ?? null,
      winner: game.winner
        ? {
            id: game.winner.id,
            nickname: game.winner.profile?.nickname ?? "—",
          }
        : null,
      playersCount: game.players.length,
    }));
  }

  async findPlayingGames() {
    const games = await database.game.findMany({
      where: {
        status: "PLAYING",
      },
      include: {
        room: true,
        players: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return games.map((game) => {
      const state = game.state as {
        turnNumber?: number;
        currentPlayerId?: string;
      } | null;

      return {
        id: game.id,
        roomId: game.roomId,
        roomCode: game.room.code,
        startedAt: game.startedAt.toISOString(),
        turnNumber: state?.turnNumber ?? 0,
        currentPlayerId: state?.currentPlayerId ?? null,
        players: game.players.map((p) => ({
          userId: p.userId,
          nickname: p.user.profile?.nickname ?? "—",
        })),
      };
    });
  }
}

export const adminRoomRepository = new AdminRoomRepository();
