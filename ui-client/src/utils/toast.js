// toast.js
import { writable } from "svelte/store";

export const toasts = writable(new Map());

export function addToast(message, duration = 3000, background = "white") {
  const id = Date.now().toString(16);
  toasts.update((currentToasts) =>
    currentToasts.set(id, { message, duration, background }),
  );

  setTimeout(() => {
    removeToast(id);
  }, duration + 700);
}

export function removeToast(id) {
  toasts.update((currentToasts) => {
    currentToasts.delete(id);
    return currentToasts;
  });
}
