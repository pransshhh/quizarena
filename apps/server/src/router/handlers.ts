import { type ClientMessageOf, ClientMessageType, ErrorCode } from "@quizarena/shared";
import type { AppContext } from "../types/context.js";
import type { Connection } from "../ws/connection.js";

export type Handler<T extends ClientMessageType> = (
  connection: Connection,
  msg: ClientMessageOf<T>,
  ctx: AppContext,
) => void | Promise<void>;

function notImplemented(name: string) {
  return (connection: Connection) => {
    connection.sendError(ErrorCode.Internal, `${name} not implemented`);
  };
}

export const handlers: {
  [K in ClientMessageType]: Handler<K>;
} = {
  [ClientMessageType.CreateRoom]: notImplemented("create_room"),
  [ClientMessageType.JoinRoom]: notImplemented("join_room"),
  [ClientMessageType.StartGame]: notImplemented("start_game"),
  [ClientMessageType.SubmitAnswer]: notImplemented("submit_answer"),
  [ClientMessageType.LeaveRoom]: notImplemented("leave_room"),
};
