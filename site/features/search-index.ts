// Fuzzy search over a sitemap.json (bun/site.ts). Pure functions, no DOM, so it
// is easy to test; site/features/search.ts renders the results.
//
// Every page becomes one record, and every section of a page (text under an h2/h3,
// linked by its heading anchor) becomes another, so a hit can open `url#section`.
//
// Each query word must match somewhere in a record. A word scores by how and where
// it matches: exact word > word prefix > substring > letters in order (fuzzy) >
// one typo, weighted title > heading > description/text.

export type Sitemap = {
  version?: string | null;
  versions?: { id: string; label: string; path: string; latest: boolean; sitemap: string }[];
  pages: {
    url: string;
    title: string;
    description?: string;
    section?: string | null;
    sections?: { id: string; title: string; text: string }[];
  }[];
};

export type SearchRecord = {
  /** Where to go: page URL, plus #anchor for sections */
  href: string;
  /** Page title */
  page: string;
  /** Docs section label ("Components") or "" */
  group: string;
  /** Section heading, or "" for the page itself */
  heading: string;
  /** Body text (page description or section text) */
  text: string;
};

export type SearchResult = SearchRecord & {
  score: number;
  /** Text around the first match, split into plain and matched parts for highlighting */
  snippet: { text: string; match: boolean }[];
};

export function buildIndex(sitemap: Sitemap): SearchRecord[] {
  const records: SearchRecord[] = [];
  for (const p of sitemap.pages) {
    const group = p.section ?? "";
    const intro = p.sections?.find((s) => !s.id)?.text ?? "";
    records.push({ href: p.url, page: p.title, group, heading: "", text: [p.description, intro].filter(Boolean).join(" ") });
    for (const s of p.sections ?? []) {
      if (s.id) records.push({ href: `${p.url}#${s.id}`, page: p.title, group, heading: s.title, text: s.text });
    }
  }
  return records;
}

const normalise = (s: string) => s.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "");
const words = (s: string) => s.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/**
 * Edit distance counting a swap of two neighbouring letters as one edit
 * (optimal string alignment), stopping early once it exceeds `max`.
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j]!, before[j - 2]! + 1);
      best = Math.min(best, cur[j]!);
    }
    if (best > max) return max + 1;
    before = prev;
    prev = cur;
  }
  return prev[b.length]!;
}

/** Letters of `token` appear in order in `target`, without huge gaps. */
function isSubsequence(token: string, target: string): boolean {
  let i = 0;
  let gap = 0;
  for (const ch of target) {
    if (ch === token[i]) {
      i++;
      gap = 0;
      if (i === token.length) return true;
    } else if (i > 0 && ++gap > 3) {
      return false;
    }
  }
  return false;
}

/** How well one query word matches one field (0 = no match). */
function matchField(token: string, field: string, fieldWords: string[]): number {
  if (!field) return 0;
  if (fieldWords.includes(token)) return 10;
  if (fieldWords.some((w) => w.startsWith(token))) return 8;
  if (field.includes(token)) return 6;
  if (token.length >= 3 && fieldWords.some((w) => isSubsequence(token, w))) return 3;
  if (token.length >= 4 && fieldWords.some((w) => editDistance(token, w, 1) <= 1)) return 2;
  return 0;
}

const WEIGHTS = { page: 3, heading: 2.5, group: 1, text: 1 } as const;

type Prepared = SearchRecord & { fields: Record<keyof typeof WEIGHTS, { value: string; words: string[] }> };

const cache = new WeakMap<SearchRecord[], Prepared[]>();

function prepare(records: SearchRecord[]): Prepared[] {
  let prepared = cache.get(records);
  if (!prepared) {
    prepared = records.map((r) => {
      const field = (s: string) => {
        const value = normalise(s);
        return { value, words: words(value) };
      };
      return { ...r, fields: { page: field(r.page), heading: field(r.heading), group: field(r.group), text: field(r.text) } };
    });
    cache.set(records, prepared);
  }
  return prepared;
}

/** Text around the first matching query word, with every match marked. */
export function snippet(text: string, tokens: string[], radius = 70): SearchResult["snippet"] {
  if (!text) return [];
  const lower = normalise(text);
  const hits = tokens.map((t) => lower.indexOf(t)).filter((i) => i >= 0);
  const first = hits.length ? Math.min(...hits) : 0;
  const start = Math.max(0, first - radius);
  const end = Math.min(text.length, first + radius * 2);
  const slice = text.slice(start, end);
  const sliceLower = lower.slice(start, end);

  // Mark every occurrence of every token inside the slice
  const marks: [number, number][] = [];
  for (const t of tokens) {
    for (let i = sliceLower.indexOf(t); i >= 0 && t; i = sliceLower.indexOf(t, i + t.length)) marks.push([i, i + t.length]);
  }
  marks.sort((a, b) => a[0] - b[0]);
  const parts: SearchResult["snippet"] = [];
  let pos = 0;
  for (const [a, b] of marks) {
    if (a < pos) continue;
    if (a > pos) parts.push({ text: slice.slice(pos, a), match: false });
    parts.push({ text: slice.slice(a, b), match: true });
    pos = b;
  }
  if (pos < slice.length) parts.push({ text: slice.slice(pos), match: false });
  if (start > 0) parts.unshift({ text: "…", match: false });
  if (end < text.length) parts.push({ text: "…", match: false });
  return parts;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** The tokens in order, separated only by non-word characters. */
const adjacent = (tokens: string[]) => new RegExp(tokens.map(escapeRegExp).join("[^\\p{L}\\p{N}]+"), "u");

export function search(records: SearchRecord[], query: string, limit = 20): SearchResult[] {
  const tokens = words(normalise(query));
  if (!tokens.length) return [];
  const results: SearchResult[] = [];

  for (const r of prepare(records)) {
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      let best = 0;
      for (const key of Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]) {
        best = Math.max(best, matchField(token, r.fields[key].value, r.fields[key].words) * WEIGHTS[key]);
      }
      if (!best) {
        matchedAll = false;
        break;
      }
      score += best;
    }
    if (!matchedAll) continue;
    // The whole query as a phrase in a title or heading is the strongest signal
    const phrase = tokens.join(" ");
    if (tokens.length > 1 && (r.fields.page.value.includes(phrase) || r.fields.heading.value.includes(phrase))) score += 15;
    // Query words next to each other in the text ("btn-secondary", "dark mode") beat scattered hits
    else if (tokens.length > 1 && adjacent(tokens).test(r.fields.text.value)) score += 8;
    // A page beats its own sections when its title matches
    if (!r.heading && tokens.every((t) => r.fields.page.words.some((w) => w.startsWith(t)))) score += 5;
    const { fields: _fields, ...record } = r;
    results.push({ ...record, score, snippet: [] });
  }

  results.sort((a, b) => b.score - a.score || a.page.localeCompare(b.page) || a.heading.localeCompare(b.heading));
  return results.slice(0, limit).map((r) => ({ ...r, snippet: snippet(r.text, tokens) }));
}
