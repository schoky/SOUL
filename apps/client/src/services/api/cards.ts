import { apiRequest } from "./client";

import type { Character, EventCard } from "@soul/shared";

export type CardsResponse = {
  characters: Character[];
  events: EventCard[];
};

export async function getCards(): Promise<CardsResponse> {
  return apiRequest<CardsResponse>("/api/cards");
}
