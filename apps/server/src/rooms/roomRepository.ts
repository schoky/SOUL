import { database } from "@soul/database";

type CreateRoomData = {
  code: string;
  hostUserId: string;
  maxPlayers: number;
};

class RoomRepository {
  /**
   * Находит комнату по её ID.
   *
   * Возвращаем только те данные пользователя,
   * которые нужны клиенту Lobby/Room.
   */
  async findById(id: string) {
    return database.room.findUnique({
      where: {
        id,
      },

      include: {
        host: {
          select: {
            id: true,

            profile: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },

        members: {
          select: {
            roomId: true,
            userId: true,
            isReady: true,
            joinedAt: true,

            user: {
              select: {
                id: true,

                profile: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                  },
                },
              },
            },
          },

          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });
  }

  /**
   * Находит комнату по коду приглашения.
   */
  async findByCode(code: string) {
    return database.room.findUnique({
      where: {
        code,
      },

      include: {
        host: {
          select: {
            id: true,

            profile: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },

        members: {
          select: {
            roomId: true,
            userId: true,
            isReady: true,
            joinedAt: true,

            user: {
              select: {
                id: true,

                profile: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                  },
                },
              },
            },
          },

          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });
  }

  /**
   * Возвращает комнаты, которые ещё ждут игроков.
   */
  async findWaitingRooms() {
    return database.room.findMany({
      where: {
        status: "WAITING",
      },

      include: {
        host: {
          select: {
            id: true,

            profile: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },

        members: {
          select: {
            roomId: true,
            userId: true,
            isReady: true,
            joinedAt: true,

            user: {
              select: {
                id: true,

                profile: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                  },
                },
              },
            },
          },

          orderBy: {
            joinedAt: "asc",
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Создаёт комнату и одновременно добавляет
   * создателя как её первого участника.
   */
  async createWithHost(data: CreateRoomData) {
    return database.$transaction(async (transaction) => {
      const room = await transaction.room.create({
        data: {
          code: data.code,
          hostUserId: data.hostUserId,
          maxPlayers: data.maxPlayers,
        },
      });

      await transaction.roomMember.create({
        data: {
          roomId: room.id,
          userId: data.hostUserId,
        },
      });

      return room;
    });
  }

  /**
   * Добавляет пользователя в комнату.
   */
  async addMember(roomId: string, userId: string) {
    return database.roomMember.create({
      data: {
        roomId,
        userId,
      },
    });
  }

  /**
   * Находит участника по составному ключу:
   * roomId + userId.
   */
  async findMember(roomId: string, userId: string) {
    return database.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });
  }

  /**
   * Находит комнату, в которой сейчас находится пользователь.
   */
  async findMemberByUserId(userId: string) {
    return database.roomMember.findUnique({
      where: {
        userId,
      },

      include: {
        room: true,
      },
    });
  }

  /**
   * Обновляет флаг готовности участника комнаты.
   */
  async setMemberReady(roomId: string, userId: string, isReady: boolean) {
    return database.roomMember.update({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },

      data: {
        isReady,
      },
    });
  }

  /**
   * Удаляет пользователя из комнаты.
   */
  async removeMember(roomId: string, userId: string) {
    return database.roomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });
  }

  /**
   * Назначает другого пользователя хостом комнаты.
   */
  async updateHost(roomId: string, userId: string) {
    return database.room.update({
      where: {
        id: roomId,
      },

      data: {
        hostUserId: userId,
      },
    });
  }

  /**
   * Удаляет комнату.
   */
  async delete(id: string) {
    return database.room.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Возвращает количество участников комнаты.
   */
  async countMembers(roomId: string) {
    return database.roomMember.count({
      where: {
        roomId,
      },
    });
  }
}

export const roomRepository = new RoomRepository();
