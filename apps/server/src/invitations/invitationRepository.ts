import { database } from "@soul/database";

const INVITATION_TTL_MS = 10 * 60 * 1000;

class InvitationRepository {
  async findById(id: string) {
    return database.roomInvitation.findUnique({
      where: { id },
      include: {
        room: true,
        inviter: { include: { profile: true } },
        invitee: { include: { profile: true } },
      },
    });
  }

  async findPendingBetween(
    roomId: string,
    inviterId: string,
    inviteeId: string,
  ) {
    return database.roomInvitation.findFirst({
      where: {
        roomId,
        inviterId,
        inviteeId,
        status: "PENDING",
      },
    });
  }

  async create(roomId: string, inviterId: string, inviteeId: string) {
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

    return database.roomInvitation.create({
      data: {
        roomId,
        inviterId,
        inviteeId,
        expiresAt,
        status: "PENDING",
      },
    });
  }

  async updateStatus(id: string, status: "ACCEPTED" | "DECLINED" | "EXPIRED") {
    return database.roomInvitation.update({
      where: { id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });
  }

  async listPendingForUser(userId: string) {
    const now = new Date();

    await database.roomInvitation.updateMany({
      where: {
        inviteeId: userId,
        status: "PENDING",
        expiresAt: { lt: now },
      },
      data: {
        status: "EXPIRED",
        respondedAt: now,
      },
    });

    return database.roomInvitation.findMany({
      where: {
        inviteeId: userId,
        status: "PENDING",
        expiresAt: { gte: now },
      },
      include: {
        room: true,
        inviter: { include: { profile: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async countUnread(userId: string) {
    const now = new Date();

    return database.roomInvitation.count({
      where: {
        inviteeId: userId,
        status: "PENDING",
        expiresAt: { gte: now },
        readAt: null,
      },
    });
  }

  async markAllAsRead(userId: string) {
    const now = new Date();

    return database.roomInvitation.updateMany({
      where: {
        inviteeId: userId,
        status: "PENDING",
        expiresAt: { gte: now },
        readAt: null,
      },
      data: {
        readAt: now,
      },
    });
  }

  async hasPendingForRoom(inviteeId: string, roomId: string) {
    const now = new Date();

    const invitation = await database.roomInvitation.findFirst({
      where: {
        inviteeId,
        roomId,
        status: "PENDING",
        expiresAt: { gte: now },
      },
    });

    return Boolean(invitation);
  }
}

export const invitationRepository = new InvitationRepository();
