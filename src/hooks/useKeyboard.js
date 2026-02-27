import { useEffect } from "react";

/**
 * useKeyboard — registers a global keydown listener.
 * handlers: { "Escape": fn, "k+meta": fn, ... }
 * Format: "key" or "key+meta" or "key+ctrl"
 */
export function useKeyboard(handlers) {
  useEffect(() => {
    const onKeyDown = (e) => {
      for (const [combo, fn] of Object.entries(handlers)) {
        const [key, mod] = combo.split("+");
        const wantsMeta = mod === "meta";
        const wantsCtrl = mod === "ctrl";
        const wantsAny  = mod === "any";
        const modOk =
          !mod ||
          (wantsMeta && e.metaKey) ||
          (wantsCtrl && e.ctrlKey) ||
          (wantsAny  && (e.metaKey || e.ctrlKey));

        if (e.key.toLowerCase() === key.toLowerCase() && modOk) {
          e.preventDefault();
          fn(e);
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
