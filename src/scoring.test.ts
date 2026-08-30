import assert from "node:assert/strict";
import test from "node:test";
import { score } from "./scoring.js";
import { aggregateTrials, approximateTokens, seededOrder, validateFixtures, type Trial } from "./runner.js";

test("scores exact, set, and rubric answers", () => {
  assert.equal(score("exact", '"YES"', "yes").correct, true);
  assert.equal(score("exact", '["runner", "schema"]', ["runner", "schema"]).correct, true);
  assert.equal(score("set", '["b", "a"]', ["a", "b"]).correct, true);
  assert.equal(score("rubric", "Includes alpha and beta", "", ["alpha", "beta"]).value, 1);
});
test("seeded ordering and approximate token fallback are deterministic", () => {
  assert.deepEqual(seededOrder(["a", "b", "c"], 7), seededOrder(["a", "b", "c"], 7));
  assert.equal(approximateTokens("12345"), 2);
});
test("validates all authored baseline fixtures", async () => {
  const result = await validateFixtures(process.cwd());
  assert.equal(result.valid, true);
  assert.deepEqual(result.missingFormats, []);
  assert.equal(result.taskCount, 9);
});

test("derives cost and efficiency denominators from successful trials", () => {
  const trial = {
    inputTokens: 100,
    outputTokens: 10,
    latencyMs: 20,
    estimatedCostUsd: 0.002,
    score: { correct: true, value: 1 },
  } as Trial;
  const result = aggregateTrials([
    trial,
    { ...trial, score: { correct: false, value: 0, normalized: "", reason: "test failure" } },
  ]);
  assert.equal(result.successRate, 0.5);
  assert.equal(result.inputTokensPerSuccessfulTask, 200);
  assert.equal(result.costPerSuccessfulTaskUsd, 0.004);
});
