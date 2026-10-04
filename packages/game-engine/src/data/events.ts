import type { EventCard } from "@soul/shared";

export const events: EventCard[] = [
  {
    id: "deal-gone-wrong",
    name: "Сделка сорвалась",

    requirements: {
      farmila: 5,
      perekup: 5,
      tuller: 5,
    },

    mainStat: "tuller",
    reward: 2,
    riskReward: 3,

    description:
      "Покупатель не пришёл, а товар уже на руках. Нужно срочно искать выход.",
  },

  {
    id: "raid-on-warehouse",
    name: "Рейд на склад",

    image: "/cards/events/raid-on-warehouse.webp",

    requirements: {
      farmila: 6,
      perekup: 5,
      tuller: 6,
    },

    mainStat: "tuller",
    reward: 3,
    riskReward: 5,

    description:
      "Нужно пробраться на склад и забрать товар раньше, чем приедет охрана.",
  },

  {
    id: "resell-batch",
    name: "Перепродажа партии",

    image: "/cards/events/resell-batch.webp",

    requirements: {
      farmila: 5,
      perekup: 7,
      tuller: 6,
    },

    mainStat: "perekup",
    reward: 3,
    riskReward: 5,

    description:
      "Нужно быстро найти покупателя и продать партию с максимальной выгодой.",
  },

  {
    id: "night-shift",
    name: "Ночная смена",

    image: "/cards/events/night-shift.webp",

    requirements: {
      farmila: 7,
      perekup: 5,
      tuller: 6,
    },

    mainStat: "farmila",
    reward: 3,
    riskReward: 5,

    description:
      "Работа до утра. Главное — не сдаться и довести смену до конца.",
  },

  {
    id: "night-convoy",
    name: "Ночной конвой",

    requirements: {
      farmila: 6,
      perekup: 6,
      tuller: 6,
    },

    mainStat: "tuller",
    reward: 3,
    riskReward: 5,

    description:
      "Колонна идёт через город ночью. Нужно перехватить её и не попасться.",
  },

  {
    id: "black-market-deal",
    name: "Сделка на чёрном рынке",

    image: "/cards/events/black-market-deal.webp",

    requirements: {
      farmila: 6,
      perekup: 7,
      tuller: 7,
    },

    mainStat: "perekup",
    reward: 4,
    riskReward: 6,

    description:
      "Опасная сделка, где ошибка в цене может полностью изменить результат.",
  },

  {
    id: "warehouse-escape",
    name: "Побег со склада",

    image: "/cards/events/warehouse-escape.webp",

    requirements: {
      farmila: 6,
      perekup: 6,
      tuller: 8,
    },

    mainStat: "tuller",
    reward: 4,
    riskReward: 6,

    description:
      "Охрана уже заметила неладное. Нужно выбраться со склада, не потеряв товар.",
  },

  {
    id: "cargo-theft",
    name: "Кража груза",

    requirements: {
      farmila: 7,
      perekup: 7,
      tuller: 7,
    },

    mainStat: "tuller",
    reward: 4,
    riskReward: 6,

    description:
      "Вагон с ценным грузом стоит под охраной. Нужно вскрыть его быстро и без шума.",
  },

  {
    id: "police-raid",
    name: "Облава",

    requirements: {
      farmila: 8,
      perekup: 6,
      tuller: 7,
    },

    mainStat: "farmila",
    reward: 4,
    riskReward: 6,

    description:
      "Облава накрывает район. Спастись можно только выдержкой и холодной головой.",
  },

  {
    id: "safe-cracking",
    name: "Вскрытие сейфа",

    requirements: {
      farmila: 8,
      perekup: 9,
      tuller: 8,
    },

    mainStat: "perekup",
    reward: 5,
    riskReward: 8,

    description:
      "Толстые стены, хитрая сигнализация и всего одна ночь. Сейф должен быть вскрыт.",
  },

  {
    id: "street-race",
    name: "Уличная гонка",

    requirements: {
      farmila: 6,
      perekup: 10,
      tuller: 6,
    },

    mainStat: "perekup",
    reward: 5,
    riskReward: 8,

    description:
      "Уличная гонка на выживание. Ставки высоки, а соперники не знают пощады.",
  },

  {
    id: "smuggling-tunnel",
    name: "Тоннель контрабанды",

    requirements: {
      farmila: 9,
      perekup: 7,
      tuller: 9,
    },

    mainStat: "farmila",
    reward: 5,
    riskReward: 8,

    description:
      "Подземный ход завален и полон воды. Каждый шаг может стать последним.",
  },
];
