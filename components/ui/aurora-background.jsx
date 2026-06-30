"use client";

import { useEffect, useRef } from "react";

/**
 * AuroraBackground — layered animated radial-gradient blobs.
 * Pure CSS, zero dependencies. Renders behind children via absolute positioning.
 *
 * @param {string} className  – extra classes on the root wrapper
 * @param {object} style      – extra inline styles on the root wrapper
 * @param {"hero"|"footer"|"section"} variant – colour preset
 * @param {React.ReactNode} children
 */
export default function AuroraBackground({ className = "", style = {}, variant = "hero", children }) {
  const rootRef = useRef(null);

  /* Optional mouse-follow parallax on the blobs */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handler = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 30;
      const y = ((e.clientY - top) / height - 0.5) * 30;
      el.style.setProperty("--aurora-mx", `${x}px`);
      el.style.setProperty("--aurora-my", `${y}px`);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`aurora-root aurora-${variant} ${className}`}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      {/* Blob layer */}
      <div className="aurora-blobs" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
      </div>

      {/* Grain overlay */}
      <div className="aurora-grain" aria-hidden="true" />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
