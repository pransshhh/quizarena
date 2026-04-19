export const ClientMessageType = {
  CreateRoom: "create_room",
  JoinRoom: "join_room",
  StartGame: "start_game",
  SubmitAnswer: "submit_answer",
  LeaveRoom: "leave_room",
} as const;

export const ServerMessageType = {
  RoomCreated: "room_created",
  RoomJoined: "room_joined",
  PlayerJoined: "player_joined",
  PlayerLeft: "player_left",
  GameStarted: "game_started",
  Question: "question",
  QuestionEnded: "question_ended",
  GameEnded: "game_ended",
  Error: "error",
} as const;

export const CloseCode = {
  Normal: 1000,
  GoingAway: 1001,
  PolicyViolation: 1008,
  ServerRestart: 1012,
  InvalidToken: 4001,
  RoomNotFound: 4004,
  RoomFull: 4005,
  GameAlreadyStarted: 4006,
} as const;

export const GameConfig = {
  MinPlayersToStart: 2,
  MaxPlayersPerRoom: 10,
  QuestionsPerGame: 10,
  QuestionDurationMs: 15_000,
  LeaderboardDisplayMs: 5_000,
  MaxScorePerQuestion: 1000,
} as const;

export const ErrorCode = {
  InvalidMessage: "INVALID_MESSAGE",
  RoomNotFound: "ROOM_NOT_FOUND",
  RoomFull: "ROOM_FULL",
  NameTaken: "NAME_TAKEN",
  NotAuthorized: "NOT_AUTHORIZED",
  GameAlreadyStarted: "GAME_ALREADY_STARTED",
  GameNotStarted: "GAME_NOT_STARTED",
  InvalidAnswer: "INVALID_ANSWER",
  RateLimited: "RATE_LIMITED",
  Internal: "INTERNAL_ERROR",
} as const;

export type ClientMessageType = (typeof ClientMessageType)[keyof typeof ClientMessageType];
export type ServerMessageType = (typeof ServerMessageType)[keyof typeof ServerMessageType];
export type CloseCode = (typeof CloseCode)[keyof typeof CloseCode];
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
