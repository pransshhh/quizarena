import { randomInt } from "node:crypto";
import type { Question, QuestionId } from "@quizarena/shared";

export type Difficulty = "easy" | "medium" | "hard";

export interface ServerQuestion {
  id: QuestionId;
  text: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: Difficulty;
}

export function toWireQuestion(
  sq: ServerQuestion,
  deadline: number,
  index: number,
  total: number,
): Question {
  return {
    id: sq.id,
    text: sq.text,
    options: sq.options,
    deadline,
    index,
    total,
  };
}

export function shuffleArray<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    // biome-ignore lint/style/noNonNullAssertion: indices are guaranteed in-range
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function buildServerQuestion(args: {
  id: QuestionId;
  text: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  category: string;
  difficulty: Difficulty;
}): ServerQuestion {
  const allOptions = [args.correctAnswer, ...args.incorrectAnswers];
  const shuffled = shuffleArray(allOptions);
  const correctIndex = shuffled.indexOf(args.correctAnswer);

  return {
    id: args.id,
    text: args.text,
    options: shuffled,
    correctIndex,
    category: args.category,
    difficulty: args.difficulty,
  };
}
