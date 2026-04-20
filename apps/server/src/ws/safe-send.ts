import type { ServerMessage } from "@quizarena/shared";
import { WebSocket } from "ws";
import type { Logger } from "../services/logger.js";

export function safeSend(socket: WebSocket, message: ServerMessage, logger: Logger): boolean {
  if (socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (err) {
    logger.error({ err: String(err) }, "safeSend failed");
    return false;
  }
}
