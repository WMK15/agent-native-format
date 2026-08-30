# Agent Native Format — project context

## Project

`anf-core` is **Agent Native Format** (`WMK15/agent-native-format`), a research-stage TypeScript project created at `2026-08-31T09:00:00Z`.

## Files

| ID | Path | Kind | Owner | Status | Depends on |
| --- | --- | --- | --- | --- | --- |
| file-runner | src/runner.ts | source | person-priya | planned | file-schema |
| file-schema | src/schema.ts | source | person-priya | planned | none |
| file-results | src/results.ts | source | person-mateo | planned | file-schema |
| file-v0-plan | benchmarks/v0/README.md | documentation | person-noor | active | none |
| file-fixture | benchmarks/v0/datasets/agent-context.canonical.json | dataset | person-noor | active | none |

## Dependencies

| ID | Name | Version | Purpose | Runtime |
| --- | --- | --- | --- | --- |
| dep-zod | zod | ^3.24.0 | validate benchmark records | node |
| dep-yaml | yaml | ^2.6.0 | parse YAML fixtures | node |
| dep-toon | @toon-format/toon | 4.1.1 | encode and decode TOON fixtures | node |

## Decisions

| ID | Title | Status | Date | Rationale |
| --- | --- | --- | --- | --- |
| dec-measure-first | Measure before proposing syntax | accepted | 2026-08-31 | A smaller prompt is not useful if task quality falls. |
| dec-static-fixtures | Keep v0 fixtures static | accepted | 2026-08-31 | Stable inputs make cross-format comparisons reproducible. |
| dec-no-format-winner | Do not declare a format winner in v0 | accepted | 2026-08-31 | Results must include quality and cost per successful task. |

## People

| ID | Name | Role | Responsibilities |
| --- | --- | --- | --- |
| person-priya | Priya Shah | benchmark engineer | runner; schema |
| person-mateo | Mateo Ruiz | evaluation engineer | results; grading |
| person-noor | Noor Chen | research lead | fixtures; protocol |

## Constraints

| ID | Rule | Severity |
| --- | --- | --- |
| con-node | Use Node.js 20 or later | required |
| con-ts | Keep implementation TypeScript-oriented | required |
| con-no-network | Benchmark runs must not require network access | required |
| con-push | Do not push changes without explicit user approval | required |

## Issues

| ID | Title | Status | Priority | Assignee | Created at | Related file IDs |
| --- | --- | --- | --- | --- | --- | --- |
| issue-17 | Define token counter adapter | open | high | person-priya | 2026-08-31T10:15:00Z | file-runner |
| issue-18 | Add deterministic task grader | open | high | person-mateo | 2026-08-31T10:30:00Z | file-results |
| issue-19 | Record fixture provenance | closed | medium | person-noor | 2026-08-31T10:45:00Z | file-fixture |

## Milestones

| ID | Title | Due date | Status |
| --- | --- | --- | --- |
| ms-fixtures | Fixture parity | 2026-09-03 | active |
| ms-first-run | First controlled run | 2026-09-10 | planned |
