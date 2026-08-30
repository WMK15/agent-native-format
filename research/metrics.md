# Benchmark v0 metrics

Each trial records raw provider usage and timestamps when available; derived numbers must retain their formula and pricing snapshot.

| Metric | Definition |
| --- | --- |
| Input tokens | Tokens billed or reported for system prompt, task prompt, and supplied context. Report context-only tokens separately when tokenizer support permits. |
| Output tokens | Tokens billed or reported for the model response, including required structured answer wrappers. |
| Accuracy / success | Proportion of trials whose normalized answer satisfies the task's predeclared oracle. Report exact success and partial-score distributions where a task supports partial credit. |
| Latency | Wall-clock time from request dispatch to completed response. Keep queue/retry time separately if observable. Report median and percentile(s), not only means. |
| Estimated cost | Input tokens × input price + output tokens × output price, using a dated model-specific price table. |
| Cost per successful task | Total estimated cost across all attempted trials divided by successful trials. Undefined when none succeeds; never replace with zero. |
| Repeated-read efficiency | Change in tokens, latency, cost, and accuracy between a first read and scheduled repeated reads of the same semantic context. |
| Selective-retrieval efficiency | The same measures when the task requires identifying a small relevant subset from a larger supplied context; also report relevant-item recall and distractor selection when the answer format exposes them. |

## Reporting rules

Report trial counts, failures, timeouts, retry policy, model identifier, provider, tokenizer/version, prompt version, and corpus fixture hash beside every aggregate. Preserve per-trial values; aggregate only after correctness scoring. Do not compare token counts from different tokenizers as if they were billing-equivalent.

Accuracy is primary. Resource metrics are interpreted conditional on accuracy: a lower-cost format that materially reduces success is reported as a trade-off, not an improvement. For stochastic models, report mean success with a confidence interval or bootstrap interval and show the paired per-fixture deltas when trials are paired.
