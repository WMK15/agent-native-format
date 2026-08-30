export type ScoreKind = "exact" | "set" | "rubric";

export type Score = {
  correct: boolean;
  value: number;
  normalized: string;
  reason: string;
};

function parseAnswer(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value.trim();
  }
}

function normalize(value: unknown): unknown {
  if (typeof value === "string") return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalize(item)]),
    );
  }
  return value;
}

function asSet(value: unknown): Set<string> {
  const items = Array.isArray(value) ? value : String(value).split(",");
  return new Set(items.map((item) => JSON.stringify(normalize(item))));
}

export function score(kind: ScoreKind, actual: string, expected: unknown, required: string[] = []): Score {
  const parsed = parseAnswer(actual);
  const normalizedValue = normalize(parsed);
  const normalized = JSON.stringify(normalizedValue);

  if (kind === "exact") {
    const correct = normalized === JSON.stringify(normalize(expected));
    return { correct, value: correct ? 1 : 0, normalized, reason: correct ? "exact match" : "expected exact answer" };
  }

  if (kind === "set") {
    const got = asSet(parsed);
    const want = asSet(expected);
    const correct = got.size === want.size && [...got].every((item) => want.has(item));
    return { correct, value: correct ? 1 : 0, normalized, reason: correct ? "set match" : "expected same item set" };
  }

  const searchable = typeof normalizedValue === "string" ? normalizedValue : normalized;
  const hits = required.filter((item) => searchable.includes(String(normalize(item)))).length;
  const value = required.length === 0 ? 1 : hits / required.length;
  return { correct: value === 1, value, normalized, reason: `${hits}/${required.length} rubric requirements met` };
}
