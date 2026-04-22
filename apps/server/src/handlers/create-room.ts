import { type ClientMessageType, ErrorCode, ServerMessageType } from "@quizarena/shared";
import type { Handler } from "./types.js";

export const handleCreateRoom: Handler<typeof ClientMessageType.CreateRoom> = (
  connection,
  msg,
  ctx,
) => {
  if (connection.roomCode !== null) {
    connection.sendError(ErrorCode.NotAuthorized, "already in a room");
    return;
  }

  const result = ctx.rooms.createRoom(connection, msg.hostName);
  if (!result.ok) {
    connection.sendError(ErrorCode.Internal, "could not create room");
    return;
  }

  const { room, hostPlayer } = result;
  connection.send({
    type: ServerMessageType.RoomCreated,
    room: room.toSnapshot(),
    youAre: hostPlayer,
  });
};
