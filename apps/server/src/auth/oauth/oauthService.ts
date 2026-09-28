import { randomBytes } from "node:crypto";

import type { OAuthProvider } from "@soul/database";

import {
  buildRedirectUri,
  getClientId,
  getClientSecret,
  getProviderConfig,
} from "./oauthProviders.js";

export type OAuthUserInfo = {
  providerUserId: string;
  email: string | null;
  nickname: string | null;
  avatar: string | null;
};

export function generateState(): string {
  return randomBytes(24).toString("hex");
}

export function buildAuthorizeUrl(
  provider: OAuthProvider,
  state: string,
): string {
  const config = getProviderConfig(provider);
  const clientId = getClientId(provider);
  const redirectUri = buildRedirectUri(provider);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.authorizeUrl}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
): Promise<string> {
  const config = getProviderConfig(provider);
  const clientId = getClientId(provider);
  const clientSecret = getClientSecret(provider);
  const redirectUri = buildRedirectUri(provider);

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `OAuth token exchange failed (${provider}): ${response.status} ${text}`,
    );
  }

  const data = (await response.json()) as TokenResponse;

  if (!data.access_token) {
    throw new Error(`OAuth response missing access_token (${provider})`);
  }

  return data.access_token;
}

export async function fetchUserInfo(
  provider: OAuthProvider,
  accessToken: string,
): Promise<OAuthUserInfo> {
  const config = getProviderConfig(provider);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };

  // Twitch требует Client-Id в заголовке
  if (provider === "TWITCH") {
    headers["Client-Id"] = getClientId(provider);
  }

  const response = await fetch(config.userInfoUrl, {
    headers,
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `OAuth userinfo failed (${provider}): ${response.status} ${text}`,
    );
  }

  const data = await response.json();

  return normalizeUserInfo(provider, data);
}

function normalizeUserInfo(
  provider: OAuthProvider,
  data: unknown,
): OAuthUserInfo {
  if (!data || typeof data !== "object") {
    throw new Error(`OAuth userinfo has unexpected shape (${provider})`);
  }

  const raw = data as Record<string, unknown>;

  switch (provider) {
    case "GOOGLE": {
      return {
        providerUserId: String(raw.sub ?? ""),
        email: typeof raw.email === "string" ? raw.email : null,
        nickname:
          typeof raw.name === "string"
            ? raw.name
            : typeof raw.given_name === "string"
              ? raw.given_name
              : null,
        avatar: typeof raw.picture === "string" ? raw.picture : null,
      };
    }

    case "DISCORD": {
      const id = String(raw.id ?? "");

      const avatarHash = raw.avatar;

      const avatar =
        typeof avatarHash === "string" && avatarHash
          ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.png`
          : null;

      return {
        providerUserId: id,
        email: typeof raw.email === "string" ? raw.email : null,
        nickname: typeof raw.username === "string" ? raw.username : null,
        avatar,
      };
    }

    case "TWITCH": {
      const list = raw.data;

      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("OAuth userinfo returned empty data (TWITCH)");
      }

      const user = list[0] as Record<string, unknown>;

      return {
        providerUserId: String(user.id ?? ""),
        email: typeof user.email === "string" ? user.email : null,
        nickname:
          typeof user.display_name === "string"
            ? user.display_name
            : typeof user.login === "string"
              ? user.login
              : null,
        avatar:
          typeof user.profile_image_url === "string"
            ? user.profile_image_url
            : null,
      };
    }
  }
}
