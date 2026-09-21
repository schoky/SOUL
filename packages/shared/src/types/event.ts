import type {
	CharacterStats,
	StatType
} from './stats.js';

export type EventCard = {
	id: string;
	name: string;
	requirements: CharacterStats;
	mainStat: StatType;
	reward: number;
	riskReward: number;
	description: string;
};