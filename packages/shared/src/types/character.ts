import type {CharacterStats} from './stats.js';

export type CharacterAbility = {
	name: string;
	description: string;
};

export type Character = {
	id: string;
	name: string;
	stats: CharacterStats;
	ability?: CharacterAbility;
};