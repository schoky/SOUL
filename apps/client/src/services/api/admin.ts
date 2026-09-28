import { apiRequest } from "./client";

// ---------- Stats ----------

export type AdminStats = {
  totalUsers: number;
  totalGames: number;
  activeRooms: number;
  activeGames: number;
  onlineUsers: number;
  unpublishedNews: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>("/api/admin/stats");
}

// ---------- Users ----------

export type AdminUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  profile: {
    id: string;
    nickname: string;
    avatar: string | null;
  } | null;
};

export type AdminUsersResponse = {
  total: number;
  users: AdminUser[];
};

export async function getAdminUsers(
  params: {
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<AdminUsersResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();

  return apiRequest<AdminUsersResponse>(
    `/api/admin/users${query ? `?${query}` : ""}`,
  );
}

export async function setUserBlocked(
  userId: string,
  isBlocked: boolean,
): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/admin/users/${userId}/blocked`, {
    method: "PATCH",
    body: JSON.stringify({ isBlocked }),
  });
}

export async function setUserRole(
  userId: string,
  role: "USER" | "ADMIN",
): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

// ---------- Rooms & Games ----------

export type AdminRoom = {
  id: string;
  code: string;
  status: "WAITING" | "PLAYING" | "FINISHED";
  maxPlayers: number;
  createdAt: string;
  host: {
    id: string;
    nickname: string;
  };
  members: Array<{
    userId: string;
    nickname: string;
    isReady: boolean;
  }>;
};

export async function getAdminRooms(): Promise<AdminRoom[]> {
  const response = await apiRequest<{
    rooms: AdminRoom[];
  }>("/api/admin/rooms");

  return response.rooms;
}

export type AdminGame = {
  id: string;
  roomId: string;
  roomCode: string;
  status: "PLAYING" | "FINISHED";
  startedAt: string;
  finishedAt: string | null;
  winner: { id: string; nickname: string } | null;
  playersCount: number;
};

export async function getAdminGames(): Promise<AdminGame[]> {
  const response = await apiRequest<{
    games: AdminGame[];
  }>("/api/admin/games");

  return response.games;
}

// ---------- Characters ----------

export type AdminCharacter = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  abilityId: string | null;
  abilityName: string | null;
  abilityDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCharacterInput = {
  slug: string;
  name: string;
  image?: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  abilityId?: string | null;
  abilityName?: string | null;
  abilityDescription?: string | null;
};

export async function getAdminCharacters(): Promise<AdminCharacter[]> {
  const response = await apiRequest<{
    characters: AdminCharacter[];
  }>("/api/admin/characters");

  return response.characters;
}

export async function createAdminCharacter(
  input: AdminCharacterInput,
): Promise<AdminCharacter> {
  const response = await apiRequest<{
    character: AdminCharacter;
  }>("/api/admin/characters", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.character;
}

export async function updateAdminCharacter(
  id: string,
  input: Partial<AdminCharacterInput>,
): Promise<AdminCharacter> {
  const response = await apiRequest<{
    character: AdminCharacter;
  }>(`/api/admin/characters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.character;
}

export async function deleteAdminCharacter(id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/admin/characters/${id}`, {
    method: "DELETE",
  });
}

// ---------- Events ----------

export type AdminEvent = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  mainStat: string;
  reward: number;
  riskReward: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminEventInput = {
  slug: string;
  name: string;
  image?: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  mainStat: string;
  reward: number;
  riskReward: number;
  description: string;
};

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const response = await apiRequest<{
    events: AdminEvent[];
  }>("/api/admin/events");

  return response.events;
}

export async function createAdminEvent(
  input: AdminEventInput,
): Promise<AdminEvent> {
  const response = await apiRequest<{
    event: AdminEvent;
  }>("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.event;
}

export async function updateAdminEvent(
  id: string,
  input: Partial<AdminEventInput>,
): Promise<AdminEvent> {
  const response = await apiRequest<{
    event: AdminEvent;
  }>(`/api/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.event;
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/admin/events/${id}`, {
    method: "DELETE",
  });
}

// ---------- News ----------

export type AdminNewsItem = {
  id: string;
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  publishedAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminNewsInput = {
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
};

export async function getAdminNews(): Promise<AdminNewsItem[]> {
  const response = await apiRequest<{
    news: AdminNewsItem[];
  }>("/api/admin/news");

  return response.news;
}

export async function createAdminNews(
  input: AdminNewsInput,
): Promise<AdminNewsItem> {
  const response = await apiRequest<{
    item: AdminNewsItem;
  }>("/api/admin/news", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.item;
}

export async function updateAdminNews(
  id: string,
  input: Partial<AdminNewsInput>,
): Promise<AdminNewsItem> {
  const response = await apiRequest<{
    item: AdminNewsItem;
  }>(`/api/admin/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.item;
}

export async function deleteAdminNews(id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/admin/news/${id}`, {
    method: "DELETE",
  });
}
