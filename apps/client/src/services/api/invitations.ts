import type {
  RoomInvitationDto,
  RoomInvitationsResponse,
  SendRoomInvitationResponse,
  AcceptRoomInvitationResponse
} from '@soul/shared';

import { apiRequest } from './client';

export async function getMyInvitations(): Promise<RoomInvitationDto[]> {
  const response = await apiRequest<RoomInvitationsResponse>('/api/invitations');

  return response.invitations;
}

export async function sendRoomInvitation(
  roomId: string,
  inviteeId: string
): Promise<RoomInvitationDto> {
  const response = await apiRequest<SendRoomInvitationResponse>(
    `/api/rooms/${roomId}/invitations`,
    {
      method: 'POST',
      body: JSON.stringify({ inviteeId })
    }
  );

  return response.invitation;
}

export async function acceptRoomInvitation(invitationId: string): Promise<string> {
  const response = await apiRequest<AcceptRoomInvitationResponse>(
    `/api/invitations/${invitationId}/accept`,
    { method: 'POST' }
  );

  return response.roomId;
}

export async function declineRoomInvitation(invitationId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/invitations/${invitationId}/decline`, {
    method: 'POST'
  });
}
