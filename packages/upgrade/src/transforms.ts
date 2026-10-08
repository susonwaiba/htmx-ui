// Building blocks for migrations. A migration (migrations/<version>.ts) is a list of changes:
// apply() rewrites what can be rewritten safely; check() runs on the result and points at
// what is left for a person to look at (reported as file:line warnings, never edited).
//
// Markup is edited conservatively: class renames touch whole tokens of class="…" values,
// attribute renames touch HTML start tags, so prose that mentions an old class (a changelog,
// a comment) is reported rather than rewritten.

/** A place a check found, by character index in the file. */
export interface Found {
  index: number;
  message: string;
}

export interface Change {
  /** What it does, as printed per file ("… → …") and by --list. */
  description: string;
  /** Only reports (warn()); never edits. */
  manual?: boolean;
  /** Whether the change applies to a file, by its path relative to the project (with / separators). */
  files(path: string): boolean;
  apply(text: string, path: string): { text: string; count: number };
  check?(text: string, path: string): Found[];
}

export interface Migration {
  /** The release these changes land in: code on any earlier version gets them. */
  version: string;
  changes: Change[];
  /** Manual steps no pattern can find, printed after the report. */
  notes?: string[];
}

export const defineMigration = (migration: Migration) => migration;

type FileFilter = (path: string) => boolean;

export const MARKUP = /\.(html?|njk|nunjucks|jinja2?|vue|svelte|astro|php|erb|hbs)$/i;
export const SCRIPT = /\.(m?[jt]sx?|cjs|cts)$/i;
export const STYLE = /\.(css|scss|sass|less|pcss)$/i;
export const CONFIG = /(^|\/)htmx-ui\.config\.(m?[jt]s|cjs|cts)$/;

export const any =
  (...patterns: RegExp[]): FileFilter =>
  (path) =>
    patterns.some((p) => p.test(path));

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** `name` as a whole class / attribute name: not preceded or followed by a name character. */
const word = (name: string) => new RegExp(`(?<![\\w-])${escape(name)}(?![\\w-])`, "g");

/** Every match of `re` in `text`, as check() results. */
function matches(text: string, re: RegExp, message: string): Found[] {
  const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  return [...text.matchAll(global)].map((m) => ({ index: m.index ?? 0, message }));
}

/** class="…" / class='…' values (attributes and Nunjucks keyword arguments alike). */
const CLASS_ATTR = /(\bclass\s*=\s*)(["'])(.*?)\2/gs;

/** HTML start tags, with quoted attribute values that may contain ">". */
const START_TAG = /<([a-zA-Z][\w:-]*)((?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?)>/g;

/** Replace in every class value; `edit(value)` returns the new value. */
function editClassValues(text: string, edit: (value: string) => string) {
  let count = 0;
  const out = text.replace(CLASS_ATTR, (all, lead: string, quote: string, value: string) => {
    const next = edit(value);
    if (next === value) return all;
    count++;
    return `${lead}${quote}${next}${quote}`;
  });
  return { text: out, count };
}

/** Whitespace-delimited token `name` in a class value. */
const token = (name: string) => new RegExp(`(^|\\s)${escape(name)}(?=\\s|$)`, "g");
const hasToken = (value: string, name: string) => token(name).test(value);

/**
 * Rename a class: class="…" tokens in markup, `.old` selectors and "old" string literals in
 * scripts and stylesheets. Anything left mentioning it is reported.
 */
export function renameClass(from: string, to: string, { note }: { note?: string } = {}): Change {
  return {
    description: `.${from} → .${to}`,
    files: any(MARKUP, SCRIPT, STYLE),
    apply(text, path) {
      const result = editClassValues(text, (v) => v.replace(token(from), `$1${to}`));
      if (MARKUP.test(path)) return result;
      let count = result.count;
      const out = result.text
        .replace(new RegExp(`\\.${escape(from)}(?![\\w-])`, "g"), () => (count++, `.${to}`))
        .replace(new RegExp(`(["'\`])${escape(from)}\\1`, "g"), (_, q: string) => (count++, `${q}${to}${q}`));
      return { text: out, count };
    },
    check: (text) => matches(text, word(from), `still mentions ${from}; it is ${to} now${note ? ` (${note})` : ""}`),
  };
}

/**
 * Add classes to start tags whose class has `on`, unless they already have `unless`
 * (e.g. close buttons that are .btn buttons now).
 */
export function addClasses(on: string, classes: string[], { unless = classes[0] ?? on }: { unless?: string } = {}): Change {
  return {
    description: `.${on} gets ${classes.map((c) => "." + c).join(" ")}`,
    files: any(MARKUP),
    apply(text) {
      let count = 0;
      const out = text.replace(START_TAG, (tag) => {
        const edited = editClassValues(tag, (v) => {
          if (!hasToken(v, on) || hasToken(v, unless)) return v;
          const missing = classes.filter((c) => !hasToken(v, c));
          return missing.length ? `${missing.join(" ")} ${v}` : v;
        });
        count += edited.count;
        return edited.text;
      });
      return { text: out, count };
    },
  };
}

/**
 * Rename an attribute: in HTML start tags, and as a selector or string in scripts and
 * stylesheets (plus its dataset name, data-a-b → dataset.aB).
 */
export function renameAttribute(from: string, to: string): Change {
  const camel = (s: string) => s.replace(/^data-/, "").replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return {
    description: `[${from}] → [${to}]`,
    files: any(MARKUP, SCRIPT, STYLE),
    apply(text, path) {
      let count = 0;
      const rename = (s: string) => s.replace(word(from), () => (count++, to));
      if (MARKUP.test(path)) return { text: text.replace(START_TAG, rename), count };
      let out = rename(text);
      if (from.startsWith("data-") && to.startsWith("data-")) {
        out = out.replace(new RegExp(`(\\.dataset\\.)${camel(from)}\\b`, "g"), (_, lead: string) => (count++, `${lead}${camel(to)}`));
      }
      return { text: out, count };
    },
    check: (text) => matches(text, word(from), `still mentions ${from}; it is ${to} now`),
  };
}

/** Report what can't be rewritten: every match of `find` in matching files gets `message`. */
export function warn(find: RegExp, message: string, files: FileFilter = any(MARKUP, SCRIPT, STYLE)): Change {
  return { description: message, manual: true, files, apply: (text) => ({ text, count: 0 }), check: (text) => matches(text, find, message) };
}

/** A regular-expression rewrite (`find` needs the g flag); `replacement` gets String.replace's arguments. */
export function replace(description: string, files: FileFilter, find: RegExp, replacement: (match: string, ...groups: any[]) => string): Change {
  return {
    description,
    files,
    apply(text) {
      let count = 0;
      const out = text.replace(find, (...args: [string, ...any[]]) => {
        const next = replacement(...args);
        if (next !== args[0]) count++;
        return next;
      });
      return { text: out, count };
    },
  };
}
