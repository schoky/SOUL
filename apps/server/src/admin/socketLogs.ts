import { EventEmitter } from "node:events";

export type SocketLogType =
  "socket:connected" | "socket:disconnected" | "auth:failed";

export type SocketLogEntry = {
  id: string;
  timestamp: string;
  type: SocketLogType;
  userId?: string;
  socketId?: string;
  roomId?: string;
  message: string;
};

const MAX_LOGS = 500;

class SocketLogs extends EventEmitter {
  private logs: SocketLogEntry[] = [];

  private nextId = 1;

  add(entry: Omit<SocketLogEntry, "id" | "timestamp">): SocketLogEntry {
    const log: SocketLogEntry = {
      id: String(this.nextId++),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.logs.push(log);

    if (this.logs.length > MAX_LOGS) {
      this.logs.shift();
    }

    // Оповещаем подписчиков (в socket/index.ts слушатель
    // рассылает новые логи админам через io).
    this.emit("log", log);

    return log;
  }

  get(filter?: { type?: SocketLogType; limit?: number }): SocketLogEntry[] {
    let result = this.logs;

    if (filter?.type) {
      result = result.filter((log) => log.type === filter.type);
    }

    // Новые сверху.
    const reversed = [...result].reverse();

    return reversed.slice(0, filter?.limit ?? 100);
  }

  clear(): void {
    this.logs = [];
  }
}

export const socketLogs = new SocketLogs();
