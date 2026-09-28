import { create } from "zustand";

import type { Character, GameState } from "@soul/shared";

export type HistoryEntry = {
  turnNumber: number;
  playerId: string;
  playerName: string;
  eventName: string;
  success: boolean;
  risk: boolean;
  riskWon: boolean | null;
  soulDelta: number;
};

type GameStore = {
  gameState: GameState | null;

  characters: Character[];

  history: HistoryEntry[];

  setGameSession: (gameState: GameState, characters: Character[]) => void;

  pushHistory: (entry: HistoryEntry) => void;

  clearHistory: () => void;

  clearGameState: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,

  characters: [],

  history: [],

  setGameSession(gameState, characters) {
    set({
      gameState,
      characters,
    });
  },

  pushHistory(entry) {
    set((state) => ({
      history: [entry, ...state.history].slice(0, 8),
    }));
  },

  clearHistory() {
    set({ history: [] });
  },

  clearGameState() {
    set({
      gameState: null,
      characters: [],
      history: [],
    });
  },
}));
