import { database } from '@soul/database';
import type { Character } from '@soul/shared';

function toEngineCharacter(row: {
  slug: string;
  name: string;
  image: string | null;
  farmila: number;
  perekup: number;
  tuller: number;
  abilityId: string | null;
  abilityName: string | null;
  abilityDescription: string | null;
}): Character {
  const character: Character = {
    id: row.slug,
    name: row.name,
    stats: {
      farmila: row.farmila,
      perekup: row.perekup,
      tuller: row.tuller
    }
  };

  if (row.image) {
    character.image = row.image;
  }

  if (row.abilityId && row.abilityName && row.abilityDescription) {
    character.ability = {
      id: row.abilityId,
      name: row.abilityName,
      description: row.abilityDescription
    };
  }

  return character;
}

class CharacterRepository {
  async findAll(): Promise<Character[]> {
    const rows = await database.character.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    return rows.map(toEngineCharacter);
  }

  async findBySlug(slug: string) {
    const row = await database.character.findUnique({
      where: { slug }
    });

    if (!row) {
      return null;
    }

    return toEngineCharacter(row);
  }
}

export const characterRepository = new CharacterRepository();
