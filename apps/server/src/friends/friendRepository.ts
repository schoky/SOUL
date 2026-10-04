import { database } from "@soul/database";

class FriendRepository {
  async findUserByNickname(nickname: string) {
    return database.user.findFirst({
      where: {
        profile: {
          nickname,
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async findUserById(userId: string) {
    return database.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  async findFriendshipBetween(userAId: string, userBId: string) {
    return database.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userAId, addresseeId: userBId },
          { requesterId: userBId, addresseeId: userAId },
        ],
      },
    });
  }

  async findById(id: string) {
    return database.friendship.findUnique({
      where: { id },
      include: {
        requester: { include: { profile: true } },
        addressee: { include: { profile: true } },
      },
    });
  }

  async countPendingOutgoing(userId: string) {
    return database.friendship.count({
      where: {
        requesterId: userId,
        status: "PENDING",
      },
    });
  }

  async countRecentOutgoing(userId: string, since: Date) {
    return database.friendship.count({
      where: {
        requesterId: userId,
        createdAt: { gte: since },
      },
    });
  }

  async countUnreadIncoming(userId: string) {
    return database.friendship.count({
      where: {
        addresseeId: userId,
        status: "PENDING",
        readAt: null,
      },
    });
  }

  async markAllIncomingAsRead(userId: string) {
    return database.friendship.updateMany({
      where: {
        addresseeId: userId,
        status: "PENDING",
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async create(requesterId: string, addresseeId: string) {
    return database.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: "PENDING",
      },
    });
  }

  async updateStatus(id: string, status: "ACCEPTED" | "DECLINED") {
    return database.friendship.update({
      where: { id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return database.friendship.delete({ where: { id } });
  }

  async listFriends(userId: string) {
    return database.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { include: { profile: true } },
        addressee: { include: { profile: true } },
      },
      orderBy: {
        respondedAt: "desc",
      },
    });
  }

  async listIncoming(userId: string) {
    return database.friendship.findMany({
      where: {
        addresseeId: userId,
        status: "PENDING",
      },
      include: {
        requester: { include: { profile: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async listOutgoing(userId: string) {
    return database.friendship.findMany({
      where: {
        requesterId: userId,
        status: "PENDING",
      },
      include: {
        addressee: { include: { profile: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const friendRepository = new FriendRepository();
