import { err, ok, type Result } from "@quizarena/shared";
import type { ServerQuestion } from "../domain/question.js";
import type { Logger } from "./logger.js";
import type { OpenTdbClient } from "./opentdb-client.js";

const POOL_TARGET = 100;
const REFILL_THRESHOLD = 30;
const REFILL_BATCH = 50;

const OPENTDB_MAX_PER_REQUEST = 50;

export type QuestionServiceError = "insufficient_questions" | "service_unavailable";

export class QuestionService {
  private readonly client: OpenTdbClient;
  private readonly logger: Logger;

  private pool: ServerQuestion[] = [];

  private refillPromise: Promise<void> | null = null;

  constructor(client: OpenTdbClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  async warmCache(): Promise<void> {
    this.logger.info({ target: POOL_TARGET }, "warming question cache");
    await this.refill(POOL_TARGET);
    this.logger.info({ poolSize: this.pool.length }, "question cache warmed");
  }

  async getQuestions(count: number): Promise<Result<ServerQuestion[], QuestionServiceError>> {
    if (this.pool.length === 0) {
      this.triggerBackgroundRefill();
      return err("service_unavailable");
    }

    if (this.pool.length < count) {
      this.triggerBackgroundRefill();
      return err("insufficient_questions");
    }

    const questions = this.pool.splice(0, count);

    if (this.pool.length < REFILL_THRESHOLD) {
      this.triggerBackgroundRefill();
    }

    return ok(questions);
  }

  poolSize(): number {
    return this.pool.length;
  }

  private triggerBackgroundRefill(): void {
    if (this.refillPromise) return;
    this.refillPromise = this.refill(REFILL_BATCH).finally(() => {
      this.refillPromise = null;
    });
  }

  private async refill(count: number): Promise<void> {
    const amount = Math.min(count, OPENTDB_MAX_PER_REQUEST);
    const result = await this.client.fetchQuestions({ amount });

    if (!result.ok) {
      this.logger.warn({ err: result.error, requestedAmount: amount }, "question refill failed");
      return;
    }

    this.pool.push(...result.questions);
    this.logger.debug(
      { added: result.questions.length, poolSize: this.pool.length },
      "question pool refilled",
    );
  }
}
