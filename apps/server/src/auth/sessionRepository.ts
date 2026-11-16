import { database } from '../database/index.js';

export type CreateSessionData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
};

export async function createSession(data: CreateSessionData) {
  return database.session.create({
    data: {
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    }
  });
}

export async function findSessionByTokenHash(tokenHash: string) {
  return database.session.findUnique({
    where: {
      tokenHash
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  });
}

export async function updateSessionLastUsedAt(sessionId: string, lastUsedAt: Date) {
  return database.session.update({
    where: {
      id: sessionId
    },
    data: {
      lastUsedAt
    }
  });
}

export async function deleteSession(sessionId: string) {
  return database.session.delete({
    where: {
      id: sessionId
    }
  });
}

export async function deleteAllUserSessions(userId: string) {
  return database.session.deleteMany({
    where: {
      userId
    }
  });
}
