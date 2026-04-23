import { clientMessageSchema, ErrorCode } from "@quizarena/shared";
import { handlers } from "../handlers/index.js";
import type { Handler } from "../handlers/types.js";
import type { AppContext } from "../types/context.js";
import type { Connection } from "../ws/connection.js";

export async function dispatch(
  connection: Connection,
  raw: Buffer | ArrayBuffer | Buffer[],
  ctx: AppContext,
): Promise<void> {
  const logger = connection.logger;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString());
  } catch {
    connection.sendError(ErrorCode.InvalidMessage, "invalid json");
    return;
  }

  const { success, data: msg, error } = clientMessageSchema.safeParse(parsed);
  if (!success) {
    const message = error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    connection.sendError(ErrorCode.InvalidMessage, message);
    return;
  }

  const handler = handlers[msg.type];

  try {
    await (handler as Handler<typeof msg.type>)(connection, msg, ctx);
  } catch (err) {
    logger.error({ err: String(err), msgType: msg.type }, "handler threw");
    connection.sendError(ErrorCode.Internal, "internal error");
  }
}
