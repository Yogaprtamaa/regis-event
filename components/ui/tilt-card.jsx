"use client";

import { useRef, useCallback } from "react";

/**
 * TiltCard — 3D perspective card that tilts toward cursor.
 *
 * Props:
 *  - maxTilt  : degrees of tilt (default 8)
 *  - glare    : show light reflection (default true)
 *  - scale    : hover scale (default 1.02)
 *  - className / style / children
 */
export default function TiltCard({
  maxTilt = 8,
  glare = true,
  scale = 1.02,
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
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotY = (x - 0.5) * maxTilt * 2;
        const rotX = (0.5 - y) * maxTilt * 2;
        el.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale},${scale},${scale})`;
        if (glare) {
          el.style.setProperty("--glare-x", `${x * 100}%`);
          el.style.setProperty("--glare-y", `${y * 100}%`);
        }
      });
    },
    [maxTilt, glare, scale]
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = "perspective(600px) rotateX(0) rotateY(0) scale3d(1,1,1)";
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt-card ${glare ? "tilt-glare" : ""} ${className}`}
      style={{
        transition: "transform .45s cubic-bezier(.22,1,.36,1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
      {glare && <div className="tilt-glare-layer" aria-hidden="true" />}
    </div>
  );
}
