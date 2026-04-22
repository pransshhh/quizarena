import { type ClientMessageType, ErrorCode, ServerMessageType } from "@quizarena/shared";
import { mapAddPlayerError } from "./errors/index.js";
import type { Handler } from "./types.js";

export const handleJoinRoom: Handler<typeof ClientMessageType.JoinRoom> = (
  connection,
  msg,
  ctx,
) => {
  if (connection.roomCode !== null) {
    connection.sendError(ErrorCode.NotAuthorized, "already in a room");
    return;
  }

  const room = ctx.rooms.get(msg.roomCode);
  if (!room) {
    connection.sendError(ErrorCode.RoomNotFound, "room not found");
    return;
  }

  const addResult = room.addPlayer(connection, msg.playerName, false);
  if (!addResult.ok) {
    const { code, message } = mapAddPlayerError(addResult.error);
    connection.sendError(code, message);
    return;
  }

  const player = addResult.value;

  connection.send({
    type: ServerMessageType.RoomJoined,
    room: room.toSnapshot(),
    youAre: player,
  });

  room.broadcastExcept(player.id, {
    type: ServerMessageType.PlayerJoined,
    player,
  });
};
