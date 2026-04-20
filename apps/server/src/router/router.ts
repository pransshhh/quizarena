import { type ClientMessage, ErrorCode } from "@quizarena/shared";
import type { AppContext } from "../types/context.js";
import type { Connection } from "../ws/connection.js";
import { handlers } from "./handlers.js";

export async function dispatch(
  connection: Connection,
  raw: Buffer | ArrayBuffer | Buffer[],
  ctx: AppContext,
): Promise<void> {
  const logger = connection.getLogger();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString());
  } catch {
    connection.sendError(ErrorCode.InvalidMessage, "invalid json");
    return;
  }

  if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
    connection.sendError(ErrorCode.InvalidMessage, "missing type field");
    return;
  }

  const msg = parsed as { type: unknown };
  if (typeof msg.type !== "string") {
    connection.sendError(ErrorCode.InvalidMessage, "type must be a string");
    return;
  }

  const handler = (handlers as Record<string, unknown>)[msg.type];
  if (typeof handler !== "function") {
    connection.sendError(ErrorCode.InvalidMessage, `unknown type: ${msg.type}`);
    return;
  }

  try {
    await (handler as (c: Connection, m: ClientMessage, x: AppContext) => Promise<void>)(
      connection,
      parsed as ClientMessage,
      ctx,
    );
  } catch (err) {
    logger.error({ err: String(err), msgType: msg.type }, "handler threw");
    connection.sendError(ErrorCode.Internal, "internal error");
  }
}
