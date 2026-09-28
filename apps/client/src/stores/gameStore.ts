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

  playersConnection: Record<string, boolean>;

  setGameSession: (gameState: GameState, characters: Character[]) => void;

  pushHistory: (entry: HistoryEntry) => void;

  clearHistory: () => void;

  setPlayerConnection: (playerId: string, connected: boolean) => void;

  setPlayersConnection: (connections: Record<string, boolean>) => void;

  clearGameState: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,

  characters: [],

  history: [],

  playersConnection: {},

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

  setPlayerConnection(playerId, connected) {
    set((state) => ({
      playersConnection: {
        ...state.playersConnection,
        [playerId]: connected,
      },
    }));
  },

  setPlayersConnection(connections) {
    set({ playersConnection: connections });
  },

  clearGameState() {
    set({
      gameState: null,
      characters: [],
      history: [],
      playersConnection: {},
    });
  },
}));
