import type { Server as HttpServer } from "node:http";
import { type WebSocket, WebSocketServer } from "ws";
import type { AppContext } from "../types/context.js";

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
    ctx.logger.info("ws connection opened");

    ws.on("error", (err) => {
      ctx.logger.error({ err: String(err) }, "ws socket error");
    });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const reply = { type: "echo_reply", original: msg };
        ws.send(JSON.stringify(reply));
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "invalid json" }));
      }
    });

    ws.on("close", (code) => {
      ctx.logger.info({ code }, "ws connection closed");
    });
  });

  return wss;
}
