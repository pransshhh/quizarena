export type PlayerId = string;
export type RoomCode = string;
export type QuestionId = string;

export interface Player {
  id: PlayerId;
  name: string;
  score: number;
  isHost: boolean;
  isConnected: boolean;
}

export interface Question {
  id: QuestionId;
  text: string;
  options: readonly string[];
  // deadline is an absolute server timestamp (ms since epoch).
  // Clients compute their countdown from (deadline - Date.now()).
  // Why absolute, not duration: handles clock drift, late joiners,
  // and client-side pause/resume without the server caring.
  deadline: number;
  index: number; // 1-based
  total: number;
}

export interface LeaderboardEntry {
  playerId: PlayerId;
  name: string;
  score: number;
  rank: number;
}

export interface RoomSnapshot {
  code: RoomCode;
  players: Player[];
  hostId: PlayerId;
  state: "lobby" | "playing" | "finished";
}
