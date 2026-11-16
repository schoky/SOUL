export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED';

export type RoomProfileDto = {
  id: string;
  nickname: string;
  avatar: string | null;
};

export type RoomUserDto = {
  id: string;
  profile: RoomProfileDto;
};

export type RoomMemberDto = {
  roomId: string;
  userId: string;
  isReady: boolean;
  joinedAt: string;
  user: RoomUserDto;
};

export type RoomDto = {
  id: string;
  code: string;
  hostUserId: string;
  status: RoomStatus;
  maxPlayers: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;

  host: RoomUserDto;

  members: RoomMemberDto[];
};

export type RoomListResponse = {
  rooms: RoomDto[];
};

export type RoomResponse = {
  room: RoomDto | null;
};

export type RoomErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export type CreateRoomRequest = {
  maxPlayers?: number;
};

export type RoomPreviewDto = {
  id: string;
  code: string;
  status: RoomStatus;
  maxPlayers: number;
  membersCount: number;
  hostNickname: string;
};

export type RoomPreviewResponse = {
  room: RoomPreviewDto;
};
