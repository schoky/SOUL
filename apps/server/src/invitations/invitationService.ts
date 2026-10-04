import type {
  AcceptRoomInvitationResponse,
  RoomInvitationDto,
  RoomInvitationsResponse,
  SendRoomInvitationResponse,
} from "@soul/shared";

import { friendRepository } from "../friends/friendRepository.js";
import { roomRepository } from "../rooms/roomRepository.js";

import { invitationRepository } from "./invitationRepository.js";

import {
  emitRoomInvitationAccepted,
  emitRoomInvitationDeclined,
  emitRoomInvitationReceived,
} from "./emitInvitationEvents.js";

export type InvitationServiceErrorCode =
  | "ROOM_NOT_FOUND"
  | "ROOM_NOT_WAITING"
  | "ROOM_FULL"
  | "NOT_ROOM_MEMBER"
  | "INVITEE_NOT_FOUND"
  | "NOT_FRIENDS"
  | "INVITEE_ALREADY_IN_ROOM"
  | "ALREADY_INVITED"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_NOT_FOR_YOU"
  | "INVITATION_NOT_PENDING"
  | "INVITATION_EXPIRED"
  | "CANNOT_INVITE_SELF";

export class InvitationServiceError extends Error {
  constructor(
    public readonly code: InvitationServiceErrorCode,
    message: string,
  ) {
    super(message);

    this.name = "InvitationServiceError";
  }
}

type RawInvitationWithRelations = {
  id: string;
  roomId: string;
  inviterId: string;
  inviteeId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  createdAt: Date;
  expiresAt: Date;
  readAt: Date | null;
  room: {
    id: string;
    code: string;
    maxPlayers: number;
    status: "WAITING" | "PLAYING" | "FINISHED";
    members?: { userId: string }[];
  };
  inviter: {
    id: string;
    profile: { nickname: string; avatar: string | null } | null;
  };
};

function toInvitationDto(
  invitation: RawInvitationWithRelations,
  membersCount: number,
): RoomInvitationDto {
  return {
    id: invitation.id,
    roomId: invitation.roomId,
    roomCode: invitation.room.code,
    createdAt: invitation.createdAt.toISOString(),
    expiresAt: invitation.expiresAt.toISOString(),
    isRead: invitation.readAt !== null,
    inviter: {
      userId: invitation.inviter.id,
      nickname: invitation.inviter.profile?.nickname ?? "—",
      avatar: invitation.inviter.profile?.avatar ?? null,
    },
    membersCount,
    maxPlayers: invitation.room.maxPlayers,
  };
}

class InvitationService {
  async listForUser(userId: string): Promise<RoomInvitationsResponse> {
    const invitations = await invitationRepository.listPendingForUser(userId);

    const results: RoomInvitationDto[] = [];

    for (const invitation of invitations) {
      if (invitation.room.status !== "WAITING") {
        await invitationRepository.updateStatus(invitation.id, "EXPIRED");

        continue;
      }

      const membersCount = await roomRepository.countMembers(invitation.roomId);

      if (membersCount >= invitation.room.maxPlayers) {
        await invitationRepository.updateStatus(invitation.id, "EXPIRED");

        continue;
      }

      results.push(
        toInvitationDto(
          invitation as unknown as RawInvitationWithRelations,
          membersCount,
        ),
      );
    }

    return { invitations: results };
  }

  async countUnread(userId: string): Promise<number> {
    return invitationRepository.countUnread(userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await invitationRepository.markAllAsRead(userId);
  }

  async sendInvitation(
    inviterId: string,
    roomId: string,
    inviteeId: string,
  ): Promise<SendRoomInvitationResponse> {
    if (inviterId === inviteeId) {
      throw new InvitationServiceError(
        "CANNOT_INVITE_SELF",
        "Нельзя пригласить самого себя",
      );
    }

    const room = await roomRepository.findById(roomId);

    if (!room) {
      throw new InvitationServiceError("ROOM_NOT_FOUND", "Комната не найдена");
    }

    if (room.status !== "WAITING") {
      throw new InvitationServiceError(
        "ROOM_NOT_WAITING",
        "Нельзя пригласить в идущую или завершённую игру",
      );
    }

    const isMember = room.members.some((member) => member.userId === inviterId);

    if (!isMember) {
      throw new InvitationServiceError(
        "NOT_ROOM_MEMBER",
        "Ты не участник этой комнаты",
      );
    }

    if (room.members.length >= room.maxPlayers) {
      throw new InvitationServiceError("ROOM_FULL", "Комната заполнена");
    }

    const invitee = await friendRepository.findUserById(inviteeId);

    if (!invitee) {
      throw new InvitationServiceError(
        "INVITEE_NOT_FOUND",
        "Пользователь не найден",
      );
    }

    const friendship = await friendRepository.findFriendshipBetween(
      inviterId,
      inviteeId,
    );

    if (!friendship || friendship.status !== "ACCEPTED") {
      throw new InvitationServiceError(
        "NOT_FRIENDS",
        "Приглашать можно только друзей",
      );
    }

    const inviteeAlreadyInRoom = room.members.some(
      (member) => member.userId === inviteeId,
    );

    if (inviteeAlreadyInRoom) {
      throw new InvitationServiceError(
        "INVITEE_ALREADY_IN_ROOM",
        "Пользователь уже в этой комнате",
      );
    }

    const hasPending = await invitationRepository.hasPendingForRoom(
      inviteeId,
      roomId,
    );

    if (hasPending) {
      throw new InvitationServiceError(
        "ALREADY_INVITED",
        "Приглашение уже отправлено",
      );
    }

    const created = await invitationRepository.create(
      roomId,
      inviterId,
      inviteeId,
    );

    const invitation = await invitationRepository.findById(created.id);

    if (!invitation) {
      throw new InvitationServiceError(
        "INVITATION_NOT_FOUND",
        "Не удалось загрузить приглашение",
      );
    }

    const dto = toInvitationDto(
      invitation as unknown as RawInvitationWithRelations,
      room.members.length,
    );

    emitRoomInvitationReceived(inviteeId, dto);

    return { invitation: dto };
  }

  async acceptInvitation(
    userId: string,
    invitationId: string,
  ): Promise<AcceptRoomInvitationResponse> {
    const invitation = await invitationRepository.findById(invitationId);

    if (!invitation) {
      throw new InvitationServiceError(
        "INVITATION_NOT_FOUND",
        "Приглашение не найдено",
      );
    }

    if (invitation.inviteeId !== userId) {
      throw new InvitationServiceError(
        "INVITATION_NOT_FOR_YOU",
        "Это приглашение не для тебя",
      );
    }

    if (invitation.status !== "PENDING") {
      throw new InvitationServiceError(
        "INVITATION_NOT_PENDING",
        "Приглашение уже обработано",
      );
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      await invitationRepository.updateStatus(invitationId, "EXPIRED");

      throw new InvitationServiceError(
        "INVITATION_EXPIRED",
        "Приглашение истекло",
      );
    }

    if (invitation.room.status !== "WAITING") {
      await invitationRepository.updateStatus(invitationId, "EXPIRED");

      throw new InvitationServiceError(
        "ROOM_NOT_WAITING",
        "Игра уже началась или комната закрыта",
      );
    }

    const membersCount = await roomRepository.countMembers(invitation.roomId);

    if (membersCount >= invitation.room.maxPlayers) {
      await invitationRepository.updateStatus(invitationId, "EXPIRED");

      throw new InvitationServiceError("ROOM_FULL", "Комната заполнена");
    }

    const existingMember = await roomRepository.findMemberByUserId(userId);

    if (existingMember && existingMember.roomId !== invitation.roomId) {
      throw new InvitationServiceError(
        "INVITEE_ALREADY_IN_ROOM",
        "Ты уже в другой комнате. Выйди из неё, чтобы присоединиться.",
      );
    }

    if (!existingMember) {
      await roomRepository.addMember(invitation.roomId, userId);
    }

    await invitationRepository.updateStatus(invitationId, "ACCEPTED");

    emitRoomInvitationAccepted(
      invitation.inviterId,
      invitationId,
      invitation.roomId,
    );

    return { roomId: invitation.roomId };
  }

  async declineInvitation(userId: string, invitationId: string): Promise<void> {
    const invitation = await invitationRepository.findById(invitationId);

    if (!invitation) {
      throw new InvitationServiceError(
        "INVITATION_NOT_FOUND",
        "Приглашение не найдено",
      );
    }

    if (invitation.inviteeId !== userId) {
      throw new InvitationServiceError(
        "INVITATION_NOT_FOR_YOU",
        "Это приглашение не для тебя",
      );
    }

    if (invitation.status !== "PENDING") {
      throw new InvitationServiceError(
        "INVITATION_NOT_PENDING",
        "Приглашение уже обработано",
      );
    }

    await invitationRepository.updateStatus(invitationId, "DECLINED");

    emitRoomInvitationDeclined(invitation.inviterId, invitationId);
  }
}

export const invitationService = new InvitationService();
