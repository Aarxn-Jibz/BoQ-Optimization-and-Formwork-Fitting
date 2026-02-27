import { useState, useCallback } from "react";

/** useHover — returns [ref-props, isHovered] for any element */
export function useHover() {
  const [hovered, setHovered] = useState(false);
  const props = {
    onMouseEnter: useCallback(() => setHovered(true), []),
    onMouseLeave: useCallback(() => setHovered(false), []),
  };
  return [props, hovered];
}
