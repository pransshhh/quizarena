import * as z from "zod";
import { ErrorCode, ServerMessageType } from "../constants.js";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number().int().min(0),
  isHost: z.boolean(),
  isConnected: z.boolean(),
});

export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(z.string()).readonly(),
  // deadline is an absolute server timestamp (ms since epoch).
  // Clients compute their countdown from (deadline - Date.now()).
  // Why absolute, not duration: handles clock drift, late joiners,
  // and client-side pause/resume without the server caring.
  deadline: z.number().int().positive(),
  index: z.number().int().positive(), // 1-based
  total: z.number().int().positive(),
});

export const leaderboardEntrySchema = z.object({
  playerId: z.string(),
  name: z.string(),
  score: z.number().int().min(0),
  rank: z.number().int().positive(),
});

export const roomSnapshotSchema = z.object({
  code: z.string(),
  players: z.array(playerSchema),
  hostId: z.string(),
  state: z.enum(["lobby", "playing", "finished"]),
});

export const roomCreatedSchema = z.object({
  type: z.literal(ServerMessageType.RoomCreated),
  room: roomSnapshotSchema,
  youAre: playerSchema,
});

export const roomJoinedSchema = z.object({
  type: z.literal(ServerMessageType.RoomJoined),
  room: roomSnapshotSchema,
  youAre: playerSchema,
});

export const playerJoinedSchema = z.object({
  type: z.literal(ServerMessageType.PlayerJoined),
  player: playerSchema,
});

export const playerLeftSchema = z.object({
  type: z.literal(ServerMessageType.PlayerLeft),
  playerId: z.string(),
});

export const gameStartedSchema = z.object({
  type: z.literal(ServerMessageType.GameStarted),
  // absolute timestamp; first question arrives at this time
  startsAt: z.number().int().positive(),
});

export const questionMsgSchema = z.object({
  type: z.literal(ServerMessageType.Question),
  question: questionSchema,
});

export const questionEndedSchema = z.object({
  type: z.literal(ServerMessageType.QuestionEnded),
  questionId: z.string(),
  correctIndex: z.number().int().min(0),
  leaderboard: z.array(leaderboardEntrySchema),
  // Per-question scoring breakdown for the client to animate.
  scoreDeltas: z.record(z.string(), z.number().int()),
});

export const gameEndedSchema = z.object({
  type: z.literal(ServerMessageType.GameEnded),
  finalLeaderboard: z.array(leaderboardEntrySchema),
  winnerId: z.string().nullable(),
});

export const errorSchema = z.object({
  type: z.literal(ServerMessageType.Error),
  code: z.enum(Object.values(ErrorCode) as [string, ...string[]]),
  message: z.string(),
});

export const serverMessageSchema = z.discriminatedUnion("type", [
  roomCreatedSchema,
  roomJoinedSchema,
  playerJoinedSchema,
  playerLeftSchema,
  gameStartedSchema,
  questionMsgSchema,
  questionEndedSchema,
  gameEndedSchema,
  errorSchema,
]);
