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
  readonly logger: Logger;

  playerId: string | null = null;
  roomCode: string | null = null;
  isAlive = true;

  constructor(socket: WebSocket, logger: Logger) {
    this.id = randomUUID();
    this.socket = socket;
    this.logger = logger.child({ connectionId: this.id });
    socket.on("pong", () => {
      this.isAlive = true;
    });
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
}
