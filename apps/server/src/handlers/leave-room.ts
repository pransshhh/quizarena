import { type ClientMessageType, ErrorCode } from "@quizarena/shared";
import { handlePlayerLeaving } from "../domain/room-lifecycle.js";
import type { Handler } from "./types.js";

export const handleLeaveRoom: Handler<typeof ClientMessageType.LeaveRoom> = (
  connection,
  _msg,
  ctx,
) => {
  if (!connection.roomCode || !connection.playerId) {
    connection.sendError(ErrorCode.NotAuthorized, "not in a room");
    return;
  }

  const room = ctx.rooms.get(connection.roomCode);
  const leavingPlayerId = connection.playerId;

  connection.playerId = null;
  connection.roomCode = null;

  if (!room) return;

  handlePlayerLeaving(room, leavingPlayerId, "leave", ctx);
};
