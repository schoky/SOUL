import { database } from "@soul/database";

import type { EventCard, StatType } from "@soul/shared";

function toEngineEvent(row: {
  slug: string;
  name: string;
  image: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  mainStat: string;
  reward: number;
  riskReward: number;
  description: string;
}): EventCard {
  const event: EventCard = {
    id: row.slug,
    name: row.name,
    requirements: {
      farmila: row.farmila,
      perekup: row.perekup,
      tuller: row.tuller,
    },
    mainStat: row.mainStat as StatType,
    reward: row.reward,
    riskReward: row.riskReward,
    description: row.description,
  };

  if (row.image) {
    event.image = row.image;
  }

  return event;
}

class EventRepository {
  async findAll(): Promise<EventCard[]> {
    const rows = await database.eventCard.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return rows.map(toEngineEvent);
  }

  async findBySlug(slug: string) {
    const row = await database.eventCard.findUnique({
      where: { slug },
    });

    if (!row) {
      return null;
    }

    return toEngineEvent(row);
  }
}

export const eventRepository = new EventRepository();
