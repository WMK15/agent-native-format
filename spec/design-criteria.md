# Evidence-backed design criteria

## Admission rule

A criterion moves from **candidate** to **supported** only after a reproducible experiment shows a meaningful improvement without violating the benchmark's correctness floor. Evidence should cover more than one task family and, before a specification is stabilized, more than one model family.

## Candidate criteria

These are hypotheses to test, not settled requirements:

- Preserve every canonical fact and stable identifier under round-trip conversion.
- Support deterministic parsing and unambiguous scalar types.
- Make exact records and fields easy to retrieve selectively.
- Avoid references that save tokens but increase cross-reference failures.
- Keep schema and nesting overhead proportional to the information represented.
- Permit streaming or bounded-memory parsing for large contexts.
- Degrade visibly: malformed or truncated inputs should be detectable.
- Remain inspectable enough to diagnose model and encoder failures.
- Provide explicit versioning and a migration path.
- Justify ecosystem complexity with lower cost per successful task, not token count alone.

## Evidence record

For each supported criterion, record:

1. The exact claim and scope.
2. The experiments and raw results supporting it.
3. Models, datasets, and task families covered.
4. Effect size, uncertainty, and known counterexamples.
5. The date and project decision that accepted it.
