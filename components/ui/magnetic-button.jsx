"use client";

import { useRef, useCallback } from "react";

/**
 * MagneticButton — button that "pulls" toward the cursor on hover.
 *
 * Props:
 *  - as        : "a" | "button" (default "a")
 *  - strength  : pull strength in px (default 12)
 *  - glow      : show shimmer/glow (default true)
 *  - className / style / children / ...rest
 */
export default function MagneticButton({
  as: Tag = "a",
  strength = 12,
  glow = true,
  className = "",
  style = {},
  children,
  ...rest
}) {
  const ref = useRef(null);
  const raf = useRef(null);

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
    },
    [strength]
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = "translate(0,0)";
  }, []);

  return (
    <Tag
      ref={ref}
      className={`mag-btn ${glow ? "mag-glow" : ""} ${className}`}
      style={{ display: "inline-flex", transition: "transform .35s cubic-bezier(.22,1,.36,1)", willChange: "transform", ...style }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
      {glow && <span className="mag-shimmer" aria-hidden="true" />}
    </Tag>
  );
}
