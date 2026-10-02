/**
 * Elements under `root` matching `selector`, including `root` itself.
 * htmx hands initialisers the newly swapped element as `root`, and that element
 * is often the component (e.g. a returned <div class="alert" data-dismissible>).
 */
export function queryAll<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
  const found = [...root.querySelectorAll<T>(selector)];
  return root instanceof Element && root.matches(selector) ? [root as Element as T, ...found] : found;
}
