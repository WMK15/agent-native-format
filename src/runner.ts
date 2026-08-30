import { createHash, randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { decode as toonDecode } from "@toon-format/toon";
import { parse as yamlParse } from "yaml";
import { score, type ScoreKind } from "./scoring.js";

export const baselineFormats = ["markdown", "json", "yaml", "minified-json", "toon"] as const;
export type Format = (typeof baselineFormats)[number];
export type ReadPhase = "cold" | "repeat";

export type Task = {
  id: string;
  family: string;
  prompt: string;
  expected: unknown;
  scoreKind: ScoreKind;
  required?: string[];
  sequenceId?: string;
  turn?: number;
  readPhase: ReadPhase;
  selectiveRetrieval: boolean;
};

export type CompletionRequest = { context: string; task: Task };
export type Completion = {
  text: string;
  usage?: { inputTokens: number; outputTokens: number };
};

export interface Provider {
  readonly name: string;
  readonly model: string;
  complete(request: CompletionRequest): Promise<Completion>;
}

export class DeterministicMockProvider implements Provider {
  readonly name = "deterministic-mock";

  constructor(readonly model = "mock-v0") {}

  async complete({ task }: CompletionRequest): Promise<Completion> {
    const answer = task.scoreKind === "rubric" ? (task.required ?? []).join("; ") : task.expected;
    const text = JSON.stringify(answer);
    return { text };
  }
}

export type Trial = {
  schemaVersion: 1;
  runId: string;
  trialId: string;
  format: Format;
  taskId: string;
  taskFamily: string;
  sequenceId?: string;
  turn?: number;
  provider: string;
  model: string;
  repetition: number;
  readPhase: ReadPhase;
  selectiveRetrieval: boolean;
  prompt: string;
  representationHash: string;
  inputTokens: number;
  inputTokenSource: "provider" | "approximate";
  outputTokens: number;
  outputTokenSource: "provider" | "approximate";
  latencyMs: number;
  estimatedCostUsd: number;
  response: string;
  score: ReturnType<typeof score>;
  fixtureHash: string;
  timestamp: string;
};

export type Aggregate = {
  trialCount: number;
  successfulTrials: number;
  successRate: number | null;
  accuracyMean: number | null;
  inputTokens: number;
  outputTokens: number;
  inputTokensPerSuccessfulTask: number | null;
  latencyMsMean: number | null;
  estimatedCostUsd: number;
  costPerSuccessfulTaskUsd: number | null;
};

export function approximateTokens(text: string): number {
  return Math.max(1, Math.ceil(Buffer.byteLength(text, "utf8") / 4));
}

export function seededOrder<T>(items: readonly T[], seed: number): T[] {
  let state = seed >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const formatFile: Record<Format, string> = {
  markdown: "agent-context.md",
  json: "agent-context.json",
  yaml: "agent-context.yaml",
  "minified-json": "agent-context.min.json",
  toon: "agent-context.toon",
};

export async function loadRepresentations(root: string): Promise<Record<Format, string>> {
  const base = join(root, "benchmarks/v0/formats");
  const entries = await Promise.all(
    baselineFormats.map(async (format) => [format, await readFile(join(base, formatFile[format]), "utf8")] as const),
  );
  return Object.fromEntries(entries) as Record<Format, string>;
}

type TaskFile = {
  tasks: Array<{
    id: string;
    kind: string;
    prompt: string;
    sequenceId?: string;
    turn?: number;
    readPhase?: ReadPhase;
    grading: {
      type: ScoreKind;
      expected?: string | string[];
      mustInclude?: string[];
    };
  }>;
};

export async function loadTasks(root: string): Promise<Task[]> {
  const taskPath = join(root, "benchmarks/v0/tasks/agent-context.tasks.json");
  const file: TaskFile = JSON.parse(await readFile(taskPath, "utf8"));
  return file.tasks.map((task) => ({
    id: task.id,
    family: task.kind,
    prompt: task.prompt,
    expected: task.grading.expected,
    scoreKind: task.grading.type,
    required: task.grading.mustInclude,
    sequenceId: task.sequenceId,
    turn: task.turn,
    readPhase: task.readPhase ?? "cold",
    selectiveRetrieval: task.kind === "selective-retrieval",
  }));
}

export type RunOptions = {
  root: string;
  output: string;
  seed: number;
  repetitions: number;
  provider: Provider;
  inputUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
};

export async function run(options: RunOptions): Promise<{ runId: string; trials: Trial[]; output: string }> {
  const validation = await validateFixtures(options.root);
  if (!validation.valid) {
    throw new Error(`Benchmark fixtures are invalid: ${[...validation.missingFormats, ...validation.errors].join("; ")}`);
  }
  const fixturePath = join(options.root, "benchmarks/v0/datasets/agent-context.canonical.json");
  const rawFixture = await readFile(fixturePath, "utf8");
  JSON.parse(rawFixture);
  const fixtureHash = createHash("sha256").update(rawFixture).digest("hex");
  const runId = `v0-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${randomUUID().slice(0, 8)}`;
  const tasks = await loadTasks(options.root);
  const representations = await loadRepresentations(options.root);
  const representationHashes = Object.fromEntries(
    baselineFormats.map((format) => [format, createHash("sha256").update(representations[format]).digest("hex")]),
  ) as Record<Format, string>;
  const trials: Trial[] = [];

  await mkdir(options.output, { recursive: true });
  const rawPath = join(options.output, `${runId}.jsonl`);
  await writeFile(join(options.output, `${runId}.manifest.json`), `${JSON.stringify({
    schemaVersion: 1,
    runId,
    createdAt: new Date().toISOString(),
    fixtureHash,
    representationHashes,
    taskIds: tasks.map((task) => task.id),
    formats: baselineFormats,
    provider: options.provider.name,
    model: options.provider.model,
    seed: options.seed,
    repetitions: options.repetitions,
    pricingUsdPerMillionTokens: {
      input: options.inputUsdPerMillionTokens,
      output: options.outputUsdPerMillionTokens,
    },
  }, null, 2)}\n`);

  for (let repetition = 1; repetition <= options.repetitions; repetition++) {
    for (const format of seededOrder(baselineFormats, options.seed + repetition)) {
      const context = representations[format];
      const representationHash = representationHashes[format];

      for (const task of tasks) {
        const started = performance.now();
        const completion = await options.provider.complete({ context, task });
        const latencyMs = Math.max(0, performance.now() - started);
        const inputTokens = completion.usage?.inputTokens ?? approximateTokens(`${task.prompt}\n${context}`);
        const outputTokens = completion.usage?.outputTokens ?? approximateTokens(completion.text);
        const tokenSource = completion.usage ? "provider" : "approximate";
        const scored = score(task.scoreKind, completion.text, task.expected, task.required);
        const estimatedCostUsd =
          (inputTokens / 1_000_000) * options.inputUsdPerMillionTokens +
          (outputTokens / 1_000_000) * options.outputUsdPerMillionTokens;
        const trial: Trial = {
          schemaVersion: 1,
          runId,
          trialId: randomUUID(),
          format,
          taskId: task.id,
          taskFamily: task.family,
          sequenceId: task.sequenceId,
          turn: task.turn,
          provider: options.provider.name,
          model: options.provider.model,
          repetition,
          readPhase: task.readPhase,
          selectiveRetrieval: task.selectiveRetrieval,
          prompt: task.prompt,
          representationHash,
          inputTokens,
          inputTokenSource: tokenSource,
          outputTokens,
          outputTokenSource: tokenSource,
          latencyMs,
          estimatedCostUsd,
          response: completion.text,
          score: scored,
          fixtureHash,
          timestamp: new Date().toISOString(),
        };
        trials.push(trial);
        await appendFile(rawPath, `${JSON.stringify(trial)}\n`);
      }
    }
  }

  await writeSummaries(options.output, runId, trials, options);
  return { runId, trials, output: options.output };
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const mean = (values: number[]) => (values.length === 0 ? null : sum(values) / values.length);

export function aggregateTrials(trials: Trial[]): Aggregate {
  const successful = trials.filter((trial) => trial.score.correct);
  const inputTokens = sum(trials.map((trial) => trial.inputTokens));
  const estimatedCostUsd = sum(trials.map((trial) => trial.estimatedCostUsd));
  return {
    trialCount: trials.length,
    successfulTrials: successful.length,
    successRate: trials.length === 0 ? null : successful.length / trials.length,
    accuracyMean: mean(trials.map((trial) => trial.score.value)),
    inputTokens,
    outputTokens: sum(trials.map((trial) => trial.outputTokens)),
    inputTokensPerSuccessfulTask: successful.length === 0 ? null : inputTokens / successful.length,
    latencyMsMean: mean(trials.map((trial) => trial.latencyMs)),
    estimatedCostUsd,
    costPerSuccessfulTaskUsd: successful.length === 0 ? null : estimatedCostUsd / successful.length,
  };
}

function ratio(numerator: number | null, denominator: number | null): number | null {
  return numerator === null || denominator === null || denominator === 0 ? null : numerator / denominator;
}

export async function writeSummaries(
  output: string,
  runId: string,
  trials: Trial[],
  options: Pick<RunOptions, "seed" | "repetitions" | "provider" | "inputUsdPerMillionTokens" | "outputUsdPerMillionTokens">,
): Promise<void> {
  const byFormat = Object.fromEntries(
    baselineFormats.map((format) => [format, aggregateTrials(trials.filter((trial) => trial.format === format))]),
  ) as Record<Format, Aggregate>;
  const repeatedByFormat = Object.fromEntries(
    baselineFormats.map((format) => {
      const sequenceTrials = trials.filter((trial) => trial.format === format && trial.sequenceId);
      const cold = aggregateTrials(sequenceTrials.filter((trial) => trial.readPhase === "cold"));
      const repeat = aggregateTrials(sequenceTrials.filter((trial) => trial.readPhase === "repeat"));
      return [format, {
        cold,
        repeat,
        repeatVsColdInputTokenRatio: ratio(
          repeat.trialCount ? repeat.inputTokens / repeat.trialCount : null,
          cold.trialCount ? cold.inputTokens / cold.trialCount : null,
        ),
      }];
    }),
  );
  const selectiveByFormat = Object.fromEntries(
    baselineFormats.map((format) => [
      format,
      aggregateTrials(trials.filter((trial) => trial.format === format && trial.selectiveRetrieval)),
    ]),
  );
  const summary = {
    schemaVersion: 1,
    runId,
    generatedAt: new Date().toISOString(),
    configuration: {
      seed: options.seed,
      repetitions: options.repetitions,
      provider: options.provider.name,
      model: options.provider.model,
      pricingUsdPerMillionTokens: {
        input: options.inputUsdPerMillionTokens,
        output: options.outputUsdPerMillionTokens,
      },
      tokenMeasurement: "Provider usage when supplied; otherwise approximate UTF-8 bytes / 4.",
    },
    overall: aggregateTrials(trials),
    byFormat,
    repeatedReadEfficiency: repeatedByFormat,
    selectiveRetrievalEfficiency: selectiveByFormat,
  };
  await writeFile(join(output, `${runId}.summary.json`), `${JSON.stringify(summary, null, 2)}\n`);

  const header = [
    "format",
    "trial_count",
    "successful_trials",
    "success_rate",
    "accuracy_mean",
    "input_tokens",
    "output_tokens",
    "input_tokens_per_success",
    "latency_ms_mean",
    "estimated_cost_usd",
    "cost_per_success_usd",
  ].join(",");
  const csv = baselineFormats.map((format) => {
    const value = byFormat[format];
    return [
      format,
      value.trialCount,
      value.successfulTrials,
      value.successRate,
      value.accuracyMean,
      value.inputTokens,
      value.outputTokens,
      value.inputTokensPerSuccessfulTask,
      value.latencyMsMean,
      value.estimatedCostUsd,
      value.costPerSuccessfulTaskUsd,
    ].join(",");
  });
  await writeFile(join(output, `${runId}.summary.csv`), `${header}\n${csv.join("\n")}\n`);
}

export type FixtureValidation = {
  valid: boolean;
  fixtureHash: string;
  checkedFormats: Format[];
  missingFormats: Format[];
  errors: string[];
  taskCount: number;
};

export async function validateFixtures(root: string): Promise<FixtureValidation> {
  const raw = await readFile(join(root, "benchmarks/v0/datasets/agent-context.canonical.json"), "utf8");
  const canonical = JSON.parse(raw);
  const base = join(root, "benchmarks/v0/formats");
  const representations = {} as Partial<Record<Format, string>>;
  const missingFormats: Format[] = [];
  const errors: string[] = [];

  for (const format of baselineFormats) {
    try {
      representations[format] = await readFile(join(base, formatFile[format]), "utf8");
    } catch {
      missingFormats.push(format);
    }
  }

  const same = (value: unknown) => JSON.stringify(value) === JSON.stringify(canonical);
  const parsers: Partial<Record<Format, (text: string) => unknown>> = {
    json: JSON.parse,
    "minified-json": JSON.parse,
    yaml: yamlParse,
    toon: toonDecode,
  };
  for (const [format, parse] of Object.entries(parsers) as Array<[Format, (text: string) => unknown]>) {
    const representation = representations[format];
    if (!representation) continue;
    try {
      if (!same(parse(representation))) errors.push(`${format} does not match the canonical fixture`);
    } catch (error) {
      errors.push(`${format} could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const markdown = representations.markdown;
  if (markdown) {
    const leaves = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.flatMap(leaves)
        : value && typeof value === "object"
          ? Object.values(value as Record<string, unknown>).flatMap(leaves)
          : [String(value)];
    if (!leaves(canonical).every((value) => markdown.includes(value))) {
      errors.push("markdown is missing one or more canonical primitive values");
    }
  }

  const tasks = await loadTasks(root);
  if (new Set(tasks.map((task) => task.id)).size !== tasks.length) errors.push("task IDs must be unique");
  if (tasks.length === 0) errors.push("task suite is empty");

  return {
    valid: missingFormats.length === 0 && errors.length === 0,
    fixtureHash: createHash("sha256").update(raw).digest("hex"),
    checkedFormats: baselineFormats.filter((format) => !missingFormats.includes(format)),
    missingFormats,
    errors,
    taskCount: tasks.length,
  };
}
