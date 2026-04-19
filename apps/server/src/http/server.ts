import { createServer, type Server as HttpServer } from "node:http";
import express, { type Express, type Request, type Response } from "express";
import type { AppContext } from "../types/context.js";

export function createHttpServer(_ctx: AppContext): {
  app: Express;
  httpServer: HttpServer;
} {
  const app = express();

  app.disable("x-powered-by");

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  const httpServer = createServer(app);

  return { app, httpServer };
}
