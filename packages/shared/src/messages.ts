import type { z } from "zod";
import type { ClientMessageType, ServerMessageType } from "./constants.js";
import type {
  clientMessageSchema,
  createRoomSchema,
  joinRoomSchema,
  leaveRoomSchema,
  startGameSchema,
  submitAnswerSchema,
} from "./schemas/client.js";
import type {
  errorSchema,
  gameEndedSchema,
  gameStartedSchema,
  playerJoinedSchema,
  playerLeftSchema,
  questionEndedSchema,
  questionMsgSchema,
  roomCreatedSchema,
  roomJoinedSchema,
  serverMessageSchema,
} from "./schemas/server.js";

// Client → Server messages
export type CreateRoomMsg = z.infer<typeof createRoomSchema>;
export type JoinRoomMsg = z.infer<typeof joinRoomSchema>;
export type StartGameMsg = z.infer<typeof startGameSchema>;
export type SubmitAnswerMsg = z.infer<typeof submitAnswerSchema>;
export type LeaveRoomMsg = z.infer<typeof leaveRoomSchema>;

export type ClientMessage = z.infer<typeof clientMessageSchema>;

// Server → Client messages
export type RoomCreatedMsg = z.infer<typeof roomCreatedSchema>;
export type RoomJoinedMsg = z.infer<typeof roomJoinedSchema>;
export type PlayerJoinedMsg = z.infer<typeof playerJoinedSchema>;
export type PlayerLeftMsg = z.infer<typeof playerLeftSchema>;
export type GameStartedMsg = z.infer<typeof gameStartedSchema>;
export type QuestionMsg = z.infer<typeof questionMsgSchema>;
export type QuestionEndedMsg = z.infer<typeof questionEndedSchema>;
export type GameEndedMsg = z.infer<typeof gameEndedSchema>;
export type ErrorMsg = z.infer<typeof errorSchema>;

export type ServerMessage = z.infer<typeof serverMessageSchema>;

// Type helpers — let handlers narrow to a specific message type by name.
// Used in the handler map on the server.
export type ClientMessageOf<T extends ClientMessageType> = Extract<ClientMessage, { type: T }>;
export type ServerMessageOf<T extends ServerMessageType> = Extract<ServerMessage, { type: T }>;
