// Игровое состояние
export { createGame } from './game/createGame.js';
export { startGame } from './game/startGame.js';
export { nextTurn } from './game/nextTurn.js';
export { playEvent } from './game/playEvent.js';
export { finishGame } from './game/finishGame.js';
export { startFinalRound } from './game/startFinalRound.js';
export { determineWinner } from './game/determineWinner.js';
export { skipTurn } from './game/skipTurn.js';

// Ходы
export { startTurn } from './turns/startTurn.js';
export { endTurn } from './turns/endTurn.js';

// Игроки
export { createPlayer } from './players/createPlayer.js';
export { dealCharacters } from './players/dealCharacters.js';
export { exhaustCharacters } from './players/exhaustCharacters.js';
export { resolveCharacters } from './players/resolveCharacters.js';
export { resolveCharacterAbilities } from './players/resolveCharacterAbilities.js';

// События и правила
export { resolveEvent } from './events/resolveEvent.js';
export { checkRequirements } from './rules/checkRequirements.js';
export { changeSoul } from './rules/changeSoul.js';
export { resolveFailure } from './rules/resolveFailure.js';
export { resolveRisk } from './rules/resolveRisk.js';

// Колода
export { createEventDeck } from './deck/createEventDeck.js';
export { drawEvent } from './deck/drawEvent.js';
export { refillEventDeck } from './deck/refillEventDeck.js';
export { shuffle } from './deck/shuffle.js';

// Типы
export type { EventResult } from './events/resolveEvent.js';
export type { PlayEventResult } from './game/playEvent.js';
export type { TurnResult } from './turns/startTurn.js';
export type { ResolvedCharacters } from './players/resolveCharacters.js';
export type { CharacterAbilityResult } from './players/resolveCharacterAbilities.js';
export type { FailureResult } from './rules/resolveFailure.js';
