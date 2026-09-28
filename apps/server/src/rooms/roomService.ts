import { randomInt } from "node:crypto";

import { ROOM_RULES } from "@soul/shared";

import { roomRepository } from "./roomRepository.js";

const MIN_PLAYERS = ROOM_RULES.MIN_PLAYERS;

const MAX_PLAYERS = ROOM_RULES.MAX_PLAYERS;

const DEFAULT_MAX_PLAYERS = ROOM_RULES.MAX_PLAYERS;

const ROOM_CODE_LENGTH = ROOM_RULES.ROOM_CODE_LENGTH;

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type RoomServiceErrorCode =
  | "INVALID_MAX_PLAYERS"
  | "ROOM_NOT_FOUND"
  | "ROOM_NOT_WAITING"
  | "USER_ALREADY_IN_ROOM"
  | "ROOM_FULL"
  | "NOT_ROOM_MEMBER"
  | "INVALID_READY_STATE"
  | "NOT_ROOM_HOST"
  | "NOT_ENOUGH_PLAYERS"
  | "PLAYERS_NOT_READY"
  | "ROOM_CODE_GENERATION_FAILED";

export class RoomServiceError extends Error {
  constructor(
    public readonly code: RoomServiceErrorCode,
    message: string,
  ) {
    super(message);

    this.name = "RoomServiceError";
  }
}

class RoomService {
  /**
   * Создаёт новую комнату.
   */
  async createRoom(userId: string, maxPlayers: number = DEFAULT_MAX_PLAYERS) {
    this.validateMaxPlayers(maxPlayers);

    const existingMember = await roomRepository.findMemberByUserId(userId);

    if (existingMember) {
      throw new RoomServiceError(
        "USER_ALREADY_IN_ROOM",
        "Пользователь уже находится в комнате",
      );
    }

    const code = await this.generateUniqueRoomCode();

    const room = await roomRepository.createWithHost({
      code,
      hostUserId: userId,
      maxPlayers,
    });

    const createdRoom = await roomRepository.findById(room.id);

    if (!createdRoom) {
      throw new RoomServiceError(
        "ROOM_NOT_FOUND",
        "Созданная комната не найдена",
      );
    }

    return createdRoom;
  }

  /**
   * Присоединяет пользователя к комнате.
   */
  async joinRoom(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId);

    if (!room) {
      throw new RoomServiceError("ROOM_NOT_FOUND", "Комната не найдена");
    }

    if (room.status !== "WAITING") {
      throw new RoomServiceError(
        "ROOM_NOT_WAITING",
        "Комната уже запущена или завершена",
      );
    }

    const existingMember = await roomRepository.findMemberByUserId(userId);

    if (existingMember) {
      throw new RoomServiceError(
        "USER_ALREADY_IN_ROOM",
        "Пользователь уже находится в комнате",
      );
    }

    const membersCount = await roomRepository.countMembers(room.id);

    if (membersCount >= room.maxPlayers) {
      throw new RoomServiceError("ROOM_FULL", "Комната заполнена");
    }

    await roomRepository.addMember(room.id, userId);

    const updatedRoom = await roomRepository.findById(room.id);

    if (!updatedRoom) {
      throw new RoomServiceError(
        "ROOM_NOT_FOUND",
        "Комната не найдена после присоединения",
      );
    }

    return updatedRoom;
  }

  /**
   * Выводит пользователя из комнаты.
   *
   * Логика:
   * - Если после выхода остаются другие игроки —
   *   просто убираем участника, при необходимости
   *   передаём хостинг следующему.
   * - Если выходит последний игрок:
   *   - при статусе FINISHED — оставляем комнату
   *     как архив, чтобы сохранить Game, GamePlayer
   *     и GameResult;
   *   - иначе удаляем комнату целиком.
   */
  async leaveRoom(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId);

    if (!room) {
      throw new RoomServiceError("ROOM_NOT_FOUND", "Комната не найдена");
    }

    const member = room.members.find((item) => item.userId === userId);

    if (!member) {
      throw new RoomServiceError(
        "NOT_ROOM_MEMBER",
        "Пользователь не является участником комнаты",
      );
    }

    const otherMembers = room.members.filter((item) => item.userId !== userId);

    // Если остаются другие игроки —
    // передаём хостинг при необходимости
    // и убираем текущего участника.
    if (otherMembers.length > 0) {
      if (room.hostUserId === userId) {
        await roomRepository.updateHost(roomId, otherMembers[0].userId);
      }

      await roomRepository.removeMember(roomId, userId);

      return roomRepository.findById(roomId);
    }

    // Игрок последний. Если комната завершена —
    // оставляем её как архив, чтобы не потерять
    // Game, GamePlayer и GameResult.
    if (room.status === "FINISHED") {
      await roomRepository.removeMember(roomId, userId);

      return null;
    }

    // Иначе удаляем комнату целиком.
    await roomRepository.delete(roomId);

    return null;
  }

  /**
   * Меняет готовность участника комнаты.
   */
  async setReady(roomId: string, userId: string, isReady: boolean) {
    if (typeof isReady !== "boolean") {
      throw new RoomServiceError(
        "INVALID_READY_STATE",
        "Некорректное значение готовности",
      );
    }

    const room = await roomRepository.findById(roomId);

    if (!room) {
      throw new RoomServiceError("ROOM_NOT_FOUND", "Комната не найдена");
    }

    if (room.status !== "WAITING") {
      throw new RoomServiceError(
        "ROOM_NOT_WAITING",
        "Комната уже запущена или завершена",
      );
    }

    const member = room.members.find((item) => item.userId === userId);

    if (!member) {
      throw new RoomServiceError(
        "NOT_ROOM_MEMBER",
        "Пользователь не является участником комнаты",
      );
    }

    await roomRepository.setMemberReady(roomId, userId, isReady);

    const updatedRoom = await roomRepository.findById(roomId);

    if (!updatedRoom) {
      throw new RoomServiceError(
        "ROOM_NOT_FOUND",
        "Комната не найдена после обновления",
      );
    }

    return updatedRoom;
  }

  /**
   * Запускает игру в комнате.
   */
  async startGame(roomId: string, hostId: string) {
    const room = await roomRepository.findById(roomId);

    if (!room) {
      throw new RoomServiceError("ROOM_NOT_FOUND", "Комната не найдена");
    }

    if (room.status !== "WAITING") {
      throw new RoomServiceError(
        "ROOM_NOT_WAITING",
        "Комната уже запущена или завершена",
      );
    }

    if (room.hostUserId !== hostId) {
      throw new RoomServiceError(
        "NOT_ROOM_HOST",
        "Только хост может запустить игру",
      );
    }

    if (room.members.length < MIN_PLAYERS) {
      throw new RoomServiceError(
        "NOT_ENOUGH_PLAYERS",
        `Для старта необходимо минимум ${MIN_PLAYERS} игрока`,
      );
    }

    const everyoneReady = room.members.every((member) => member.isReady);

    if (!everyoneReady) {
      throw new RoomServiceError("PLAYERS_NOT_READY", "Не все игроки готовы");
    }

    await roomRepository.updateStatus(roomId, "PLAYING");

    const updatedRoom = await roomRepository.findById(roomId);

    if (!updatedRoom) {
      throw new RoomServiceError(
        "ROOM_NOT_FOUND",
        "Комната не найдена после обновления",
      );
    }

    return updatedRoom;
  }

  /**
   * Возвращает публичную информацию о комнате
   * для превью по ссылке-приглашению.
   *
   * Доступно любому авторизованному пользователю,
   * а не только участникам.
   */
  async getRoomPreview(roomId: string) {
    const room = await roomRepository.findById(roomId);

    if (!room) {
      return null;
    }

    return {
      id: room.id,
      code: room.code,
      status: room.status,
      maxPlayers: room.maxPlayers,
      membersCount: room.members.length,
      hostNickname: room.host.profile?.nickname ?? "Игрок",
    };
  }

  /**
   * Возвращает активную комнату пользователя
   * в любом статусе.
   */
  async getCurrentRoom(userId: string) {
    return roomRepository.findActiveByUserId(userId);
  }

  /**
   * Возвращает конкретную комнату,
   * если пользователь является её участником.
   */
  async getRoom(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId);

    if (!room) {
      throw new RoomServiceError("ROOM_NOT_FOUND", "Комната не найдена");
    }

    const isMember = room.members.some((member) => member.userId === userId);

    if (!isMember) {
      throw new RoomServiceError(
        "NOT_ROOM_MEMBER",
        "Пользователь не является участником комнаты",
      );
    }

    return room;
  }

  /**
   * Возвращает комнаты, доступные
   * в публичном списке Lobby.
   */
  async getWaitingRooms() {
    return roomRepository.findWaitingRooms();
  }

  /**
   * Проверяет допустимое количество игроков.
   */
  private validateMaxPlayers(maxPlayers: number) {
    if (
      !Number.isInteger(maxPlayers) ||
      maxPlayers < MIN_PLAYERS ||
      maxPlayers > MAX_PLAYERS
    ) {
      throw new RoomServiceError(
        "INVALID_MAX_PLAYERS",
        `Количество игроков должно быть от ${MIN_PLAYERS} до ${MAX_PLAYERS}`,
      );
    }
  }

  /**
   * Генерирует случайный код комнаты.
   */
  private generateRoomCode() {
    let code = "";

    for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
      const characterIndex = randomInt(0, ROOM_CODE_ALPHABET.length);

      code += ROOM_CODE_ALPHABET[characterIndex];
    }

    return code;
  }

  /**
   * Генерирует код и проверяет,
   * что такого кода ещё нет в базе.
   */
  private async generateUniqueRoomCode() {
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const code = this.generateRoomCode();

      const existingRoom = await roomRepository.findByCode(code);

      if (!existingRoom) {
        return code;
      }
    }

    throw new RoomServiceError(
      "ROOM_CODE_GENERATION_FAILED",
      "Не удалось сгенерировать уникальный код комнаты",
    );
  }
}

export const roomService = new RoomService();
