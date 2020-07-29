import { useState, useCallback } from "react";

type HoverProps = {
  disabled?: boolean;
};

type HoverState = [
  boolean,
  { onMouseEnter?: (e: any) => void; onMouseLeave?: (e: any) => void }
];

export const useHover = ({ disabled }: HoverProps) => {
  const [hovered, setHovered] = useState(false);
  const mouseEnter = useCallback(() => setHovered(true), []);
  const mouseLeave = useCallback(() => setHovered(false), []);
  return [
    hovered,
    disabled ? {} : { onMouseEnter: mouseEnter, onMouseLeave: mouseLeave }
  ];
};

