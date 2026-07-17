import { act } from "@testing-library/preact";

// Set a form control's value and fire the DOM events preact/compat actually
// listens for, flushing the re-render synchronously.
//
// Why not `fireEvent.change`? @testing-library/preact rewrites `change`→`input`
// based on a runtime "is this preact/compat?" probe that races with compat's own
// vnode hook, so the flag is effectively non-deterministic across files. And
// preact/compat keeps `<select>` on the native `change` event — only
// `<input>`/`<textarea>` are remapped to `input`. The combination means
// `fireEvent.change` silently misses selects (or, when the flag lands the other
// way, misses text inputs). Dispatching *both* native events covers every control
// type regardless; wrapping in `act()` flushes preact's queued render so the
// assertion right after sees the update.
export function setValue(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string,
): void {
  el.value = value;
  act(() => {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
