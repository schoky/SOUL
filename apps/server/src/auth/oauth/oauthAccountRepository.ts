import type { OAuthProvider } from "@soul/database";

import { database } from "../../database/index.js";

export type FindOrCreateOAuthUserInput = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string | null;
  nickname: string | null;
  avatar: string | null;
};

export async function findOAuthAccount(
  provider: OAuthProvider,
  providerUserId: string,
) {
  return database.oAuthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },

    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });
}

export async function linkOAuthAccount(
  userId: string,
  input: FindOrCreateOAuthUserInput,
) {
  return database.oAuthAccount.create({
    data: {
      userId,
      provider: input.provider,
      providerUserId: input.providerUserId,
      email: input.email,
    },
  });
}

export async function findUserByEmail(email: string) {
  return database.user.findUnique({
    where: { email },

    include: {
      profile: true,
    },
  });
}

async function generateUniqueNickname(base: string): Promise<string> {
  const cleaned = base
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w\-.]/g, "")
    .slice(0, 16);

  const fallback = "Player";

  const root = cleaned.length >= 3 ? cleaned : fallback;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate =
      attempt === 0
        ? root
        : `${root}_${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await database.profile.findUnique({
      where: { nickname: candidate },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${fallback}_${Date.now().toString(36)}`;
}

export async function createOAuthUser(input: FindOrCreateOAuthUserInput) {
  const email = input.email;

  if (!email) {
    throw new Error(
      `OAuth provider ${input.provider} did not return an email. Please make sure your email is public in the provider's settings.`,
    );
  }

  const nickname = await generateUniqueNickname(
    input.nickname ?? email.split("@")[0] ?? "Player",
  );

  const user = await database.user.create({
    data: {
      email,
      // Пароль недоступен для OAuth-аккаунтов.
      // Ставим случайную невалидную строку —
      // argon2.verify на ней всегда возвращает false.
      passwordHash: "oauth-account-no-password",

      profile: {
        create: {
          nickname,
          avatar: input.avatar,
        },
      },

      oauthAccounts: {
        create: {
          provider: input.provider,
          providerUserId: input.providerUserId,
          email: input.email,
        },
      },
    },

    include: {
      profile: true,
    },
  });

  return user;
}
