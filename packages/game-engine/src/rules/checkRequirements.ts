import type { CharacterStats, EventCard } from '@soul/shared';

export function checkRequirements(stats: CharacterStats, event: EventCard): boolean {
  return (
    stats.farmila >= event.requirements.farmila &&
    stats.perekup >= event.requirements.perekup &&
    stats.tuller >= event.requirements.tuller
  );
}
