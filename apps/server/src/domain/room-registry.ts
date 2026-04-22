import { randomInt, randomUUID } from "node:crypto";
import type { Player, RoomCode } from "@quizarena/shared";
import type { Logger } from "../services/logger.js";
import type { Connection } from "../ws/connection.js";
import { Room } from "./room.js";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_GENERATE_ATTEMPTS = 10;

export type CreateRoomResult =
  | { ok: true; room: Room; hostPlayer: Player }
  | { ok: false; error: "code_generation_failed" | "host_add_failed" };

export class RoomRegistry {
  private readonly rooms = new Map<RoomCode, Room>();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  createRoom(hostConnection: Connection, hostName: string): CreateRoomResult {
    const code = this.generateUniqueCode();
    if (!code) {
      this.logger.error("failed to generate unique room code");
      return { ok: false, error: "code_generation_failed" };
    }

    const hostId = randomUUID();
    const room = new Room(code, hostId);

    const addResult = room.addPlayer(hostConnection, hostName, true, hostId);
    if (!addResult.ok) {
      this.logger.error({ err: addResult.error }, "host add failed on new room");
      return { ok: false, error: "host_add_failed" };
    }

    this.rooms.set(code, room);
    this.logger.info({ code, hostName }, "room created");
    return { ok: true, room, hostPlayer: addResult.value };
  }

  get(code: RoomCode): Room | undefined {
    return this.rooms.get(code);
  }

  destroy(code: RoomCode): boolean {
    const existed = this.rooms.delete(code);
    if (existed) this.logger.info({ code }, "room destroyed");
    return existed;
  }

  roomCount(): number {
    return this.rooms.size;
  }

  private generateUniqueCode(): RoomCode | null {
    for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt++) {
      const code = this.generateCode();
      if (!this.rooms.has(code)) return code;
    }
    return null;
  }

  private generateCode(): RoomCode {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      const idx = randomInt(CODE_ALPHABET.length);
      code += CODE_ALPHABET[idx];
    }
    return code;
  }
}
