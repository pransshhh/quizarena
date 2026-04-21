import type { ClientMessageOf, ClientMessageType } from "@quizarena/shared";
import type { AppContext } from "../types/context.js";
import type { Connection } from "../ws/connection.js";

export type Handler<T extends ClientMessageType> = (
  connection: Connection,
  msg: ClientMessageOf<T>,
  ctx: AppContext,
) => void | Promise<void>;
