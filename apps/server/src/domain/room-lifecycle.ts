import { ErrorCode, type PlayerId, ServerMessageType } from "@quizarena/shared";
import type { AppContext } from "../types/context.js";
import type { Room } from "./room.js";

export type LeaveReason = "leave" | "disconnect";

export function handlePlayerLeaving(
  room: Room,
  leavingPlayerId: PlayerId,
  reason: LeaveReason,
  ctx: AppContext,
): void {
  const wasHost = room.hostId === leavingPlayerId;
  const removeResult = room.removePlayer(leavingPlayerId);

  if (!removeResult.ok) {
    ctx.logger.warn(
      { roomCode: room.code, playerId: leavingPlayerId, reason },
      "player not found in claimed room",
    );
    return;
  }

  if (wasHost) {
    const message =
      reason === "leave" ? "host left, room closed" : "host disconnected, room closed";
    room.broadcast({
      type: ServerMessageType.Error,
      code: ErrorCode.Internal,
      message,
    });
    ctx.rooms.destroy(room.code);
    return;
  }

  room.broadcast({
    type: ServerMessageType.PlayerLeft,
    playerId: leavingPlayerId,
  });

  if (room.isEmpty()) {
    ctx.rooms.destroy(room.code);
  }
}
