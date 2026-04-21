import { ClientMessageType } from "@quizarena/shared";
import { handleCreateRoom } from "./create-room.js";
import { handleJoinRoom } from "./join-room.js";
import { handleLeaveRoom } from "./leave-room.js";
import { handleStartGame } from "./start-game.js";
import { handleSubmitAnswer } from "./submit-answer.js";
import type { Handler } from "./types.js";

export const handlers: {
  [K in ClientMessageType]: Handler<K>;
} = {
  [ClientMessageType.CreateRoom]: handleCreateRoom,
  [ClientMessageType.JoinRoom]: handleJoinRoom,
  [ClientMessageType.StartGame]: handleStartGame,
  [ClientMessageType.SubmitAnswer]: handleSubmitAnswer,
  [ClientMessageType.LeaveRoom]: handleLeaveRoom,
};
