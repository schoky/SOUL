import type { Socket } from "socket.io";

import {
  createGame,
  createPlayer,
  playEvent,
  startGame
} from "@soul/game-engine";

import {
  type GameEndTurnPayload,
  type GamePlayEventPayload,
  type GameStartPayload,
  SOCKET_EVENTS
} from "@soul/shared";

import { characterRepository } from "../cards/characterRepository.js";
import { eventRepository } from "../cards/eventRepository.js";

import { gameManager } from "../game/gameManager.js";
import { advanceTurnLoop } from "../game/turnLoop.js";
import { roomService } from "../rooms/roomService.js";

import { getIO } from "./io.js";
import { emitRoomUpdated } from "./roomEvents.js";
import { emitStateUpdate } from "./stateEmitter.js";

/**
 * Сколько миллисекунд даём клиентам, чтобы увидеть результат хода,
 * прежде чем передать ход следующему игроку.
 */
const TURN_HANDOFF_DELAY_MS = 2500;

function buildSession(game: import("@soul/shared").GameState) {
  return {
    gameState: game,
    characters: game.characters,
  };
}

export function registerGameHandlers(socket: Socket): void {
  socket.on(SOCKET_EVENTS.GAME_START, async (payload: GameStartPayload) => {
    const userId = socket.data.userId as string | undefined;

    if (!userId || !payload?.roomId) {
      return;
    }

    const roomId = payload.roomId;

    try {
      const updatedRoom = await roomService.startGame(roomId, userId);

      const [characters, events] = await Promise.all([
        characterRepository.findAll(),
        eventRepository.findAll(),
      ]);

      if (characters.length === 0 || events.length === 0) {
        throw new Error("Карточки не загружены в БД");
      }

      const players = updatedRoom.members.map((member) => {
        const nickname =
          member.user.profile?.nickname ?? `Игрок ${member.userId.slice(0, 4)}`;

        return createPlayer(member.userId, nickname);
      });

      let game = createGame(roomId, players, events);

      game = startGame(game, updatedRoom.hostUserId, characters);

      await gameManager.set(roomId, game);

      const io = getIO();

      io.to(`room:${roomId}`).emit(
        SOCKET_EVENTS.GAME_STARTED,
        buildSession(game),
      );

      emitRoomUpdated(updatedRoom);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось запустить игру";

      socket.emit(SOCKET_EVENTS.ERROR, {
        message,
      });
    }
  });

  socket.on(
    SOCKET_EVENTS.GAME_PLAY_EVENT,
    async (payload: GamePlayEventPayload) => {
      const userId = socket.data.userId as string | undefined;

      if (!userId || !payload?.roomId) {
        return;
      }

      if (
        !Array.isArray(payload.characterCardIds) ||
        payload.characterCardIds.length === 0
      ) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Не выбраны персонажи",
        });

        return;
      }

      const game = await gameManager.resolve(payload.roomId);

      if (!game) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Игра не найдена",
        });

        return;
      }

      if (game.currentPlayerId !== userId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Сейчас не твой ход",
        });

        return;
      }

      try {
        const soulBefore = game.players.find((p) => p.id === userId)?.soul ?? 0;

        const result = playEvent(
          game,
          payload.characterCardIds,
          Boolean(payload.risk),
        );

        await gameManager.set(payload.roomId, result.game);

        const updatedPlayer = result.game.players.find((p) => p.id === userId);

        const io = getIO();

        if (updatedPlayer) {
          io.to(`room:${payload.roomId}`).emit(
            SOCKET_EVENTS.GAME_EVENT_RESOLVED,
            {
              playerId: userId,
              playerName: updatedPlayer.name,
              success: result.success,
              risk: Boolean(payload.risk),
              riskWon: result.riskWon,
              gambleWon: result.gambleWon,
              soulBefore,
              soulAfter: updatedPlayer.soul,
              status: updatedPlayer.status,
              skipNextTurn: updatedPlayer.skipNextTurn,
            },
          );
        }

        // Не передаём ход мгновенно: даём клиентам
        // ~2.5 секунды, чтобы увидеть результат,
        // и только потом запускаем advanceTurnLoop.
        //
        // Перед переходом перечитываем игру — за время
        // задержки мог сработать автопас, игрок мог
        // выйти из комнаты, или состояние могло измениться.
        setTimeout(() => {
          void (async () => {
            try {
              const currentGame = await gameManager.resolve(payload.roomId);

              if (!currentGame) {
                return;
              }

              if (currentGame.status !== "playing") {
                return;
              }

              if (currentGame.currentPlayerId !== userId) {
                // Ход уже передан (например, автопасом) —
                // не мешаем.
                return;
              }

              const nextGame = advanceTurnLoop(currentGame);

              await gameManager.set(payload.roomId, nextGame);

              await emitStateUpdate(payload.roomId, nextGame);
            } catch (error) {
              console.error(
                "Не удалось передать ход после результата события:",
                error,
              );
            }
          })();
        }, TURN_HANDOFF_DELAY_MS);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось выполнить событие";

        socket.emit(SOCKET_EVENTS.ERROR, {
          message,
        });
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.GAME_END_TURN,
    async (payload: GameEndTurnPayload) => {
      const userId = socket.data.userId as string | undefined;

      if (!userId || !payload?.roomId) {
        return;
      }

      const game = await gameManager.resolve(payload.roomId);

      if (!game) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Игра не найдена",
        });

        return;
      }

      if (game.currentPlayerId !== userId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Сейчас не твой ход",
        });

        return;
      }

      try {
        const nextGame = advanceTurnLoop(game);

        await gameManager.set(payload.roomId, nextGame);

        await emitStateUpdate(payload.roomId, nextGame);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось завершить ход";

        socket.emit(SOCKET_EVENTS.ERROR, {
          message,
        });
      }
    },
  );
}
