# Agent-Native Format

An evidence-first research project asking a narrow question:

> Can a data format designed for AI-agent context reduce tokens, latency, and cost without reducing task correctness or making selective retrieval worse?

This repository does **not** begin by proposing a syntax. It begins with a benchmark. Markdown, JSON, YAML, minified JSON, and TOON are treated as baselines; any experimental format must earn its complexity against the same facts, tasks, models, and scoring rules.

## Why this project exists

Agents repeatedly read structured context: repository maps, decisions, dependencies, constraints, issues, and working memory. Formats that are pleasant for humans are not necessarily efficient for models, while compact formats can save tokens but lose clarity, retrieval accuracy, or tooling support.

The useful unit of comparison is therefore not token count alone. It is the cost of getting a correct result under realistic access patterns.

## Research goals

1. Build reproducible, semantically equivalent format comparisons.
2. Measure correctness and operational cost together.
3. Test both one-shot reads and repeated selective retrieval.
4. Identify which format properties help or hurt agent tasks.
5. Convert repeated evidence into design criteria before drafting a specification.

### Non-goals

- Declaring a universal best format from a single model or dataset.
- Optimizing only for the smallest serialized byte or token count.
- Designing a new syntax before the baselines and harness are trustworthy.
- Replacing human-facing formats where readability or ecosystem support matters more.

## Benchmark v0

Benchmark v0 presents semantically equivalent context in:

- Markdown
- JSON
- YAML
- minified JSON
- TOON, pinned to the documented version used by the fixture
- later experimental formats, added only through the same registry and protocol

The initial agent-context dataset includes project metadata, files, dependencies, decisions, people and roles, constraints, issues, and timestamps. Its tasks exercise exact lookup, filtering, cross-references, constraint checking, and repeated selective retrieval.

Every trial records:

| Metric | Why it matters |
| --- | --- |
| Input tokens | Context-window usage and input cost |
| Task success / accuracy | Whether compactness preserves useful information |
| Output tokens | Total generation overhead |
| Latency | End-to-end task responsiveness |
| Repeated-read efficiency | Whether a representation amortizes across recurring access |
| Selective-retrieval efficiency | Cost and accuracy when only a subset is needed |
| Cost per successful task | Combined economic outcome, including failed attempts |

The benchmark keeps raw observations separate from summaries and labels approximate token counts explicitly. See [the Benchmark v0 guide](benchmarks/v0/README.md) and [protocol](benchmarks/v0/protocol.md).

## Repository layout

```text
benchmarks/   Versioned datasets, equivalent encodings, tasks, and protocols
experiments/  Registered hypotheses and reproducible experiment reports
research/     Research question, metric definitions, and validity analysis
spec/         Evidence-backed requirements; intentionally no syntax yet
src/          Lightweight TypeScript benchmark harness
```

Generated run artifacts belong under `benchmarks/v0/results/` and are ignored by Git. A run preserves raw JSONL observations, machine-readable summaries, and a manifest containing the configuration needed to reproduce it.

## Quick start

Requires a current Node.js LTS release.

```bash
npm install
npm run typecheck
npm test
npm run validate:fixtures
npm run benchmark:v0 -- --dry-run
```

The dry run uses a deterministic local provider and requires no API key. It validates the dataset, format registry, task definitions, scoring pipeline, and result generation. Real model adapters can be added behind the provider interface without coupling the benchmark to one vendor.

## Research workflow

1. Register a falsifiable hypothesis using `experiments/TEMPLATE.md`.
2. Pin the dataset, tasks, format encoder/version, model, tokenizer, and pricing assumptions.
3. Run every candidate against the same randomized trial matrix with repetitions.
4. Preserve raw results and calculate the published metrics.
5. Analyze failures and threats to validity, not only aggregate winners.
6. Promote a finding into `spec/` only after it is supported across relevant tasks and repeated runs.

## Principles

- **Semantic equivalence first.** A smaller encoding is not comparable if it drops facts.
- **Correctness before compression.** Token savings are useful only when tasks still succeed.
- **Raw data before claims.** Summaries must be traceable to individual trials.
- **Explicit uncertainty.** Heuristic token counts, rubric scores, and provider timing boundaries are labeled.
- **Version everything.** Formats, datasets, tasks, models, tokenizers, prompts, and prices change.
- **No benchmark-shaped syntax.** Experimental designs must generalize beyond one fixture.

## Status

The project is in its bootstrap phase. Benchmark v0 establishes the measurement contract and a deterministic dry-run path; it does not yet make claims about a winning format.

## License

No license has been selected yet. Until one is added, normal copyright restrictions apply.
