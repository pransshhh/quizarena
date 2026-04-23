import { env } from "./config/env.js";
import { RoomRegistry } from "./domain/room-registry.js";
import { createHttpServer } from "./http/server.js";
import { logger } from "./services/logger.js";
import { OpenTdbClient } from "./services/opentdb-client.js";
import { QuestionService } from "./services/question-service.js";
import type { AppContext } from "./types/context.js";
import { createWebSocketServer } from "./ws/server.js";

function main(): void {
  const opentdb = new OpenTdbClient(logger);
  const questions = new QuestionService(opentdb, logger);

  const ctx: AppContext = {
    logger,
    rooms: new RoomRegistry(logger),
    questions: questions,
  };

  const { httpServer } = createHttpServer(ctx);
  createWebSocketServer(httpServer, ctx);

  httpServer.listen(env.server.port, env.server.host, () => {
    ctx.logger.info(
      { port: env.server.port, host: env.server.host, env: env.nodeEnv },
      "server listening",
    );
    ctx.logger.info(`http: http://${env.server.host}:${env.server.port}/health`);
    ctx.logger.info(`ws:   ws://${env.server.host}:${env.server.port}/ws`);
  });

  questions.warmCache().catch((err) => {
    logger.error({ err: String(err) }, "warm cache threw unexpectedly");
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
