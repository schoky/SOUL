import { apiRequest } from "./client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type UserProfile = {
  id: string;
  nickname: string;
  avatar: string | null;
};

export type CurrentUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  profile: UserProfile;
};

export type RegisterInput = {
  email: string;
  password: string;
  nickname: string;
  avatar?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type OAuthProviderId = "google" | "discord" | "twitch";

type AuthResponse = {
  user: CurrentUser;
};

export async function register(input: RegisterInput): Promise<CurrentUser> {
  const response = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
}

export async function login(input: LoginInput): Promise<CurrentUser> {
  const response = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
}

export async function logout(): Promise<void> {
  await apiRequest<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiRequest<AuthResponse>("/api/auth/me");

  return response.user;
}

/**
 * Возвращает URL для начала OAuth-авторизации.
 *
 * Мы не делаем fetch, а делаем window.location.href,
 * потому что сервер должен сам сделать redirect
 * на страницу провайдера.
 */
export function getOAuthUrl(provider: OAuthProviderId): string {
  return `${API_URL}/api/auth/oauth/${provider}`;
}
