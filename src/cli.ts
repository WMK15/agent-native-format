import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { DeterministicMockProvider, run, validateFixtures } from "./runner.js";

const root = resolve(import.meta.dirname, "..");
const command = process.argv[2];

if (command === "validate:fixtures") {
  const result = await validateFixtures(root);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.valid ? 0 : 1;
} else if (command === "benchmark:v0") {
  const dryRun = process.argv.includes("--dry-run");
  const output = resolve(process.env.BENCHMARK_OUTPUT ?? "benchmarks/v0/results");
  const provider = new DeterministicMockProvider(process.env.BENCHMARK_MODEL ?? "mock-v0");
  await mkdir(output, { recursive: true });
  const result = await run({
    root,
    output,
    seed: Number(process.env.BENCHMARK_SEED ?? 20260831),
    repetitions: Number(process.env.BENCHMARK_REPETITIONS ?? 2),
    provider,
    inputUsdPerMillionTokens: Number(process.env.BENCHMARK_INPUT_USD_PER_MILLION ?? 0),
    outputUsdPerMillionTokens: Number(process.env.BENCHMARK_OUTPUT_USD_PER_MILLION ?? 0),
  });
  console.log(JSON.stringify({
    runId: result.runId,
    trialCount: result.trials.length,
    output: result.output,
    provider: provider.name,
    dryRun,
    note: "The v0 provider is offline and deterministic; no network request was made.",
  }, null, 2));
} else {
  console.error("Usage: npm run validate:fixtures | npm run benchmark:v0 -- [--dry-run]");
  process.exitCode = 1;
}
