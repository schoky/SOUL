import { database } from './client.js';

async function main() {
  const result = await database.$queryRaw<
    Array<{
      database: string;
      user: string;
    }>
  >`
			SELECT
				current_database() AS database,
				current_user AS user
		`;

  console.log(result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
