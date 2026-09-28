const AUTO_PASS_DELAY_MS = 30_000;

class ConnectionTracker {
  /**
   * userId → Set<socketId>.
   *
   * У одного игрока может быть несколько
   * открытых вкладок. Игрок считается
   * отключённым, только когда закрыты все.
   */
  private socketsByUser = new Map<string, Set<string>>();

  /**
   * userId → последняя активная комната.
   */
  private roomByUser = new Map<string, string>();

  /**
   * roomId → Set<userId>.
   */
  private usersInRoom = new Map<string, Set<string>>();

  /**
   * userId → таймер автопаса (если игрок отключился
   * на своём ходу).
   */
  private autoPassTimers = new Map<string, NodeJS.Timeout>();

  isConnected(userId: string): boolean {
    const sockets = this.socketsByUser.get(userId);

    return !!sockets && sockets.size > 0;
  }

  addSocket(userId: string, socketId: string): void {
    let sockets = this.socketsByUser.get(userId);

    if (!sockets) {
      sockets = new Set();

      this.socketsByUser.set(userId, sockets);
    }

    sockets.add(socketId);
  }

  /**
   * Убирает сокет. Возвращает true, если это был
   * последний сокет пользователя — значит,
   * игрок полностью отключился.
   */
  removeSocket(userId: string, socketId: string): boolean {
    const sockets = this.socketsByUser.get(userId);

    if (!sockets) {
      return false;
    }

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.socketsByUser.delete(userId);

      return true;
    }

    return false;
  }

  setRoom(userId: string, roomId: string): void {
    this.roomByUser.set(userId, roomId);

    let users = this.usersInRoom.get(roomId);

    if (!users) {
      users = new Set();

      this.usersInRoom.set(roomId, users);
    }

    users.add(userId);
  }

  removeRoom(userId: string): void {
    const roomId = this.roomByUser.get(userId);

    if (roomId) {
      this.usersInRoom.get(roomId)?.delete(userId);
    }

    this.roomByUser.delete(userId);
  }

  getRoom(userId: string): string | undefined {
    return this.roomByUser.get(userId);
  }

  getConnectionMap(roomId: string): Record<string, boolean> {
    const users = this.usersInRoom.get(roomId);

    const map: Record<string, boolean> = {};

    if (!users) {
      return map;
    }

    for (const userId of users) {
      map[userId] = this.isConnected(userId);
    }

    return map;
  }

  scheduleAutoPass(userId: string, callback: () => void | Promise<void>): void {
    this.cancelAutoPass(userId);

    const timer = setTimeout(() => {
      this.autoPassTimers.delete(userId);

      void callback();
    }, AUTO_PASS_DELAY_MS);

    this.autoPassTimers.set(userId, timer);
  }

  cancelAutoPass(userId: string): void {
    const timer = this.autoPassTimers.get(userId);

    if (timer) {
      clearTimeout(timer);

      this.autoPassTimers.delete(userId);
    }
  }
}

export const connectionTracker = new ConnectionTracker();
