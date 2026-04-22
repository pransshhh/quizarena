import type { Server as HttpServer } from "node:http";
import { type WebSocket, WebSocketServer } from "ws";
import { handlePlayerLeaving } from "../domain/room-lifecycle.js";
import { dispatch } from "../router/router.js";
import type { AppContext } from "../types/context.js";
import { Connection } from "./connection.js";

export function createWebSocketServer(httpServer: HttpServer, ctx: AppContext): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url !== "/ws") {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws: WebSocket) => {
    const connection = new Connection(ws, ctx.logger);
    const connLogger = connection.getLogger();

    connLogger.info({ connectionId: connection.id }, "ws connection opened");

    ws.on("error", (err) => {
      connLogger.error({ err: String(err) }, "ws socket error");
    });

    ws.on("message", (data) => {
      void dispatch(connection, data as Buffer, ctx);
    });

    ws.on("close", (code, reason) => {
      connLogger.info({ code, reason: reason.toString() }, "ws connection closed");
      handleDisconnect(connection, ctx);
    });
  });

  return wss;
}

function handleDisconnect(connection: Connection, ctx: AppContext): void {
  if (!connection.roomCode || !connection.playerId) return;

  const room = ctx.rooms.get(connection.roomCode);
  const leavingPlayerId = connection.playerId;

  connection.playerId = null;
  connection.roomCode = null;

  if (!room) return;

  handlePlayerLeaving(room, leavingPlayerId, "disconnect", ctx);
}
