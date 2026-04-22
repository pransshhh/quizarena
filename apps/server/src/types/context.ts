import type { RoomRegistry } from "../domain/room-registry.js";
import type { Logger } from "../services/logger.js";

export interface AppContext {
  logger: Logger;
  rooms: RoomRegistry;
}
