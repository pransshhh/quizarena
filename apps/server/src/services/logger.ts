import pino from "pino";
import { env } from "../config/env.js";

const transport = env.isDev
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    }
  : undefined;

export const logger = pino({
  level: env.logLevel,
  transport,
});

export type Logger = pino.Logger;
