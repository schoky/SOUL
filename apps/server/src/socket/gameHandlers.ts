import type { Socket } from "socket.io";

import {
  characters as allCharacters,
  createGame,
  createPlayer,
  endTurn,
  playEvent,
  startGame,
  startTurn,
} from "@soul/game-engine";

import {
  SOCKET_EVENTS,
  type GameEndTurnPayload,
  type GamePlayEventPayload,
  type GameStartPayload,
} from "@soul/shared";

import type { GameState } from "@soul/shared";

import { gameManager } from "../game/gameManager.js";

import { roomRepository } from "../rooms/roomRepository.js";
import { roomService } from "../rooms/roomService.js";

import { getIO } from "./io.js";
import { emitRoomUpdated } from "./roomEvents.js";

const MAX_TURN_ITERATIONS_FACTOR = 3;

function buildSession(game: GameState) {
  return {
    gameState: game,
    characters: allCharacters,
  };
}

function advanceTurnLoop(game: GameState): GameState {
  let current = endTurn(game);

  const maxIterations = game.players.length * MAX_TURN_ITERATIONS_FACTOR;

  let iterations = 0;

  while (current.status === "playing" && iterations < maxIterations) {
    iterations += 1;

    const turn = startTurn(current);

    if (!turn.skipped) {
      return turn.game;
    }

    current = endTurn(turn.game);
  }

  return current;
}

async function handleGameFinished(
  roomId: string,
  game: GameState,
): Promise<void> {
  if (game.status !== "finished") {
    return;
  }

  await gameManager.saveFinish(roomId, game);

  try {
    await roomRepository.updateStatus(roomId, "FINISHED");

    await roomRepository.setFinishedAt(roomId, new Date());

    const updatedRoom = await roomRepository.findById(roomId);

    if (updatedRoom) {
      emitRoomUpdated(updatedRoom);
    }
  } catch (error) {
    console.error("Не удалось обновить комнату после финиша:", error);
  }
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

      const players = updatedRoom.members.map((member) => {
        const nickname =
          member.user.profile?.nickname ?? `Игрок ${member.userId.slice(0, 4)}`;

        return createPlayer(member.userId, nickname);
      });

      let game = createGame(roomId, players);

      game = startGame(game, updatedRoom.hostUserId);

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

        io.to(`room:${payload.roomId}`).emit(
          SOCKET_EVENTS.GAME_STATE_UPDATED,
          buildSession(result.game),
        );

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

        const io = getIO();

        io.to(`room:${payload.roomId}`).emit(
          SOCKET_EVENTS.GAME_STATE_UPDATED,
          buildSession(nextGame),
        );

        if (nextGame.status === "finished") {
          await handleGameFinished(payload.roomId, nextGame);
        }
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
