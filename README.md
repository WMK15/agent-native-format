# Agent-Native Format

This is a personal research project about whether AI agents could use a better way of storing and reading context.

It is public because I want the work and results to be visible. It is not open for contributions.

## Where this came from

I had a pretty simple idea: what if there was a file type specifically for AI agents? Something formatted in a way that they could read quicker, process with less waste, and hopefully use fewer credits.

At first I was thinking mainly about a new file extension. The more I thought about it, the more I realised the interesting part is not the extension or whether the syntax looks cool. It is the way the information is structured and how much work an agent has to do to use it.

There are already formats like TOON that try to represent structured data with fewer tokens. That is useful, but I want to look at a slightly wider problem. Agents do not only read neat tables of data. They read repository instructions, architecture docs, file maps, previous decisions, task state, dependencies, constraints, tool output, and loads of other context.

The bigger win might not be making a file 30% smaller. It might be letting an agent avoid reading 90% of it because the information is indexed, split into useful blocks, cacheable, or selectively loaded.

So this might eventually become a file format. It might become a compiled context container with a small runtime around it. It might just produce a set of findings about which structures work better. I do not know yet, which is why I am testing it before trying to design the final thing.

## What I am actually trying to work out

> Given the exact same information, can I represent it in a way that lets an AI agent reach the right answer faster and with fewer tokens and less cost, without making it less accurate or reliable?

I do not care if the answer ends up being Markdown, minified JSON, TOON, some graph-like format, a binary container, or something completely different. I also do not want to invent strange syntax just because it looks compact to a human.

The models should decide through the results.

## Why I am benchmarking it first

It would be easy to make up a format, give it a short extension, and say it is "built for AI." That does not prove anything.

A format can use fewer tokens and still be worse if the model misunderstands it, misses relationships, produces longer answers, or has to reread the same context several times. The metric I care about most is eventually **cost per successful task**, because that forces token savings and correctness into the same result.

Benchmark v0 compares the same agent-style context in:

- Markdown
- JSON
- YAML
- minified JSON
- TOON 4.1.1

The current fixture contains project metadata, files, dependencies, decisions, people, constraints, issues, and milestones. Each version is meant to contain the same facts. JSON, YAML, minified JSON, and TOON are parsed and checked against the canonical fixture. The Markdown version is checked for value coverage and manually reviewed.

The tasks cover:

- looking up an exact value;
- filtering several records;
- following references between records;
- checking constraints;
- returning to the same context for another question;
- finding a small relevant part inside a larger context.

The full setup is in [Benchmark v0](benchmarks/v0/README.md) and the rules for running comparisons are in the [benchmark protocol](benchmarks/v0/protocol.md).

## What I am measuring

| Metric | Why I care about it |
| --- | --- |
| Input tokens | How much context has to be sent to the model |
| Accuracy | Whether the agent actually got the task right |
| Output tokens | Whether the representation changes how much the model has to produce |
| Latency | How long the task takes from request to response |
| Repeated-read efficiency | What happens when the agent needs the same context again |
| Selective retrieval | Whether the agent can find a small useful part without wasting work on everything else |
| Cost per successful task | What the correct result really cost after failures are included |

Token count on its own is not a win. If something is half the size but noticeably less reliable, that trade-off needs to be shown rather than hidden.

## I am also using this to learn

This project is also an excuse for me to properly learn the more technical side of **large language models (LLMs)** and the systems built around them.

An LLM is the model itself. An AI agent is usually a larger system built around a model with prompts, tools, memory, retrieval, files, and some kind of loop for taking actions. This project touches both, but they are not the same thing.

The parts I want to understand better include:

- how text is split into tokens and why different structures use different numbers of them;
- how context windows work and what happens when they get crowded;
- how models find relationships inside long or messy context;
- how prompt caching changes repeated-read cost;
- how retrieval, indexing, and chunking decide what the model sees;
- why a smaller representation can sometimes hurt comprehension;
- how to benchmark model behaviour without accidentally designing the test around the answer I want;
- how model usage, latency, token counts, and API pricing fit together in a real agent workflow.

I have used AI tools a lot, but I do not want my understanding to stop at prompts and API calls. Building this is a way for me to get closer to what is actually happening underneath the agent layer while making something concrete at the same time.

## Current State

Benchmark v0 is bootstrapped. The repository currently has:

- one canonical agent-context dataset;
- five equivalent representations;
- nine machine-graded tasks;
- fixture validation;
- exact, set, and rubric scoring;
- seeded format ordering and repeated runs;
- raw JSONL results plus a manifest, JSON summary, and CSV summary;
- calculations for accuracy, token use, latency, repeated reads, selective retrieval, and cost per success.

The current provider is an offline deterministic mock. It checks that the benchmark machinery works, but it is **not** evidence that any format performs better with a real model. Real model runs come later.

## Run It

You need Node.js 20 or newer.

```bash
npm install
npm run typecheck
npm test
npm run validate:fixtures
npm run benchmark:v0 -- --dry-run
```

The dry run does not need an API key and does not make a network request. Generated results go into `benchmarks/v0/results/` and are ignored by Git.

## Repository layout

```text
benchmarks/   The datasets, format versions, tasks, and Benchmark v0 protocol
experiments/  A template and, later, the actual experiments
research/     The question, metrics, and things that could make the results misleading
spec/         Requirements supported by evidence; there is no format spec yet
src/          The TypeScript benchmark runner, validation, scoring, and summaries
```

## Where this could go

One possible end result is a format with an index, addressable blocks, stable sections for caching, mutable task state, and explicit relationships between pieces of context. A human could keep writing normal docs while a compiler turns them into something an agent can load more selectively.

Another possible result is that no new format is needed and a careful mix of existing formats works best for different types of information. That would still be a useful answer.

I would rather find out that the original idea is wrong than force the benchmark to justify it.

## Contributions

This is public personal research, not a community project. I am not accepting pull requests, feature requests, or outside contributions. The repository is public so the process and results can be read, not because I am looking for maintainers.

## License

There is currently no license. Normal copyright restrictions apply unless I add one later.
