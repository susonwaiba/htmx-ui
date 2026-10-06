// Avatar: hides an .avatar-image that fails to load, so the .avatar-fallback under it shows
// instead of the browser's broken-image icon. Markup: see avatar.css.
// An image can fail before this runs (it starts loading with the page), so one that is
// already complete with no size is hidden at once.
import { queryAll } from "../../utils/dom";

export function initAvatar(root: ParentNode) {
  queryAll<HTMLImageElement>(root, "img.avatar-image:not([data-init])").forEach((img) => {
    img.dataset.init = "";
    const fail = () => (img.hidden = true);
    img.addEventListener("error", fail);
    // A new src gets another chance.
    img.addEventListener("load", () => (img.hidden = false));
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
  });
}
