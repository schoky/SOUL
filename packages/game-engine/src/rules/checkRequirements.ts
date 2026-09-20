import type {Character, EventCard, StatType} from '@soul/shared';

const STAT_TYPES: StatType[] = [
	'farmila',
	'perekup',
	'tuller'
];

export function checkRequirements(
	character: Character,
	event: EventCard
): boolean {
	return STAT_TYPES.every((stat) => {
		return character.stats[stat] >= event.requirements[stat];
	});
}