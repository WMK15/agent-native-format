# Research question

Can a representation of the *same agent context* reduce resource use while preserving or improving an agent's ability to complete context-grounded tasks?

Benchmark v0 does not try to answer this by designing a new language. It establishes a reproducible baseline across Markdown, JSON, YAML, minified JSON, and TOON. Experimental formats may join only after they can express the benchmark corpus without changing its meaning.

## What counts as evidence

For each task, a format is useful only if it provides a measurable benefit in one or more of:

- input tokens, output tokens, end-to-end latency, or estimated API cost;
- task success / accuracy;
- efficiency when an agent revisits a context or retrieves a small relevant subset.

Token savings alone are not a win if accuracy falls or the task becomes less reliable. Results are reported by task family, model, and repetition, with uncertainty rather than a single universal ranking.

## Scope and non-goals

The unit under test is the serialized context plus its task prompt, not a parser, retrieval index, tool protocol, or a model's hidden reasoning. v0 measures read-and-answer behavior on fixed, realistic synthetic agent contexts. It does not claim that one format is best for every model, domain, or production retrieval system.

The benchmark keeps semantics, task wording, context size tier, decoding settings, and model version fixed within a comparison. It intentionally leaves format invention, compression tricks that discard information, and benchmark-specific prompting out of scope.
