import dotenv from "dotenv";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.js";

dotenv.config({
  path: "../../.env",
  override: true,
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });

const database = new PrismaClient({ adapter });

type CharacterSeed = {
  id: string;
  name: string;
  image?: string;
  stats: { farmila: number; perekup: number; tuller: number };
  ability?: {
    id: string;
    name: string;
    description: string;
  };
};

type EventSeed = {
  id: string;
  name: string;
  image?: string;
  requirements: {
    farmila: number;
    perekup: number;
    tuller: number;
  };
  mainStat: string;
  reward: number;
  riskReward: number;
  description: string;
};

const characters: CharacterSeed[] = [
  {
    id: "killer",
    name: "Киллер",
    image: "/cards/characters/killer.webp",
    stats: { farmila: 4, perekup: 2, tuller: 5 },
    ability: {
      id: "cold-blooded",
      name: "Хладнокровие",
      description: "Первый провал по Туллеру за игру не отнимает Soul.",
    },
  },
  {
    id: "market-shark",
    name: "Рыночный акула",
    image: "/cards/characters/market-shark.webp",
    stats: { farmila: 2, perekup: 5, tuller: 3 },
    ability: {
      id: "profitable-deal",
      name: "Выгодная сделка",
      description:
        "При успешном событии с Перекупом получает на 1 Soul больше.",
    },
  },
  {
    id: "workaholic",
    name: "Трудяга",
    image: "/cards/characters/workaholic.webp",
    stats: { farmila: 5, perekup: 3, tuller: 2 },
    ability: {
      id: "work-to-exhaustion",
      name: "На износ",
      description:
        "При успешном событии с Фармилой получает дополнительный Soul.",
    },
  },
];

const events: EventSeed[] = [
  {
    id: "raid-on-warehouse",
    name: "Рейд на склад",
    image: "/cards/events/raid-on-warehouse.webp",
    requirements: { farmila: 3, perekup: 2, tuller: 4 },
    mainStat: "tuller",
    reward: 2,
    riskReward: 4,
    description:
      "Нужно пробраться на склад и забрать товар раньше, чем приедет охрана.",
  },
  {
    id: "resell-batch",
    name: "Перепродажа партии",
    image: "/cards/events/resell-batch.webp",
    requirements: { farmila: 2, perekup: 5, tuller: 2 },
    mainStat: "perekup",
    reward: 2,
    riskReward: 4,
    description:
      "Нужно быстро найти покупателя и продать партию с максимальной выгодой.",
  },
  {
    id: "night-shift",
    name: "Ночная смена",
    image: "/cards/events/night-shift.webp",
    requirements: { farmila: 5, perekup: 2, tuller: 2 },
    mainStat: "farmila",
    reward: 1,
    riskReward: 3,
    description:
      "Работа до утра. Главное — не сдаться и довести смену до конца.",
  },
  {
    id: "black-market-deal",
    name: "Сделка на чёрном рынке",
    image: "/cards/events/black-market-deal.webp",
    requirements: { farmila: 3, perekup: 4, tuller: 3 },
    mainStat: "perekup",
    reward: 3,
    riskReward: 5,
    description:
      "Опасная сделка, где ошибка в цене может полностью изменить результат.",
  },
  {
    id: "warehouse-escape",
    name: "Побег со склада",
    image: "/cards/events/warehouse-escape.webp",
    requirements: { farmila: 2, perekup: 3, tuller: 5 },
    mainStat: "tuller",
    reward: 3,
    riskReward: 5,
    description:
      "Охрана уже заметила неладное. Нужно выбраться со склада, не потеряв товар.",
  },
];

async function seedCharacters() {
  for (const character of characters) {
    await database.character.upsert({
      where: { slug: character.id },

      create: {
        slug: character.id,
        name: character.name,
        image: character.image,
        farmila: character.stats.farmila,
        perekup: character.stats.perekup,
        tuller: character.stats.tuller,
        abilityId: character.ability?.id ?? null,
        abilityName: character.ability?.name ?? null,
        abilityDescription: character.ability?.description ?? null,
      },

      update: {
        name: character.name,
        image: character.image,
        farmila: character.stats.farmila,
        perekup: character.stats.perekup,
        tuller: character.stats.tuller,
        abilityId: character.ability?.id ?? null,
        abilityName: character.ability?.name ?? null,
        abilityDescription: character.ability?.description ?? null,
      },
    });
  }

  console.log(`✔ Загружено персонажей: ${characters.length}`);
}

async function seedEvents() {
  for (const event of events) {
    await database.eventCard.upsert({
      where: { slug: event.id },

      create: {
        slug: event.id,
        name: event.name,
        image: event.image,
        farmila: event.requirements.farmila,
        perekup: event.requirements.perekup,
        tuller: event.requirements.tuller,
        mainStat: event.mainStat,
        reward: event.reward,
        riskReward: event.riskReward,
        description: event.description,
      },

      update: {
        name: event.name,
        image: event.image,
        farmila: event.requirements.farmila,
        perekup: event.requirements.perekup,
        tuller: event.requirements.tuller,
        mainStat: event.mainStat,
        reward: event.reward,
        riskReward: event.riskReward,
        description: event.description,
      },
    });
  }

  console.log(`✔ Загружено событий: ${events.length}`);
}

async function main() {
  console.log("Начинаем seed...");

  await seedCharacters();
  await seedEvents();

  console.log("Seed завершён.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
