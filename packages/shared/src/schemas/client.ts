import * as z from "zod";
import { ClientMessageType } from "../constants.js";

const nameSchema = z.string().trim().min(1).max(20);

const roomCodeSchema = z
  .string()
  .transform((s) => s.toUpperCase())
  .pipe(z.string().regex(/^[A-Z2-9]{6}$/, "invalid room code"));

export const createRoomSchema = z.object({
  type: z.literal(ClientMessageType.CreateRoom),
  hostName: nameSchema,
});

export const joinRoomSchema = z.object({
  type: z.literal(ClientMessageType.JoinRoom),
  roomCode: roomCodeSchema,
  playerName: nameSchema,
});

export const startGameSchema = z.object({
  type: z.literal(ClientMessageType.StartGame),
});

export const submitAnswerSchema = z.object({
  type: z.literal(ClientMessageType.SubmitAnswer),
  questionId: z.string().min(1),
  answerIndex: z.number().int().min(0),
  // Client-side timestamp for latency compensation. Server uses its own
  // clock for scoring, but this lets us measure and log client-perceived
  // latency for monitoring.
  clientTimestamp: z.number().int().positive(),
});

export const leaveRoomSchema = z.object({
  type: z.literal(ClientMessageType.LeaveRoom),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
  createRoomSchema,
  joinRoomSchema,
  startGameSchema,
  submitAnswerSchema,
  leaveRoomSchema,
]);
