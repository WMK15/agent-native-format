# Experiments

Experiments test one falsifiable claim at a time against the versioned benchmark baselines. Copy `TEMPLATE.md` into a dated directory such as `experiments/2026-09-compact-keys/` and complete it before running the trial.

An experiment may introduce a candidate representation, prompt strategy, retrieval method, or scoring improvement. It must not silently change the canonical facts or give one format information that the others do not receive.

Commit experiment definitions and compact summaries when useful. Keep large or sensitive raw run artifacts outside Git, and record a stable location plus checksums so results remain auditable.
