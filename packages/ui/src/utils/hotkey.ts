// Keyboard shortcuts: "mod+k", "mod+shift+p", "ctrl+b". mod is ⌘ on Apple devices, Ctrl elsewhere.

const isApple = () => /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

/** Does `e` match a combo like "mod+shift+k"? */
export function matchesHotkey(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim());
  const key = parts.pop();
  if (!key) return false;
  const want = { ctrl: false, meta: false, alt: false, shift: false };
  for (const p of parts) {
    if (p === "mod") want[isApple() ? "meta" : "ctrl"] = true;
    else if (p === "cmd" || p === "meta") want.meta = true;
    else if (p === "ctrl" || p === "control") want.ctrl = true;
    else if (p === "alt" || p === "option") want.alt = true;
    else if (p === "shift") want.shift = true;
  }
  const pressed = e.key.toLowerCase();
  const code = e.code?.toLowerCase() ?? "";
  const keyMatches = pressed === key || code === `key${key}` || code === `digit${key}`;
  return keyMatches && e.ctrlKey === want.ctrl && e.metaKey === want.meta && e.altKey === want.alt && e.shiftKey === want.shift;
}
