import type {Character} from './character.js';
import type {Status} from './status.js';

export type Player = {
	id: string;
	name: string;
	soul: number;
	characters: Character[];
	status: Status | null;
	isReady: boolean;
	skipNextTurn: boolean;
};