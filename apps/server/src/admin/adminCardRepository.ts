import { database } from '@soul/database';

type CharacterInput = {
  slug: string;
  name: string;
  image?: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  abilityId?: string | null;
  abilityName?: string | null;
  abilityDescription?: string | null;
};

type EventInput = {
  slug: string;
  name: string;
  image?: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  mainStat: string;
  reward: number;
  riskReward: number;
  description: string;
};

class AdminCardRepository {
  // ---------- Characters ----------

  async listCharacters() {
    return database.character.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  async createCharacter(data: CharacterInput) {
    return database.character.create({
      data: {
        slug: data.slug,
        name: data.name,
        image: data.image ?? null,
        farmila: data.farmila,
        perekup: data.perekup,
        tuller: data.tuller,
        abilityId: data.abilityId ?? null,
        abilityName: data.abilityName ?? null,
        abilityDescription: data.abilityDescription ?? null
      }
    });
  }

  async updateCharacter(id: string, data: Partial<CharacterInput>) {
    return database.character.update({
      where: { id },
      data
    });
  }

  async deleteCharacter(id: string) {
    return database.character.delete({
      where: { id }
    });
  }

  // ---------- Events ----------

  async listEvents() {
    return database.eventCard.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  async createEvent(data: EventInput) {
    return database.eventCard.create({ data });
  }

  async updateEvent(id: string, data: Partial<EventInput>) {
    return database.eventCard.update({
      where: { id },
      data
    });
  }

  async deleteEvent(id: string) {
    return database.eventCard.delete({
      where: { id }
    });
  }
}

export const adminCardRepository = new AdminCardRepository();
