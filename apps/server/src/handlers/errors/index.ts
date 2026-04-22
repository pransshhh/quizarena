import { ErrorCode } from "@quizarena/shared";
import type { AddPlayerError } from "../../domain/room.js";

type WireError = {
  code: ErrorCode;
  message: string;
};

export function mapAddPlayerError(error: AddPlayerError): WireError {
  switch (error) {
    case "room_full":
      return { code: ErrorCode.RoomFull, message: "room is full" };
    case "name_taken":
      return { code: ErrorCode.NameTaken, message: "name is taken" };
    case "game_started":
      return { code: "GAME_ALREADY_STARTED", message: "game already in progress" };
  }
}
