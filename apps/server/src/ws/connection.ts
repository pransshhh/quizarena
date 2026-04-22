import { randomUUID } from "node:crypto";
import {
  type CloseCode,
  type ErrorCode,
  type ServerMessage,
  ServerMessageType,
} from "@quizarena/shared";
import type { WebSocket } from "ws";
import type { Logger } from "../services/logger.js";
import { safeSend } from "./safe-send.js";

export class Connection {
  readonly id: string;
  readonly socket: WebSocket;
  private readonly logger: Logger;
  playerId: string | null = null;
  roomCode: string | null = null;

  constructor(socket: WebSocket, logger: Logger) {
    this.id = randomUUID();
    this.socket = socket;
    this.logger = logger.child ? logger.child({ connectionId: this.id }) : logger;
  }

  send(message: ServerMessage): boolean {
    return safeSend(this.socket, message, this.logger);
  }

  sendError(code: ErrorCode, message: string): boolean {
    return this.send({
      type: ServerMessageType.Error,
      code,
      message,
    });
  }

  close(code: CloseCode, reason: string): void {
    try {
      this.socket.close(code, reason);
    } catch (err) {
      this.logger.error({ err: String(err) }, "close failed");
    }
  }

  getLogger(): Logger {
    return this.logger;
  }
}
