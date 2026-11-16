import type {
  FriendDto,
  FriendRemovedPayload,
  FriendRequestAcceptedPayload,
  FriendRequestDeclinedPayload,
  FriendRequestReceivedPayload,
  IncomingFriendRequestDto,
  OutgoingFriendRequestDto,
  RoomInvitationAcceptedPayload,
  RoomInvitationDeclinedPayload,
  RoomInvitationDto,
  RoomInvitationReceivedPayload,
  UnreadCountDto
} from '@soul/shared';
import { SOCKET_EVENTS } from '@soul/shared';
import { create } from 'zustand';

import { getFriendRequests, getFriends } from '../services/api/friends';
import { getMyInvitations } from '../services/api/invitations';
import { getUnreadCount, markNotificationsAsRead } from '../services/api/notifications';
import { socket } from '../services/socket';

type FriendsState = {
  friends: FriendDto[];
  incoming: IncomingFriendRequestDto[];
  outgoing: OutgoingFriendRequestDto[];
  invitations: RoomInvitationDto[];

  unread: UnreadCountDto;

  isLoading: boolean;

  hasLoaded: boolean;

  load: () => Promise<void>;

  clear: () => void;

  markAllAsRead: () => Promise<void>;

  subscribeToRealtime: () => () => void;
};

const EMPTY_UNREAD: UnreadCountDto = {
  friendRequests: 0,
  invitations: 0,
  total: 0
};

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: [],
  incoming: [],
  outgoing: [],
  invitations: [],

  unread: EMPTY_UNREAD,

  isLoading: false,
  hasLoaded: false,

  /**
   * Загружает друзей, заявки и приглашения.
   *
   * Использует Promise.allSettled вместо Promise.all —
   * если один из эндпоинтов временно падает, остальные
   * данные всё равно попадут в стор, а не пропадут целиком.
   */
  load: async () => {
    set({ isLoading: true });

    try {
      const [friendsResult, requestsResult, invitationsResult, unreadResult] =
        await Promise.allSettled([
          getFriends(),
          getFriendRequests(),
          getMyInvitations(),
          getUnreadCount()
        ]);

      set((state) => {
        const next: Partial<FriendsState> = { hasLoaded: true };

        if (friendsResult.status === 'fulfilled') {
          next.friends = friendsResult.value;
        }

        if (requestsResult.status === 'fulfilled') {
          next.incoming = requestsResult.value.incoming;
          next.outgoing = requestsResult.value.outgoing;
        }

        if (invitationsResult.status === 'fulfilled') {
          next.invitations = invitationsResult.value;
        }

        if (unreadResult.status === 'fulfilled') {
          next.unread = unreadResult.value;
        } else {
          // Если счётчик не подтянулся — считаем локально
          // из того, что уже пришло.
          const incoming = next.incoming ?? state.incoming;
          const invitations = next.invitations ?? state.invitations;

          const friendRequests = incoming.filter((r) => !r.isRead).length;

          const invitationsUnread = invitations.filter((i) => !i.isRead).length;

          next.unread = {
            friendRequests,
            invitations: invitationsUnread,
            total: friendRequests + invitationsUnread
          };
        }

        return next as FriendsState;
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clear: () => {
    set({
      friends: [],
      incoming: [],
      outgoing: [],
      invitations: [],
      unread: EMPTY_UNREAD,
      hasLoaded: false
    });
  },

  markAllAsRead: async () => {
    await markNotificationsAsRead();

    set((state) => ({
      unread: EMPTY_UNREAD,
      incoming: state.incoming.map((r) => ({ ...r, isRead: true })),
      invitations: state.invitations.map((i) => ({ ...i, isRead: true }))
    }));
  },

  subscribeToRealtime: () => {
    function onFriendRequestReceived(payload: FriendRequestReceivedPayload) {
      set((state) => {
        if (state.incoming.some((r) => r.id === payload.request.id)) {
          return state;
        }

        const isUnread = !payload.request.isRead;

        return {
          incoming: [payload.request, ...state.incoming],
          unread: isUnread
            ? {
                ...state.unread,
                friendRequests: state.unread.friendRequests + 1,
                total: state.unread.total + 1
              }
            : state.unread
        };
      });
    }

    function onFriendRequestAccepted(payload: FriendRequestAcceptedPayload) {
      set((state) => ({
        friends: [
          payload.friend,
          ...state.friends.filter((f) => f.userId !== payload.friend.userId)
        ],
        incoming: state.incoming.filter((r) => r.from.userId !== payload.friend.userId),
        outgoing: state.outgoing.filter((r) => r.to.userId !== payload.friend.userId)
      }));
    }

    function onFriendRequestDeclined(payload: FriendRequestDeclinedPayload) {
      set((state) => ({
        outgoing: state.outgoing.filter((r) => r.id !== payload.requestId)
      }));
    }

    function onFriendRemoved(payload: FriendRemovedPayload) {
      set((state) => ({
        friends: state.friends.filter((f) => f.userId !== payload.userId)
      }));
    }

    function onRoomInvitationReceived(payload: RoomInvitationReceivedPayload) {
      set((state) => {
        if (state.invitations.some((i) => i.id === payload.invitation.id)) {
          return state;
        }

        const isUnread = !payload.invitation.isRead;

        return {
          invitations: [payload.invitation, ...state.invitations],
          unread: isUnread
            ? {
                ...state.unread,
                invitations: state.unread.invitations + 1,
                total: state.unread.total + 1
              }
            : state.unread
        };
      });
    }

    function onRoomInvitationAccepted(payload: RoomInvitationAcceptedPayload) {
      set((state) => ({
        invitations: state.invitations.filter((i) => i.id !== payload.invitationId)
      }));
    }

    function onRoomInvitationDeclined(payload: RoomInvitationDeclinedPayload) {
      set((state) => ({
        invitations: state.invitations.filter((i) => i.id !== payload.invitationId)
      }));
    }

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_RECEIVED, onFriendRequestReceived);

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_DECLINED, onFriendRequestDeclined);

    socket.on(SOCKET_EVENTS.FRIEND_REMOVED, onFriendRemoved);

    socket.on(SOCKET_EVENTS.ROOM_INVITATION_RECEIVED, onRoomInvitationReceived);

    socket.on(SOCKET_EVENTS.ROOM_INVITATION_ACCEPTED, onRoomInvitationAccepted);

    socket.on(SOCKET_EVENTS.ROOM_INVITATION_DECLINED, onRoomInvitationDeclined);

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_RECEIVED, onFriendRequestReceived);

      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);

      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_DECLINED, onFriendRequestDeclined);

      socket.off(SOCKET_EVENTS.FRIEND_REMOVED, onFriendRemoved);

      socket.off(SOCKET_EVENTS.ROOM_INVITATION_RECEIVED, onRoomInvitationReceived);

      socket.off(SOCKET_EVENTS.ROOM_INVITATION_ACCEPTED, onRoomInvitationAccepted);

      socket.off(SOCKET_EVENTS.ROOM_INVITATION_DECLINED, onRoomInvitationDeclined);
    };
  }
}));
