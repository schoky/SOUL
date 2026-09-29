import type { Character } from "@soul/shared";

export const characters: Character[] = [
  {
    id: "killer",
    name: "Киллер",

    image: "/cards/characters/killer.webp",

    stats: {
      farmila: 4,
      perekup: 2,
      tuller: 5,
    },

    ability: {
      id: "cold-blooded",
      name: "Хладнокровие",
      description: "Первый провал по Туллеру за игру не отнимает Soul.",
    },
  },

  {
    id: "market-shark",
    name: "Рыночный перекуп",

    image: "/cards/characters/market-shark.webp",

    stats: {
      farmila: 2,
      perekup: 5,
      tuller: 4,
    },

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

    stats: {
      farmila: 5,
      perekup: 4,
      tuller: 2,
    },

    ability: {
      id: "work-to-exhaustion",
      name: "На износ",
      description:
        "При успешном событии с Фармилой получает дополнительный Soul.",
    },
  },

  {
    id: "sniper",
    name: "Снайпер",
    image: "/cards/characters/sniper.webp",
    stats: {
      farmila: 3,
      perekup: 4,
      tuller: 4,
    },

    ability: {
      id: "precise-shot",
      name: "Точный выстрел",
      description: "При выигранном риске получает дополнительный Soul.",
    },
  },

  {
    id: "courier",
    name: "Курьер",

    image: "/cards/characters/courier.webp",

    stats: {
      farmila: 4,
      perekup: 4,
      tuller: 3,
    },

    ability: {
      id: "agility",
      name: "Вёрткость",
      description: "При провале по Фармиле не пропускает следующий ход.",
    },
  },

  {
    id: "mechanic",
    name: "Механик",

    image: "/cards/characters/mechanic.webp",

    stats: {
      farmila: 5,
      perekup: 2,
      tuller: 4,
    },

    ability: {
      id: "resilience",
      name: "Запас прочности",
      description: "Если играется в связке, не становится истощённым.",
    },
  },

  {
    id: "smuggler",
    name: "Контрабандист",

    image: "/cards/characters/smuggler.webp",

    stats: {
      farmila: 3,
      perekup: 3,
      tuller: 5,
    },

    ability: {
      id: "lone-wolf",
      name: "Одиночка",
      description:
        "При игре одной картой (без связки) получает +1 Soul при успехе.",
    },
  },

  {
    id: "fixer",
    name: "Решала",

    image: "/cards/characters/fixer.webp",

    stats: {
      farmila: 4,
      perekup: 5,
      tuller: 2,
    },

    ability: {
      id: "connections",
      name: "Связи",
      description: "При игре в связке получает +1 Soul при успехе.",
    },
  },

  {
    id: "medic",
    name: "Медик",

    image: "/cards/characters/medic.webp",

    stats: {
      farmila: 2,
      perekup: 4,
      tuller: 5,
    },

    ability: {
      id: "first-aid",
      name: "Аптечка",
      description:
        "При успешном событии с Туллером получает дополнительный Soul.",
    },
  },

  {
    id: "informant",
    name: "Информатор",

    image: "/cards/characters/informant.webp",

    stats: {
      farmila: 6,
      perekup: 3,
      tuller: 2,
    },

    ability: {
      id: "hunch",
      name: "Чутьё",
      description:
        "Первый провал риска при выполненных требованиях не отнимает Soul.",
    },
  },
];
