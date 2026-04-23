import type { Logger } from "../services/logger.js";
import type { Connection } from "./connection.js";

const HEARTBEAT_INTERVAL_MS = 5_000;

export function setupHeartbeat(connections: Set<Connection>, logger: Logger): () => void {
  const interval = setInterval(() => {
    for (const connection of connections) {
      if (!connection.isAlive) {
        logger.warn(
          { connectionId: connection.id },
          "heartbeat: terminating unresponsive connection",
        );
        connection.socket.terminate();
        continue;
      }
      connection.isAlive = false;
      connection.socket.ping();
    }
  }, HEARTBEAT_INTERVAL_MS);

  return () => clearInterval(interval);
}
