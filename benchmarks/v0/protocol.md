# Benchmark v0 protocol

## 1. Build a controlled corpus

Author each fixture once in a canonical structured representation. Render every baseline—Markdown, JSON, YAML, minified JSON, and TOON—from that source. Before execution, validate that every rendering preserves task-relevant fields, relationships, list membership, values, and text. Record renderer and TOON encoder versions plus a fixture hash. Formatting may differ; meaning may not.

For every fixture, define a context-size tier, task family, exact task prompt, expected answer/oracle, and answer-normalization rules. Keep a development set for harness work and a held-out set for conclusions.

## 2. Run the trial matrix

The core unit is one **format × task × model × repetition** trial. Fixture is an explicit dimension within task; context tier and run block must also be recorded.

| Dimension | v0 requirement |
| --- | --- |
| Formats | Markdown, JSON, YAML, minified JSON, TOON |
| Tasks | Exact lookup, multi-record filtering, cross-reference reasoning, constraint checking, repeated selective retrieval |
| Models | One or more pinned model/provider configurations, reported separately |
| Repetitions | Multiple independent repetitions per fixture/condition; choose and preregister the count before the run |

Use identical system instructions, task wording, output schema, decoding settings, timeout, and retry policy across formats. Randomize format order within balanced blocks and interleave models/fixtures where operationally possible. A failed or timed-out request remains a recorded trial; it is not silently rerun into success.

## 3. Repeated-read and selective-retrieval protocol

For each repeated selective-retrieval fixture, send the same full semantic context for an initial question, then a predefined sequence of follow-up questions. The sequence includes both evidence from the prior relevant subset and a different, small subset amid distractors. Do not add a retrieval tool, summary, hidden cache, or format-specific hint for only one condition.

Measure each turn and the sequence total. Label turn 1 as cold read and later turns as repeated reads. If a provider's explicit prompt cache is used, run and report cached and uncached regimes separately; never attribute provider caching to the representation. Selective-retrieval scoring includes final-answer correctness and, where requested, the required supporting record IDs to measure recall and distractor errors.

## 4. Score and preserve evidence

Score responses against a predeclared oracle after deterministic normalization (for example, whitespace/case handling and canonical ID ordering). Exact lookup and constraint tasks use exact correctness; filters use set equality; cross-reference tasks use expected derived values plus required evidence when specified. Ambiguous or malformed output is incorrect unless the task's published scorer grants explicit partial credit.

Persist append-only raw records: run ID, fixture hash, format/renderer version, prompt, model and API configuration, dispatch/completion timestamps, provider usage, raw response, normalized response, scorer version/decision, retries, errors, and pricing snapshot. Generate aggregates from these records so every result can be reproduced or audited.

## 5. Analyze fairly

Report success first, then input/output tokens, latency, cost, cost per successful task, and repeated-read/selective-retrieval efficiency. Compare paired trials on the same fixture and repetition block. Include trial counts, variability, missing/failed trials, and known confounders. Do not tune formatting, prompts, or task answers against the held-out set, and do not collapse different model versions or caching regimes into a single headline result.
