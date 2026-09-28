import { create } from "zustand";

import type { Character, GameState } from "@soul/shared";

type GameStore = {
  gameState: GameState | null;

  characters: Character[];

  setGameSession: (gameState: GameState, characters: Character[]) => void;

  clearGameState: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,

  characters: [],

  setGameSession(gameState, characters) {
    set({
      gameState,
      characters,
    });
  },

  clearGameState() {
    set({
      gameState: null,
      characters: [],
    });
  },
}));
