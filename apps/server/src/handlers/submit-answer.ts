import { type ClientMessageType, ErrorCode } from "@quizarena/shared";
import type { Handler } from "./types.js";

export const handleSubmitAnswer: Handler<typeof ClientMessageType.SubmitAnswer> = (connection) => {
  connection.sendError(ErrorCode.Internal, "submit_answer not implemented");
};
