// Dialog and alert dialog, on the native <dialog>. Markup: see dialog.css.
// - Open with an invoker command: <button commandfor="<id>" command="show-modal">. Browsers that
//   have invoker commands do it natively; for the rest, the click is handled here (show-modal,
//   close and request-close).
// - Close: Escape (native), <form method="dialog">, or any [data-dialog-close] inside. Its value
//   becomes the dialog's returnValue, so a listener on the native close event can tell which
//   button closed it.
// - A click outside (on the backdrop) closes it, unless it is role="alertdialog" or has
//   closedby="none" / "closerequest": an alert dialog waits for an answer.
// - A dialog:close event from inside closes it, so a server can close the dialog a form was
//   posted from with the response header HX-Trigger: dialog:close.
// - data-dialog-show opens it as a modal as soon as it is initialised, for a dialog an htmx
//   request returns. data-dialog-remove removes it from the page once it has closed.
import { queryAll } from "../../utils/dom";

let listening = false;

const supportsCommands = () => "command" in HTMLButtonElement.prototype;

function onCommand(e: MouseEvent) {
  if (supportsCommands()) return;
  const button = (e.target as Element).closest?.<HTMLButtonElement>("button[commandfor]");
  const target = button && document.getElementById(button.getAttribute("commandfor")!);
  if (!(target instanceof HTMLDialogElement)) return;
  const command = button!.getAttribute("command");
  if (command === "show-modal" && !target.open) target.showModal();
  else if (command === "close" && target.open) target.close(button!.value);
  else if (command === "request-close" && target.open) {
    if (target.dispatchEvent(new Event("cancel", { cancelable: true }))) target.close(button!.value);
  }
}

/** The longest transition (duration + delay) on `el`, in ms; 150 when the browser doesn't say. */
function transitionTime(el: Element): number {
  const style = getComputedStyle(el);
  const ms = (list: string) => list.split(",").map((v) => parseFloat(v) * (/ms\s*$/.test(v) ? 1 : 1000) || 0);
  const durations = ms(style.transitionDuration || "");
  const delays = ms(style.transitionDelay || "");
  if (!style.transitionDuration) return 150;
  return Math.max(0, ...durations.map((d, i) => d + (delays[i % delays.length] ?? 0)));
}

export function initDialog(root: ParentNode) {
  if (!listening) {
    listening = true;
    document.addEventListener("click", onCommand);
  }

  queryAll<HTMLDialogElement>(root, "dialog[data-dialog]:not([data-init])").forEach((dialog) => {
    dialog.dataset.init = "";

    const lightDismiss = () =>
      dialog.getAttribute("role") !== "alertdialog" &&
      !["none", "closerequest"].includes(dialog.getAttribute("closedby") ?? "");
    // A click on the backdrop targets the dialog itself, outside its box. Both the press and
    // the release must be outside, so selecting text inside and releasing outside doesn't close.
    const outside = (e: MouseEvent) => {
      if (e.target !== dialog) return false;
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    dialog.addEventListener("pointerdown", (e) => (pressedOutside = outside(e)));
    dialog.addEventListener("click", (e) => {
      const close = (e.target as Element).closest<HTMLElement>("[data-dialog-close]");
      if (close && close.closest("dialog") === dialog) {
        dialog.close(close.dataset.dialogClose || (close as HTMLButtonElement).value || undefined);
      } else if (pressedOutside && outside(e) && lightDismiss()) {
        dialog.close();
      }
      pressedOutside = false;
    });

    dialog.addEventListener("dialog:close", (e) => {
      if ((e.target as Element).closest("dialog") === dialog) dialog.close();
    });

    if (dialog.hasAttribute("data-dialog-remove")) {
      // After the closing transition (dialog.css; a sheet or drawer slides for longer)
      dialog.addEventListener("close", () => setTimeout(() => dialog.remove(), transitionTime(dialog) + 50));
    }
    if (dialog.hasAttribute("data-dialog-show") && !dialog.open && dialog.isConnected) dialog.showModal();
  });
}
