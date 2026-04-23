import { randomUUID } from "node:crypto";
import he from "he";
import { buildServerQuestion, type Difficulty, type ServerQuestion } from "../domain/question.js";
import type { Logger } from "./logger.js";

const OPENTDB_URL = "https://opentdb.com/api.php";
const FETCH_TIMEOUT_MS = 5000;

interface OpenTdbQuestion {
  type: "multiple" | "boolean";
  difficulty: Difficulty;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OpenTdbResponse {
  response_code: number;
  results: OpenTdbQuestion[];
}

const OPENTDB_RESPONSE_CODE = {
  Success: 0,
  NoResults: 1,
  InvalidParameter: 2,
  TokenNotFound: 3,
  TokenEmpty: 4,
  RateLimit: 5,
} as const;

export type OpenTdbError =
  | "network_error"
  | "timeout"
  | "http_error"
  | "invalid_response"
  | "no_results"
  | "rate_limited";

export interface OpenTdbFetchOptions {
  amount: number;
  type?: "multiple";
}

type FetchQuestionsResult =
  | { ok: true; questions: ServerQuestion[] }
  | { ok: false; error: OpenTdbError };

export class OpenTdbClient {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async fetchQuestions(options: OpenTdbFetchOptions): Promise<FetchQuestionsResult> {
    const url = this.buildUrl(options);

    let response: Response;
    try {
      response = await this.fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "AbortError";
      this.logger.error({ err: String(err), isTimeout }, "opentdb fetch failed");
      return { ok: false, error: isTimeout ? "timeout" : "network_error" };
    }

    if (!response.ok) {
      this.logger.error(
        { status: response.status, statusText: response.statusText },
        "opentdb http error",
      );
      return { ok: false, error: "http_error" };
    }

    let body: OpenTdbResponse;
    try {
      body = (await response.json()) as OpenTdbResponse;
    } catch (err) {
      this.logger.error({ err: String(err) }, "opentdb invalid json");
      return { ok: false, error: "invalid_response" };
    }

    if (body.response_code === OPENTDB_RESPONSE_CODE.NoResults) {
      return { ok: false, error: "no_results" };
    }
    if (body.response_code === OPENTDB_RESPONSE_CODE.RateLimit) {
      return { ok: false, error: "rate_limited" };
    }
    if (body.response_code !== OPENTDB_RESPONSE_CODE.Success) {
      this.logger.error({ responseCode: body.response_code }, "opentdb unexpected response code");
      return { ok: false, error: "invalid_response" };
    }

    if (!Array.isArray(body.results) || body.results.length === 0) {
      return { ok: false, error: "no_results" };
    }

    const questions = body.results.map((q) => this.toServerQuestion(q));
    return { ok: true, questions };
  }

  private buildUrl(options: OpenTdbFetchOptions): string {
    const params = new URLSearchParams({
      amount: String(options.amount),
      type: options.type ?? "multiple",
    });
    return `${OPENTDB_URL}?${params.toString()}`;
  }

  private async fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private toServerQuestion(q: OpenTdbQuestion): ServerQuestion {
    return buildServerQuestion({
      id: randomUUID(),
      text: he.decode(q.question),
      correctAnswer: he.decode(q.correct_answer),
      incorrectAnswers: q.incorrect_answers.map((a) => he.decode(a)),
      category: he.decode(q.category),
      difficulty: q.difficulty,
    });
  }
}
