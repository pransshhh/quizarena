import type { Server as HttpServer } from "node:http";
import { CloseCode, ServerMessageType } from "@quizarena/shared";
import { type WebSocket, WebSocketServer } from "ws";
import { handlePlayerLeaving } from "../domain/room-lifecycle.js";
import { dispatch } from "../router/router.js";
import type { AppContext } from "../types/context.js";
import { Connection } from "./connection.js";
import { setupHeartbeat } from "./heartbeat.js";

export interface WsServerHandle {
  wss: WebSocketServer;
  stopHeartbeat: () => void;
  broadcastShutdown: (reason: string) => void;
  close: () => Promise<void>;
  connectionCount: () => number;
}

export function createWebSocketServer(httpServer: HttpServer, ctx: AppContext): WsServerHandle {
  const wss = new WebSocketServer({ noServer: true });

  const allConnections = new Set<Connection>();

  httpServer.on("upgrade", (request, socket, head) => {
    if (ctx.isShuttingDown()) {
      socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
      socket.destroy();
      return;
    }
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
    allConnections.add(connection);

    connection.logger.info({ connectionId: connection.id }, "ws connection opened");

    ws.on("error", (err) => {
      connection.logger.error({ err: String(err) }, "ws socket error");
    });

    ws.on("message", (data) => {
      void dispatch(connection, data as Buffer, ctx);
    });

    ws.on("close", (code, reason) => {
      allConnections.delete(connection);
      connection.logger.info({ code, reason: reason.toString() }, "ws connection closed");
      handleDisconnect(connection, ctx);
    });
  });

  const connectionCount = (): number => allConnections.size;

  const stopHeartbeat = setupHeartbeat(allConnections, ctx.logger);

  const broadcastShutdown = (reason: string): void => {
    for (const connection of allConnections) {
      connection.send({
        type: ServerMessageType.ServerShutdown,
        reason,
      });
      connection.close(CloseCode.ServerRestart, "server restart");
    }
  };

  const close = (): Promise<void> =>
    new Promise((resolve, reject) => {
      wss.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

  return { wss, stopHeartbeat, broadcastShutdown, close, connectionCount };
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
