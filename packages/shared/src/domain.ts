import type { z } from "zod";
import type {
  leaderboardEntrySchema,
  playerSchema,
  questionSchema,
  roomSnapshotSchema,
} from "./schemas/server.js";

export type PlayerId = string;
export type RoomCode = string;
export type QuestionId = string;

export type Player = z.infer<typeof playerSchema>;
export type Question = z.infer<typeof questionSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type RoomSnapshot = z.infer<typeof roomSnapshotSchema>;
