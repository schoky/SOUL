import { createHash, randomBytes } from 'node:crypto';

import type { UserRole } from '@soul/database';

import {
  createSession,
  deleteAllUserSessions,
  deleteSession,
  findSessionByTokenHash,
  updateSessionLastUsedAt
} from './sessionRepository.js';

const SESSION_DURATION_DAYS = 30;

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

function createExpirationDate(): Date {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  return expiresAt;
}

export type CreateSessionInput = {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function createUserSession(input: CreateSessionInput) {
  const token = createSessionToken();

  const tokenHash = hashSessionToken(token);

  const expiresAt = createExpirationDate();

  const session = await createSession({
    userId: input.userId,
    tokenHash,
    expiresAt,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent
  });

  return {
    session,
    token
  };
}

export async function getSessionByToken(token: string) {
  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session = await findSessionByTokenHash(tokenHash);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await deleteSession(session.id);

    return null;
  }

  if (session.user.isBlocked) {
    return null;
  }

  await updateSessionLastUsedAt(session.id, new Date());

  return session;
}

export async function revokeSession(token: string): Promise<void> {
  if (!token) {
    return;
  }

  const tokenHash = hashSessionToken(token);

  const session = await findSessionByTokenHash(tokenHash);

  if (!session) {
    return;
  }

  await deleteSession(session.id);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await deleteAllUserSessions(userId);
}
