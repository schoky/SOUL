import type {EventCard} from './event.js';
import type {EventDeck} from './event-deck.js';
import type {Player} from './player.js';

export type GameStatus =
	| 'waiting'
	| 'playing'
	| 'finished';

export type GameState = {
	id: string;
	status: GameStatus;
	players: Player[];
	currentPlayerId: string | null;
	currentEvent: EventCard | null;
	eventDeck: EventDeck;
	turnNumber: number;
	winnerId: string | null;
	finalRoundStartedBy: string | null;
};