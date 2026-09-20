export type StatType =
	| 'farmila'
	| 'perekup'
	| 'tuller';

export type CharacterStats = Record<StatType, number>;