import type {
  FriendRequestAcceptedPayload,
  FriendRequestReceivedPayload,
  RoomInvitationReceivedPayload
} from '@soul/shared';
import { SOCKET_EVENTS } from '@soul/shared';
import { useEffect } from 'react';

import { socket } from '../services/socket';
import { useToastStore } from '../stores/toastStore';
import { playSound } from '../utils/sounds';

/**
 * Показывает всплывающие уведомления на события
 * друзей и приглашений. Логику стора (friendsStore)
 * не дублирует — только тост и звук.
 */
export function useFriendNotifications() {
  const pushToast = useToastStore((state) => state.push);

  useEffect(() => {
    function onFriendRequestReceived(payload: FriendRequestReceivedPayload) {
      playSound('notification');

      pushToast('info', `${payload.request.from.nickname} хочет добавить тебя в друзья`);
    }

    function onFriendRequestAccepted(payload: FriendRequestAcceptedPayload) {
      playSound('notification');

      pushToast('success', `${payload.friend.nickname} принял твою заявку в друзья`);
    }

    function onRoomInvitationReceived(payload: RoomInvitationReceivedPayload) {
      playSound('notification');

      pushToast(
        'info',
        `${payload.invitation.inviter.nickname} приглашает в комнату ${payload.invitation.roomCode}`
      );
    }

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_RECEIVED, onFriendRequestReceived);

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);

    socket.on(SOCKET_EVENTS.ROOM_INVITATION_RECEIVED, onRoomInvitationReceived);

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_RECEIVED, onFriendRequestReceived);

      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);

      socket.off(SOCKET_EVENTS.ROOM_INVITATION_RECEIVED, onRoomInvitationReceived);
    };
  }, [pushToast]);
}
