export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export type FriendDto = {
  userId: string;
  nickname: string;
  avatar: string | null;
  isOnline: boolean;
  friendsSince: string;
};

export type IncomingFriendRequestDto = {
  id: string;
  createdAt: string;
  isRead: boolean;
  from: {
    userId: string;
    nickname: string;
    avatar: string | null;
  };
};

export type OutgoingFriendRequestDto = {
  id: string;
  createdAt: string;
  to: {
    userId: string;
    nickname: string;
    avatar: string | null;
  };
};

export type FriendsListResponse = {
  friends: FriendDto[];
};

export type FriendRequestsResponse = {
  incoming: IncomingFriendRequestDto[];
  outgoing: OutgoingFriendRequestDto[];
};

export type SendFriendRequestInput = {
  nickname: string;
};

export type SendFriendRequestResponse = {
  request: OutgoingFriendRequestDto;
};

export type AcceptFriendRequestResponse = {
  friend: FriendDto;
};
