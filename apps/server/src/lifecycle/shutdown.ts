import type { Server as HttpServer } from "node:http";
import type { Logger } from "pino";
import type { WsServerHandle } from "../ws/server.js";

const FORCE_EXIT_TIMEOUT_MS = 10_000;

interface ShutdownDeps {
  httpServer: HttpServer;
  ws: WsServerHandle;
  logger: Logger;
}

let shuttingDown = false;

export const isShuttingDown = (): boolean => shuttingDown;

export function setupShutdown(deps: ShutdownDeps): void {
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      deps.logger.info({ signal }, "shutdown already in progress, ignoring");
      return;
    }
    shuttingDown = true;

    deps.logger.info(
      { signal, activeConnections: deps.ws.connectionCount() },
      "shutdown initiated",
    );

    deps.ws.stopHeartbeat();

    deps.ws.broadcastShutdown("server restart");

    await deps.ws.close();

    deps.httpServer.close((err) => {
      if (err) {
        deps.logger.error({ err: String(err) }, "http server close failed");
        process.exit(1);
      }
      deps.logger.info("shutdown complete");
      setImmediate(() => process.exit(0));
    });

    setTimeout(() => {
      deps.logger.warn(
        { timeoutMs: FORCE_EXIT_TIMEOUT_MS },
        "shutdown timeout exceeded, forcing exit",
      );
      process.exit(1);
    }, FORCE_EXIT_TIMEOUT_MS);
  };
  
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
