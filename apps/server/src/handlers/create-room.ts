import { type ClientMessageType, ErrorCode } from "@quizarena/shared";
import type { Handler } from "./types.js";

export const handleCreateRoom: Handler<typeof ClientMessageType.CreateRoom> = (connection) => {
  connection.sendError(ErrorCode.Internal, "create_room not implemented");
};
