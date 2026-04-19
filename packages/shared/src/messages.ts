import type { ClientMessageType, ErrorCode, ServerMessageType } from "./constants.js";
import type { LeaderboardEntry, Player, Question, RoomCode, RoomSnapshot } from "./domain.js";

// Client → Server messages
export interface CreateRoomMsg {
  type: typeof ClientMessageType.CreateRoom;
  hostName: string;
}

export interface JoinRoomMsg {
  type: typeof ClientMessageType.JoinRoom;
  roomCode: RoomCode;
  playerName: string;
}

export interface StartGameMsg {
  type: typeof ClientMessageType.StartGame;
}

export interface SubmitAnswerMsg {
  type: typeof ClientMessageType.SubmitAnswer;
  questionId: string;
  answerIndex: number;
  // Client-side timestamp for latency compensation. Server uses its own
  // clock for scoring, but this lets us measure and log client-perceived
  // latency for monitoring.
  clientTimestamp: number;
}

export interface LeaveRoomMsg {
  type: typeof ClientMessageType.LeaveRoom;
}

export type ClientMessage =
  | CreateRoomMsg
  | JoinRoomMsg
  | StartGameMsg
  | SubmitAnswerMsg
  | LeaveRoomMsg;

// Server → Client messages
export interface RoomCreatedMsg {
  type: typeof ServerMessageType.RoomCreated;
  room: RoomSnapshot;
  youAre: Player;
}

export interface RoomJoinedMsg {
  type: typeof ServerMessageType.RoomJoined;
  room: RoomSnapshot;
  youAre: Player;
}

export interface PlayerJoinedMsg {
  type: typeof ServerMessageType.PlayerJoined;
  player: Player;
}

export interface PlayerLeftMsg {
  type: typeof ServerMessageType.PlayerLeft;
  playerId: string;
}

export interface GameStartedMsg {
  type: typeof ServerMessageType.GameStarted;
  startsAt: number; // absolute timestamp; first question arrives at this time
}

export interface QuestionMsg {
  type: typeof ServerMessageType.Question;
  question: Question;
}

export interface QuestionEndedMsg {
  type: typeof ServerMessageType.QuestionEnded;
  questionId: string;
  correctIndex: number;
  leaderboard: LeaderboardEntry[];
  // Per-question scoring breakdown for the client to animate.
  scoreDeltas: Record<string, number>;
}

export interface GameEndedMsg {
  type: typeof ServerMessageType.GameEnded;
  finalLeaderboard: LeaderboardEntry[];
  winnerId: string | null;
}

export interface ErrorMsg {
  type: typeof ServerMessageType.Error;
  code: ErrorCode;
  message: string;
}

export type ServerMessage =
  | RoomCreatedMsg
  | RoomJoinedMsg
  | PlayerJoinedMsg
  | PlayerLeftMsg
  | GameStartedMsg
  | QuestionMsg
  | QuestionEndedMsg
  | GameEndedMsg
  | ErrorMsg;

// Type helpers — let handlers narrow to a specific message type by name.
// Used in the handler map on the server.
export type ClientMessageOf<T extends ClientMessageType> = Extract<ClientMessage, { type: T }>;
export type ServerMessageOf<T extends ServerMessageType> = Extract<ServerMessage, { type: T }>;
