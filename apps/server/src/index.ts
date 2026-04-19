import { env } from "./config/env.js";
import { createHttpServer } from "./http/server.js";
import { logger } from "./services/logger.js";
import type { AppContext } from "./types/context.js";
import { createWebSocketServer } from "./ws/server.js";

function main(): void {
  const ctx: AppContext = {
    logger,
  };

  const { httpServer } = createHttpServer(ctx);
  createWebSocketServer(httpServer, ctx);

  httpServer.listen(env.port, env.host, () => {
    ctx.logger.info({ port: env.port, host: env.host, env: env.nodeEnv }, "server listening");
    ctx.logger.info(`http: http://${env.host}:${env.port}/health`);
    ctx.logger.info(`ws:   ws://${env.host}:${env.port}/ws`);
  });

  const shutdown = (signal: string) => {
    ctx.logger.info({ signal }, "shutting down");
    httpServer.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
