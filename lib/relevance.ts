// Generic words that describe seniority/role-shape rather than the actual
// skill or domain being searched for. If someone searches "react developer",
// the meaningful word is "react" — a listing titled "React Engineer" is
// still a great match even though it says "Engineer" instead of "Developer".
const GENERIC_ROLE_WORDS = new Set([
  "developer",
  "developers",
  "engineer",
  "engineers",
  "programmer",
  "programmers",
  "specialist",
  "specialists",
  "manager",
  "managers",
  "analyst",
  "analysts",
  "designer",
  "designers",
  "lead",
  "leads",
  "architect",
  "architects",
  "consultant",
  "consultants",
  "associate",
  "associates",
  "intern",
  "internship",
  "staff",
  "senior",
  "junior",
  "sr",
  "jr",
  "principal",
  "director",
  "head",
  "of",
  "the",
  "a",
  "and",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .filter(Boolean);
}

/**
 * True if `title`/`tags` are a genuine match for `query`.
 *
 * Strategy: pull out the "core" tokens (the actual skill/domain words,
 * e.g. "react") and require every one of them to appear in the title or
 * tags. Generic role words (developer/engineer/senior/etc.) are ignored as
 * match criteria — they're too interchangeable across real job titles to
 * use as a hard filter, and requiring them literally is what let irrelevant
 * results slip through while filtering out good ones.
 */
export function isRelevant(
  title: string | undefined | null,
  tags: string[] | undefined,
  query: string
): boolean {
  const tokens = tokenize(query);
  if (tokens.length === 0) return true;

  const haystack = `${title || ""} ${(tags || []).join(" ")}`.toLowerCase();

  const coreTokens = tokens.filter((t) => !GENERIC_ROLE_WORDS.has(t));
  // If the whole query was generic ("senior developer"), fall back to
  // requiring all the original tokens instead of matching everything.
  const tokensToCheck = coreTokens.length > 0 ? coreTokens : tokens;

  return tokensToCheck.every((t) => haystack.includes(t));
}
