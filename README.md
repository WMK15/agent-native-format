<h1 align="center">Agent-Native Format</h1>

<p align="center">
  <strong>Measure first. Design second.</strong><br>
  An evidence-first investigation into how structured context should be represented for AI agents.
</p>

<p align="center">
  <img alt="Status: Benchmark v0" src="https://img.shields.io/badge/status-Benchmark%20v0-D4A72C">
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript strict" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://nodejs.org/"><img alt="Node.js 20 or later" src="https://img.shields.io/badge/Node.js-%E2%89%A520-339933?logo=node.js&logoColor=white"></a>
  <img alt="TOON 4.1.1" src="https://img.shields.io/badge/TOON-4.1.1-6F42C1">
  <img alt="Personal research" src="https://img.shields.io/badge/project-personal%20research-0969DA">
  <img alt="Contributions closed" src="https://img.shields.io/badge/contributions-closed-6E7781">
</p>

<p align="center">
  <a href="#the-research-question">Research question</a> ·
  <a href="#benchmark-v0">Benchmark v0</a> ·
  <a href="#metrics">Metrics</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#repository-policy">Repository policy</a>
</p>

Agent-Native Format asks whether a representation designed for machine-consumed working context can make agents faster and cheaper without making them less correct. The project starts with controlled measurement across existing formats—not with a new file extension or a hand-designed syntax.

<a id="project-status"></a>

## Status

The project is in its **Benchmark v0** phase. The measurement contract, semantically equivalent baseline fixtures, realistic task suite, offline dry-run harness, and evidence-gated specification workspace are in place.

No format winner has been declared. The current deterministic mock verifies the benchmark machinery; it does not constitute model-performance evidence.

## The Research Question

> Can a data format designed for AI-agent context reduce tokens, latency, and cost without reducing task correctness or selective-retrieval performance?

Agents repeatedly consume repository maps, decisions, dependencies, constraints, issues, tool results, and working memory. Human-friendly formats are not automatically model-efficient. Compact formats can save tokens while introducing ambiguity, hiding relationships, or increasing retrieval failures.

The useful unit of comparison is therefore not serialized size alone. It is the **cost of obtaining a correct result** under realistic access patterns.

## What This Project Is

- A reproducible benchmark for semantically equivalent agent-context representations.
- A test bed for exact lookup, filtering, cross-reference reasoning, constraint checking, and repeated selective retrieval.
- A lightweight TypeScript harness with a pluggable provider boundary and an explicit token-count fallback.
- A place to turn repeated empirical findings into design criteria.
- A public research record for a privately directed project.

## What This Project Is Not

- Not a new file format—yet.
- Not a claim that one representation is universally best.
- Not a token-count leaderboard that ignores correctness.
- Not a benchmark where different formats receive different facts or special prompts.
- Not an open-source community project or a request for external contributions.

## Benchmark v0

Benchmark v0 holds the facts, prompts, scoring, model configuration, and repetitions constant while changing only the context representation.

| Baseline | Representation | Role in v0 |
| --- | --- | --- |
| Markdown | Human-oriented tables and prose | Readability baseline |
| JSON | Pretty-printed structured data | Ubiquitous structured baseline |
| YAML | Indentation-oriented structured data | Human-editable structured baseline |
| Minified JSON | Whitespace-free JSON | Simple compression baseline |
| TOON 4.1.1 | Version-pinned reference encoding | Token-oriented structured baseline |
| Experimental formats | Added later through the same registry | Evidence-seeking candidates only |

Every representation contains the same project metadata, files, dependencies, decisions, people and roles, constraints, issues, milestones, identifiers, and timestamps. JSON, minified JSON, YAML, and TOON are parser-checked against the canonical fixture. The human-authored Markdown fixture is checked for primitive-value coverage and parity-reviewed.

The initial suite contains nine machine-gradable tasks across five task families:

1. Exact lookup.
2. Multi-record filtering.
3. Cross-reference reasoning.
4. Constraint checking.
5. Repeated and selective retrieval.

See the [Benchmark v0 guide](benchmarks/v0/README.md), [protocol](benchmarks/v0/protocol.md), and [format provenance](benchmarks/v0/formats/README.md).

## Metrics

Accuracy is primary. Resource savings are interpreted only after task quality is known.

| Metric | What it answers |
| --- | --- |
| Input tokens | How much context-window capacity and input spend does the format consume? |
| Task success / accuracy | Does the representation preserve the information needed to answer correctly? |
| Output tokens | Does the format change response overhead? |
| Latency | How long does the complete task take? |
| Repeated-read efficiency | What happens when an agent returns to the same semantic context? |
| Selective-retrieval efficiency | How efficiently can the agent isolate a small relevant subset? |
| Cost per successful task | What is the economic cost after unsuccessful attempts are included? |

Raw observations remain separate from derived summaries. Every run records a manifest, fixture and representation hashes, task and format identifiers, provider/model labels, random seed, repetitions, token-measurement source, pricing inputs, raw responses, scorer decisions, and timing.

## Research Principles

- **Semantic equivalence first.** A smaller encoding is not comparable if it drops facts.
- **Correctness before compression.** Token savings matter only when the task still succeeds.
- **Raw evidence before claims.** Every summary must be traceable to individual trials.
- **Explicit uncertainty.** Approximate tokens, rubric scores, and timing boundaries are labeled.
- **Version everything.** Formats, datasets, tasks, models, tokenizers, prompts, and prices drift.
- **No benchmark-shaped syntax.** A candidate must generalize beyond one fixture.
- **Specification follows evidence.** `spec/` contains design criteria, not an invented grammar.

## Repository Structure

```text
benchmarks/
  v0/
    datasets/       Canonical structured source of truth
    formats/        Equivalent Markdown, JSON, YAML, minified JSON, and TOON
    tasks/          Machine-gradable agent-context tasks
    README.md       Benchmark scope and task families
    protocol.md     Controlled trial and reporting contract
experiments/        Hypothesis template and future experiment records
research/           Research question, metric definitions, and validity analysis
spec/               Evidence-backed design criteria; intentionally no syntax
src/                TypeScript runner, scoring, validation, metrics, and CLI
```

Generated artifacts are written to `benchmarks/v0/results/` and ignored by Git. A run produces append-only JSONL observations, a reproducibility manifest, a JSON summary, and a per-format CSV summary.

## Quick Start

Requires Node.js 20 or later.

```bash
npm install
npm run typecheck
npm test
npm run validate:fixtures
npm run benchmark:v0 -- --dry-run
```

The dry run uses an offline deterministic provider and requires no API key. It validates fixture parity, task loading, randomized condition ordering, structured-answer scoring, metric derivation, and result generation without making a network request.

### Commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Check the strict TypeScript project |
| `npm test` | Run scoring, ordering, metric, and fixture tests |
| `npm run validate:fixtures` | Confirm all baseline representations match the canonical context |
| `npm run benchmark:v0 -- --dry-run` | Execute the complete offline Benchmark v0 pipeline |

Optional environment variables configure deterministic repetitions, ordering, output location, model label, and pricing inputs:

```bash
BENCHMARK_REPETITIONS=5 \
BENCHMARK_SEED=20260831 \
BENCHMARK_MODEL=model-snapshot-name \
BENCHMARK_INPUT_USD_PER_MILLION=0 \
BENCHMARK_OUTPUT_USD_PER_MILLION=0 \
npm run benchmark:v0 -- --dry-run
```

## Research Workflow

1. Register a falsifiable hypothesis using `experiments/TEMPLATE.md`.
2. Pin the dataset, task set, encoder, model, tokenizer, prompt, and price assumptions.
3. Run every candidate through the same randomized format × task × model × repetition matrix.
4. Preserve raw results and compute the required metrics by format and designated retrieval cohort.
5. Analyze representative failures, uncertainty, and threats to validity.
6. Promote a finding into `spec/` only when repeated evidence supports it.

## Roadmap

1. **Benchmark v0** — measurement contract, fixture parity, task suite, and dry-run harness.
2. **Provider adapters** — real model usage, tokenizer reporting, and dated price snapshots.
3. **Corpus expansion** — held-out fixtures, context-size tiers, and additional agent workloads.
4. **Baseline runs** — repeated comparisons across pinned model families.
5. **Property experiments** — isolate the effects of keys, nesting, repetition, references, and ordering.
6. **Format proposal** — only if the accumulated evidence justifies a new syntax.

## Repository Policy

This repository is public for transparency and reference, but it is a **personal research project and is not open to external contributions**.

- Pull requests are not being accepted.
- The issue tracker is not a support or feature-request channel.
- The research direction, experiments, and implementation are maintained privately by the repository owner.
- Public visibility should not be interpreted as an invitation to contribute or as a grant of rights beyond those provided by an explicit license.

## License

No license has been granted. Until an explicit license is added, normal copyright restrictions apply.
