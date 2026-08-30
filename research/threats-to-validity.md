# Threats to validity

Benchmark v0 is designed to surface limitations rather than hide them.

| Threat | Mitigation / disclosure |
| --- | --- |
| Formats differ semantically | Generate each rendition from one canonical fixture and validate round-trip values, ordering assumptions, identifiers, and task-relevant text before a trial. |
| Prompt or ordering effects | Use one task template per task, randomize format order within blocks, and record the exact prompt. Do not give one format special instructions. |
| Model or provider drift | Pin model snapshot where possible; otherwise record provider model ID, date, region, API settings, and rerun date. Do not pool across versions by default. |
| Cache, rate limits, and load | Record cache headers/status when available, dispatch order, retries, and failures. Randomize/interleave conditions; treat latency as environment-dependent. |
| Tokenizer mismatch | Prefer provider usage for billed tokens; label local tokenizer estimates and their version. |
| Fixture overfitting | Keep a held-out fixture set and publish fixture-generation rules. Do not tune a format or prompt on held-out tasks. |
| Small or synthetic corpus | Stratify by context size and task family; state that results may not generalize to proprietary or long-horizon agent workflows. |
| Nondeterminism | Fix decoding parameters, repeat trials, retain seeds when supported, and report variance rather than selecting favorable runs. |
| TOON implementation differences | Pin the encoder/version and serialize from the same canonical data; document unsupported values or lossy conventions. |

Raw request metadata, responses, scorer decisions, fixture hashes, and calculation inputs are retained in append-only result artifacts. Secrets and personally identifiable data must be excluded or redacted before publication. Any excluded trials require a reason and remain counted in the run manifest.
