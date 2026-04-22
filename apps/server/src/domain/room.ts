import { randomUUID } from "node:crypto";
import {
  err,
  GameConfig,
  ok,
  type Player,
  type PlayerId,
  type Result,
  type RoomCode,
  type RoomSnapshot,
  type ServerMessage,
} from "@quizarena/shared";
import type { Connection } from "../ws/connection.js";

export type AddPlayerError = "room_full" | "name_taken" | "game_started";
export type RemovePlayerError = "not_found";

export type RoomState = "lobby" | "playing" | "finished";

export class Room {
  readonly code: RoomCode;
  readonly hostId: PlayerId;

  private state: RoomState = "lobby";
  private readonly players = new Map<PlayerId, Player>();
  private readonly connections = new Map<PlayerId, Connection>();

  constructor(code: RoomCode, hostId: PlayerId) {
    this.code = code;
    this.hostId = hostId;
  }

  getState(): RoomState {
    return this.state;
  }

  getPlayer(playerId: PlayerId): Player | undefined {
    return this.players.get(playerId);
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  playerCount(): number {
    return this.players.size;
  }

  startGame(): void {
    this.state = "playing";
  }

  endGame(): void {
    this.state = "finished";
  }

  addPlayer(
    connection: Connection,
    name: string,
    isHost: boolean,
    playerId: PlayerId = randomUUID(),
  ): Result<Player, AddPlayerError> {
    if (this.state !== "lobby") return err("game_started");
    if (this.players.size >= GameConfig.MaxPlayersPerRoom) return err("room_full");
    if (this.isNameTaken(name)) return err("name_taken");

    const player: Player = {
      id: playerId,
      name,
      isHost,
      score: 0,
      isConnected: true,
    };

    this.players.set(playerId, player);
    this.connections.set(playerId, connection);

    connection.playerId = playerId;
    connection.roomCode = this.code;

    return ok(player);
  }

  removePlayer(playerId: PlayerId): Result<Player, RemovePlayerError> {
    const player = this.players.get(playerId);
    if (!player) return err("not_found");

    this.players.delete(playerId);
    this.connections.delete(playerId);

    return ok(player);
  }

  private isNameTaken(name: string): boolean {
    for (const player of this.players.values()) {
      if (player.name === name) return true;
    }

    return false;
  }

  broadcast(msg: ServerMessage): void {
    for (const connection of this.connections.values()) {
      connection.send(msg);
    }
  }

  broadcastExcept(excludePlayerId: string, msg: ServerMessage): void {
    for (const [playerId, connection] of this.connections) {
      if (playerId === excludePlayerId) continue;
      connection.send(msg);
    }
  }

  toSnapshot(): RoomSnapshot {
    return {
      code: this.code,
      players: Array.from(this.players.values()),
      hostId: this.hostId,
      state: this.state,
    };
  }
}
