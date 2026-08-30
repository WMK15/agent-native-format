# Benchmark v0 fixture formats

Every file in this directory represents the JSON value in
`../datasets/agent-context.canonical.json`. The canonical JSON is the source of
truth; a benchmark runner should parse each representation and compare its
result to that value before measuring it.

| Format | File | Producer / version |
| --- | --- | --- |
| Markdown | `agent-context.md` | Hand-authored, parity-reviewed |
| JSON | `agent-context.json` | Pretty JSON |
| Minified JSON | `agent-context.min.json` | `JSON.stringify(canonical)` |
| YAML | `agent-context.yaml` | YAML 1.2-compatible fixture |
| TOON | `agent-context.toon` | `@toon-format/toon` 4.1.1 `encode` |

The TOON fixture is generated from the canonical JSON with the official
TypeScript reference encoder, `@toon-format/toon` **4.1.1**, against the
[TOON Spec 4.1 Working Draft](https://github.com/toon-format/spec/blob/main/SPEC.md)
(2026-07-26). TOON is deliberately version-pinned because its specification is
a working draft. Regenerate it with that exact package and verify
`decode(toon) === canonical` before changing it. The reference package is
documented at [toon-format/toon](https://github.com/toon-format/toon).

TOON uses comma-delimited tables where the value is uniformly tabular and
nested list form where it is not. That choice is the reference encoder's
output, not a hand-designed experimental syntax.
