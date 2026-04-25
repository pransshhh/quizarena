import type { RoomRegistry } from "../domain/room-registry.js";
import type { Logger } from "../services/logger.js";
import type { QuestionService } from "../services/question-service.js";

export interface AppContext {
  logger: Logger;
  rooms: RoomRegistry;
  questions: QuestionService;
  isShuttingDown: () => boolean;
}
