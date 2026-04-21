import { type ClientMessageType, ErrorCode } from "@quizarena/shared";
import type { Handler } from "./types.js";

export const handleLeaveRoom: Handler<typeof ClientMessageType.LeaveRoom> = (connection) => {
  connection.sendError(ErrorCode.Internal, "leave_room not implemented");
};
