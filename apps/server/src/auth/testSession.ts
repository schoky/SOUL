import { database } from '../database/index.js';
import { createUserSession, getSessionByToken, revokeSession } from './sessionService.js';

async function main() {
  const user = await database.user.findUnique({
    where: {
      email: 'test@example.com'
    }
  });

  if (!user) {
    throw new Error('Test user not found');
  }

  const { session, token } = await createUserSession({
    userId: user.id,
    ipAddress: '127.0.0.1',
    userAgent: 'SOUL test'
  });

  console.log('Session created:', session.id);

  console.log('Token exists:', Boolean(token));

  const foundSession = await getSessionByToken(token);

  console.log('Session found:', Boolean(foundSession));

  await revokeSession(token);

  const revokedSession = await getSessionByToken(token);

  console.log('Session after revoke:', Boolean(revokedSession));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
