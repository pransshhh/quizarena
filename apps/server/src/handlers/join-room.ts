import { type ClientMessageType, ErrorCode } from "@quizarena/shared";
import type { Handler } from "./types.js";

export const handleJoinRoom: Handler<typeof ClientMessageType.JoinRoom> = (connection) => {
  connection.sendError(ErrorCode.Internal, "join_room not implemented");
};
