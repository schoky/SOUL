import type {
  AcceptFriendRequestResponse,
  FriendDto,
  FriendRequestsResponse,
  FriendsListResponse,
  IncomingFriendRequestDto,
  OutgoingFriendRequestDto,
  SendFriendRequestResponse,
} from "@soul/shared";

import { connectionTracker } from "../socket/connectionTracker.js";

import { friendRepository } from "./friendRepository.js";

import {
  emitFriendRemoved,
  emitFriendRequestAccepted,
  emitFriendRequestDeclined,
  emitFriendRequestReceived,
} from "./emitFriendEvents.js";

const MAX_ACTIVE_OUTGOING = 50;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_PER_WINDOW = 20;

export type FriendServiceErrorCode =
  | "USER_NOT_FOUND"
  | "CANNOT_FRIEND_SELF"
  | "USER_BLOCKED"
  | "ALREADY_FRIENDS"
  | "REQUEST_ALREADY_SENT"
  | "TOO_MANY_ACTIVE_REQUESTS"
  | "RATE_LIMIT_EXCEEDED"
  | "REQUEST_NOT_FOUND"
  | "REQUEST_NOT_FOR_YOU"
  | "REQUEST_NOT_PENDING"
  | "FRIENDSHIP_NOT_FOUND";

export class FriendServiceError extends Error {
  constructor(
    public readonly code: FriendServiceErrorCode,
    message: string,
  ) {
    super(message);

    this.name = "FriendServiceError";
  }
}

type RawUserWithProfile = {
  id: string;
  isBlocked: boolean;
  profile: { nickname: string; avatar: string | null } | null;
};

type RawFriendship = {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: Date;
  respondedAt: Date | null;
  readAt: Date | null;
  requester: RawUserWithProfile;
  addressee: RawUserWithProfile;
};

type RawIncoming = {
  id: string;
  createdAt: Date;
  readAt: Date | null;
  requester: RawUserWithProfile;
};

type RawOutgoing = {
  id: string;
  createdAt: Date;
  addressee: RawUserWithProfile;
};

function nicknameOf(user: RawUserWithProfile): string {
  return user.profile?.nickname ?? "—";
}

function toFriendDto(
  friendship: RawFriendship,
  currentUserId: string,
): FriendDto {
  const other =
    friendship.requesterId === currentUserId
      ? friendship.addressee
      : friendship.requester;

  return {
    userId: other.id,
    nickname: nicknameOf(other),
    avatar: other.profile?.avatar ?? null,
    isOnline: connectionTracker.isConnected(other.id),
    friendsSince: (
      friendship.respondedAt ?? friendship.createdAt
    ).toISOString(),
  };
}

function toIncomingDto(friendship: RawIncoming): IncomingFriendRequestDto {
  return {
    id: friendship.id,
    createdAt: friendship.createdAt.toISOString(),
    isRead: friendship.readAt !== null,
    from: {
      userId: friendship.requester.id,
      nickname: nicknameOf(friendship.requester),
      avatar: friendship.requester.profile?.avatar ?? null,
    },
  };
}

function toOutgoingDto(friendship: RawOutgoing): OutgoingFriendRequestDto {
  return {
    id: friendship.id,
    createdAt: friendship.createdAt.toISOString(),
    to: {
      userId: friendship.addressee.id,
      nickname: nicknameOf(friendship.addressee),
      avatar: friendship.addressee.profile?.avatar ?? null,
    },
  };
}

class FriendService {
  async listFriends(userId: string): Promise<FriendsListResponse> {
    const friendships = await friendRepository.listFriends(userId);

    return {
      friends: friendships.map((item) =>
        toFriendDto(item as unknown as RawFriendship, userId),
      ),
    };
  }

  async listRequests(userId: string): Promise<FriendRequestsResponse> {
    const [incoming, outgoing] = await Promise.all([
      friendRepository.listIncoming(userId),
      friendRepository.listOutgoing(userId),
    ]);

    return {
      incoming: incoming.map((item) =>
        toIncomingDto(item as unknown as RawIncoming),
      ),
      outgoing: outgoing.map((item) =>
        toOutgoingDto(item as unknown as RawOutgoing),
      ),
    };
  }

  async countUnread(userId: string): Promise<number> {
    return friendRepository.countUnreadIncoming(userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await friendRepository.markAllIncomingAsRead(userId);
  }

  async sendRequest(
    requesterId: string,
    nickname: string,
  ): Promise<SendFriendRequestResponse> {
    const target = await friendRepository.findUserByNickname(nickname);

    if (!target) {
      throw new FriendServiceError(
        "USER_NOT_FOUND",
        "Пользователь с таким ником не найден",
      );
    }

    if (target.id === requesterId) {
      throw new FriendServiceError(
        "CANNOT_FRIEND_SELF",
        "Нельзя добавить себя в друзья",
      );
    }

    if (target.isBlocked) {
      throw new FriendServiceError(
        "USER_BLOCKED",
        "Этот пользователь заблокирован",
      );
    }

    const existing = await friendRepository.findFriendshipBetween(
      requesterId,
      target.id,
    );

    if (existing) {
      if (existing.status === "ACCEPTED") {
        throw new FriendServiceError("ALREADY_FRIENDS", "Вы уже друзья");
      }

      if (existing.status === "PENDING") {
        if (existing.requesterId === target.id) {
          const accepted = await friendRepository.updateStatus(
            existing.id,
            "ACCEPTED",
          );

          const reloaded = await friendRepository.findById(accepted.id);

          if (!reloaded) {
            throw new FriendServiceError(
              "FRIENDSHIP_NOT_FOUND",
              "Не удалось загрузить заявку",
            );
          }

          const friendForMe = toFriendDto(
            reloaded as unknown as RawFriendship,
            requesterId,
          );

          const friendForTarget = toFriendDto(
            reloaded as unknown as RawFriendship,
            target.id,
          );

          emitFriendRequestAccepted(requesterId, friendForMe);
          emitFriendRequestAccepted(target.id, friendForTarget);

          return {
            request: {
              id: accepted.id,
              createdAt: accepted.createdAt.toISOString(),
              to: {
                userId: target.id,
                nickname: nicknameOf(target as unknown as RawUserWithProfile),
                avatar: target.profile?.avatar ?? null,
              },
            },
          };
        }

        throw new FriendServiceError(
          "REQUEST_ALREADY_SENT",
          "Заявка уже отправлена",
        );
      }

      if (existing.status === "DECLINED") {
        await friendRepository.delete(existing.id);
      }
    }

    const pending = await friendRepository.countPendingOutgoing(requesterId);

    if (pending >= MAX_ACTIVE_OUTGOING) {
      throw new FriendServiceError(
        "TOO_MANY_ACTIVE_REQUESTS",
        `Нельзя иметь больше ${MAX_ACTIVE_OUTGOING} активных заявок`,
      );
    }

    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    const recent = await friendRepository.countRecentOutgoing(
      requesterId,
      since,
    );

    if (recent >= RATE_LIMIT_MAX_PER_WINDOW) {
      throw new FriendServiceError(
        "RATE_LIMIT_EXCEEDED",
        "Слишком много заявок за последнюю минуту",
      );
    }

    const created = await friendRepository.create(requesterId, target.id);

    const requester = await friendRepository.findUserById(requesterId);

    if (requester) {
      emitFriendRequestReceived(target.id, {
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        isRead: false,
        from: {
          userId: requester.id,
          nickname: nicknameOf(requester as unknown as RawUserWithProfile),
          avatar: requester.profile?.avatar ?? null,
        },
      });
    }

    return {
      request: {
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        to: {
          userId: target.id,
          nickname: nicknameOf(target as unknown as RawUserWithProfile),
          avatar: target.profile?.avatar ?? null,
        },
      },
    };
  }

  async acceptRequest(
    userId: string,
    requestId: string,
  ): Promise<AcceptFriendRequestResponse> {
    const friendship = await friendRepository.findById(requestId);

    if (!friendship) {
      throw new FriendServiceError("REQUEST_NOT_FOUND", "Заявка не найдена");
    }

    if (friendship.addresseeId !== userId) {
      throw new FriendServiceError(
        "REQUEST_NOT_FOR_YOU",
        "Эта заявка не для тебя",
      );
    }

    if (friendship.status !== "PENDING") {
      throw new FriendServiceError(
        "REQUEST_NOT_PENDING",
        "Заявка уже обработана",
      );
    }

    await friendRepository.updateStatus(requestId, "ACCEPTED");

    const reloaded = await friendRepository.findById(requestId);

    if (!reloaded) {
      throw new FriendServiceError(
        "FRIENDSHIP_NOT_FOUND",
        "Не удалось загрузить обновлённую заявку",
      );
    }

    const friendForMe = toFriendDto(
      reloaded as unknown as RawFriendship,
      userId,
    );

    const friendForRequester = toFriendDto(
      reloaded as unknown as RawFriendship,
      friendship.requesterId,
    );

    emitFriendRequestAccepted(userId, friendForMe);
    emitFriendRequestAccepted(friendship.requesterId, friendForRequester);

    return { friend: friendForMe };
  }

  async declineRequest(userId: string, requestId: string): Promise<void> {
    const friendship = await friendRepository.findById(requestId);

    if (!friendship) {
      throw new FriendServiceError("REQUEST_NOT_FOUND", "Заявка не найдена");
    }

    if (friendship.addresseeId !== userId) {
      throw new FriendServiceError(
        "REQUEST_NOT_FOR_YOU",
        "Эта заявка не для тебя",
      );
    }

    if (friendship.status !== "PENDING") {
      throw new FriendServiceError(
        "REQUEST_NOT_PENDING",
        "Заявка уже обработана",
      );
    }

    await friendRepository.updateStatus(requestId, "DECLINED");

    emitFriendRequestDeclined(friendship.requesterId, requestId);
  }

  async removeFriend(userId: string, friendUserId: string): Promise<void> {
    const friendship = await friendRepository.findFriendshipBetween(
      userId,
      friendUserId,
    );

    if (!friendship || friendship.status !== "ACCEPTED") {
      throw new FriendServiceError(
        "FRIENDSHIP_NOT_FOUND",
        "Этот пользователь не у тебя в друзьях",
      );
    }

    await friendRepository.delete(friendship.id);

    emitFriendRemoved(userId, friendUserId);
    emitFriendRemoved(friendUserId, userId);
  }
}

export const friendService = new FriendService();
