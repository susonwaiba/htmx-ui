// Engine logging, off unless the config asks for it:
//
//   export default defineConfig({ debug: true });
//   export default defineConfig({ debug: ["requests", "render"] });
//
// One topic per question:
//
//   requests   what answered each request, and how long it took
//   render     every render(): template, output size, duration
//   templates  the template cache: what compiled, and the warm-up
//   build      builds and dev servers: files in, files out
//
// Every request is logged when it arrives, so one with no matching answer
// after it is the thing still in flight — which is what a page that never
// finishes loading looks like from here.

export type Topic = "requests" | "render" | "templates" | "build";

export type Debug = boolean | Topic[];

export interface Logger {
  /** Whether a topic is on. Check before assembling a message. */
  on(topic: Topic): boolean;
  /** Log `message`, with `data` appended as key=value pairs. */
  log(topic: Topic, message: string, data?: Record<string, unknown>): void;
  /**
   * Run `fn`, then log `label`, the output size and how long it took.
   * Works on promises too, logging once they settle.
   */
  time<T>(topic: Topic, label: string, fn: () => T, data?: Record<string, unknown>): T;
}

export const TOPICS: Topic[] = ["requests", "render", "templates", "build"];

/** Over this many ms, a logged step is flagged: long enough to look stuck. */
const SLOW = 1000;

export function logger(debug: Debug | undefined): Logger {
  const topics = new Set<Topic>(debug === true ? TOPICS : Array.isArray(debug) ? debug : []);
  const on = (topic: Topic) => topics.has(topic);

  const log = (topic: Topic, message: string, data?: Record<string, unknown>) => {
    if (!on(topic)) return;
    const fields = data && Object.keys(data).length > 0 ? " " + fields_(data) : "";
    console.log(`[htmx-ui] ${message}${fields}`);
  };

  /** Run `fn`, then log `label`, the output size and how long it took. Works on promises too. */
  function time<T>(topic: Topic, label: string, fn: () => T, data?: Record<string, unknown>): T {
    if (!on(topic)) return fn();
    const start = performance.now();
    const report = (outcome: string, value?: unknown) => {
      const took = performance.now() - start;
      const size = typeof value === "string" ? ` ${(value.length / 1024).toFixed(1)}KB` : "";
      log(topic, `${label} ${outcome}${size} ${took.toFixed(1)}ms${took > SLOW ? " SLOW" : ""}`, data);
    };
    const result = fn();
    // handle() is async: log when the promise settles, and say so when it rejects,
    // so a request that throws leaves the same two lines as one that succeeds.
    if (result instanceof Promise) {
      return result.then(
        (value) => {
          report("done", value);
          return value;
        },
        (error) => {
          report(`failed ${error}`);
          throw error;
        },
      ) as T;
    }
    report("done", result);
    return result;
  }

  return { on, log, time };
}

function fields_(data: Record<string, unknown>): string {
  return Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
}