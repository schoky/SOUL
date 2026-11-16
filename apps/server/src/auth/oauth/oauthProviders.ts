import type { OAuthProvider } from '@soul/database';

export type OAuthProviderConfig = {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  /** Заголовки, которые нужно добавить к запросу userinfo. */
  userInfoHeaders?: Record<string, string>;
};

export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  GOOGLE: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopes: ['openid', 'email', 'profile'],
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET'
  },

  DISCORD: {
    authorizeUrl: 'https://discord.com/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userInfoUrl: 'https://discord.com/api/users/@me',
    scopes: ['identify', 'email'],
    clientIdEnv: 'DISCORD_CLIENT_ID',
    clientSecretEnv: 'DISCORD_CLIENT_SECRET'
  },

  TWITCH: {
    authorizeUrl: 'https://id.twitch.tv/oauth2/authorize',
    tokenUrl: 'https://id.twitch.tv/oauth2/token',
    userInfoUrl: 'https://api.twitch.tv/helix/users',
    scopes: ['user:read:email'],
    clientIdEnv: 'TWITCH_CLIENT_ID',
    clientSecretEnv: 'TWITCH_CLIENT_SECRET'
  }
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === 'GOOGLE' || value === 'DISCORD' || value === 'TWITCH';
}

export function getProviderConfig(provider: OAuthProvider): OAuthProviderConfig {
  return OAUTH_PROVIDERS[provider];
}

export function getClientId(provider: OAuthProvider): string {
  const config = OAUTH_PROVIDERS[provider];

  const value = process.env[config.clientIdEnv];

  if (!value) {
    throw new Error(`Missing env variable: ${config.clientIdEnv}`);
  }

  return value;
}

export function getClientSecret(provider: OAuthProvider): string {
  const config = OAUTH_PROVIDERS[provider];

  const value = process.env[config.clientSecretEnv];

  if (!value) {
    throw new Error(`Missing env variable: ${config.clientSecretEnv}`);
  }

  return value;
}

export function getRedirectBase(): string {
  return process.env.OAUTH_REDIRECT_BASE ?? 'http://localhost:3000';
}

export function getClientUrl(): string {
  return process.env.CLIENT_URL ?? 'http://localhost:5173';
}

export function buildRedirectUri(provider: OAuthProvider): string {
  return `${getRedirectBase()}/api/auth/oauth/${provider.toLowerCase()}/callback`;
}
