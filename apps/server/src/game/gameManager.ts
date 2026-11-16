import type { GameState } from '@soul/shared';

import { gameRepository } from './gameRepository.js';

class GameManager {
  private games = new Map<string, GameState>();

  /**
   * Сохраняет игру в памяти и в БД.
   */
  async set(roomId: string, state: GameState): Promise<void> {
    this.games.set(roomId, state);

    await gameRepository.save(roomId, state);
  }

  /**
   * Возвращает игру из памяти, если она есть.
   */
  get(roomId: string): GameState | null {
    return this.games.get(roomId) ?? null;
  }

  /**
   * Возвращает игру: сначала из памяти,
   * затем пробует загрузить из БД
   * и кэширует.
   */
  async resolve(roomId: string): Promise<GameState | null> {
    const cached = this.games.get(roomId);

    if (cached) {
      return cached;
    }

    const fromDb = await gameRepository.findStateByRoomId(roomId);

    if (fromDb) {
      this.games.set(roomId, fromDb);

      return fromDb;
    }

    return null;
  }

  has(roomId: string): boolean {
    return this.games.has(roomId);
  }

  /**
   * Сохраняет итоги завершённой игры
   * в GamePlayer и GameResult.
   */
  async saveFinish(roomId: string, state: GameState): Promise<void> {
    await gameRepository.saveFinish(roomId, state);
  }

  async delete(roomId: string): Promise<void> {
    this.games.delete(roomId);

    await gameRepository.deleteByRoomId(roomId);
  }
}

export const gameManager = new GameManager();
