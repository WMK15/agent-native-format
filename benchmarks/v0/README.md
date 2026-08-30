# Benchmark v0

Benchmark v0 establishes a measurement-first baseline for agent context representations. It compares semantically equivalent Markdown, JSON, YAML, minified JSON, and TOON on realistic, context-grounded tasks. It is not a competition to make a format look compact, and it does not define an agent-native format.

Experimental formats are extension points: they may be added only with a documented encoder, semantic-equivalence validation, and the same fixtures, prompts, scoring, and trial protocol.

## Task families

- **Exact lookup:** retrieve a named value, status, owner, or timestamp.
- **Multi-record filtering:** identify every record satisfying several conditions.
- **Cross-reference reasoning:** follow IDs and relationships across records to derive an answer.
- **Constraint checking:** determine whether a proposed action violates stated policy, dependencies, or limits.
- **Repeated selective retrieval:** answer a sequence over one large context, including questions whose relevant evidence is a small subset and re-reads after an initial answer.

Fixtures represent common agent context: project state, tickets, tool results, policies, dependencies, and operational notes. Each has a canonical source representation and a task-specific oracle. See [protocol.md](protocol.md) for the comparison contract.

## Outputs

Each run produces a manifest and immutable per-trial records. Summaries break results down by format, task family, model, context-size tier, and repetition. Required metrics are input tokens, output tokens, success/accuracy, latency, estimated cost, cost per successful task, and repeated-read/selective-retrieval efficiency.

Results should be treated as model- and workload-specific evidence. A format is not declared better from token count alone.
