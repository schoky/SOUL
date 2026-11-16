import type {
  FriendsListResponse,
  FriendRequestsResponse,
  SendFriendRequestResponse,
  AcceptFriendRequestResponse,
  FriendDto,
  IncomingFriendRequestDto,
  OutgoingFriendRequestDto
} from '@soul/shared';

import { apiRequest } from './client';

export async function getFriends(): Promise<FriendDto[]> {
  const response = await apiRequest<FriendsListResponse>('/api/friends');

  return response.friends;
}

export async function getFriendRequests(): Promise<{
  incoming: IncomingFriendRequestDto[];
  outgoing: OutgoingFriendRequestDto[];
}> {
  return apiRequest<FriendRequestsResponse>('/api/friends/requests');
}

export async function sendFriendRequest(nickname: string): Promise<OutgoingFriendRequestDto> {
  const response = await apiRequest<SendFriendRequestResponse>('/api/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ nickname })
  });

  return response.request;
}

export async function acceptFriendRequest(requestId: string): Promise<FriendDto> {
  const response = await apiRequest<AcceptFriendRequestResponse>(
    `/api/friends/requests/${requestId}/accept`,
    { method: 'POST' }
  );

  return response.friend;
}

export async function declineFriendRequest(requestId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/friends/requests/${requestId}/decline`, {
    method: 'POST'
  });
}

export async function removeFriend(userId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/friends/${userId}`, {
    method: 'DELETE'
  });
}
