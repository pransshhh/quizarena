import { type ClientMessageType, ErrorCode } from "@quizarena/shared";
import type { Handler } from "./types.js";

export const handleStartGame: Handler<typeof ClientMessageType.StartGame> = (connection) => {
  connection.sendError(ErrorCode.Internal, "start_game not implemented");
};
