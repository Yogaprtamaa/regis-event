"use client";

import React, { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * Render `text` onto an offscreen canvas sized to the grid dimensions,
 * then return a Set of cell indices where the text is "lit" (alpha > threshold).
 */
function computeTextMask(text, rows, cols) {
  if (typeof window === "undefined") return new Set();
  const canvas = document.createElement("canvas");
  canvas.width  = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Set();

  ctx.clearRect(0, 0, cols, rows);

  // Apply font + letter-spacing together so glyphs stay separated (readable).
  // A heavy geometric grotesque rasterizes crisp, blocky letters at low grid
  // resolution — far cleaner than a rounded display face (e.g. the "E" bars).
  const applyFont = (fs) => {
    ctx.font = `800 ${fs}px "Plus Jakarta Sans", "Arial Black", system-ui, sans-serif`;
    try {
      // separate each letter by ~18 % of the font size
      ctx.letterSpacing = `${Math.max(1, fs * 0.18).toFixed(2)}px`;
    } catch {
      /* letterSpacing unsupported — handled by manual spacing below */
    }
  };

  // Fit the text (incl. spacing) to ~84 % of the grid width
  let fontSize = rows * 0.58;
  applyFont(fontSize);
  let measured = ctx.measureText(text).width;
  const target = cols * 0.84;
  if (measured > target) {
    fontSize = Math.max(6, Math.floor(fontSize * (target / measured)));
    applyFont(fontSize);
  }

  ctx.fillStyle   = "#ffffff";
  ctx.textAlign   = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cols / 2, rows / 2);

  const { data } = ctx.getImageData(0, 0, cols, rows);
  const mask = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // alpha channel — lower threshold keeps thin strokes (e.g. E's middle bar)
      if (data[(r * cols + c) * 4 + 3] > 18) mask.add(r * cols + c);
    }
  }
  return mask;
}

export default function DataGridHero({
  rows, cols, spacing, duration,
  color, animationType, pulseEffect, mouseGlow,
  opacityMin, opacityMax, background,
  textMask, maskColor,
  children,
}) {
  const gridRef = useRef(null);

  const buildGrid = useCallback(async () => {
    const container = gridRef.current;
    if (!container) return;

    // Wait for the web font so the canvas text is accurate
    if (textMask && typeof document !== "undefined" && document.fonts?.load) {
      try { await document.fonts.load('800 24px "Plus Jakarta Sans"'); } catch {}
    }

    const mask = textMask ? computeTextMask(textMask, rows, cols) : new Set();

    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
    container.style.gap = `${spacing}px`;
    container.style.setProperty("--mouse-glow-opacity", mouseGlow ? "1" : "0");

    const total     = rows * cols;
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);

    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "dgh-cell";

      const inMask = mask.has(i);

      if (inMask) {
        // Letter cells — the text builds in from nothing, holds, then fades out (loop)
        const c = i % cols;
        const r = Math.floor(i / cols);
        cell.style.backgroundColor = maskColor || color;
        cell.style.opacity = "0"; // start invisible (gada)
        cell.style.setProperty("--opacity-max", String(opacityMax));
        // left → right sweep so letters appear progressively
        const sweep = c * 0.08 + r * 0.02;
        cell.style.animation      = `dgh-reveal ${(duration * 2.6).toFixed(1)}s ease-in-out infinite`;
        cell.style.animationDelay = `${sweep.toFixed(3)}s`;
      } else {
        // Background cells — very dim, animated normally
        cell.style.backgroundColor = color;
        cell.style.setProperty("--opacity-min", String(opacityMin));
        cell.style.setProperty("--opacity-max", String(Math.min(opacityMin * 4, 0.14)));

        if (pulseEffect) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          let delay = 0;
          if (animationType === "wave") {
            delay = (r + c) * 0.09;
          } else if (animationType === "random") {
            delay = Math.random() * duration;
          } else {
            // pulse from center
            const dr = Math.abs(r - centerRow);
            const dc = Math.abs(c - centerCol);
            delay = Math.sqrt(dr * dr + dc * dc) * 0.18;
          }
          cell.style.animation      = `dgh-pulse ${duration}s infinite alternate ease-in-out`;
          cell.style.animationDelay = `${delay.toFixed(3)}s`;
        }
      }

      container.appendChild(cell);
    }
  }, [rows, cols, spacing, color, maskColor, animationType, pulseEffect, duration, opacityMin, opacityMax, mouseGlow, textMask]);

  useEffect(() => { buildGrid(); }, [buildGrid]);

  // Mouse-follow glow
  useEffect(() => {
    if (!mouseGlow) return;
    const el = gridRef.current;
    if (!el) return;
    const handler = (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseGlow]);

  return (
    <div className="dgh-root" style={{ background }}>
      <div ref={gridRef} className="dgh-grid" aria-hidden="true" />
      <div className="dgh-content" role="region" aria-label="Hero Content">
        {children}
      </div>
    </div>
  );
}

DataGridHero.propTypes = {
  rows:          PropTypes.number.isRequired,
  cols:          PropTypes.number.isRequired,
  spacing:       PropTypes.number.isRequired,
  duration:      PropTypes.number.isRequired,
  color:         PropTypes.string.isRequired,
  animationType: PropTypes.oneOf(["pulse", "wave", "random"]).isRequired,
  pulseEffect:   PropTypes.bool.isRequired,
  mouseGlow:     PropTypes.bool.isRequired,
  opacityMin:    PropTypes.number.isRequired,
  opacityMax:    PropTypes.number.isRequired,
  background:    PropTypes.string.isRequired,
  textMask:      PropTypes.string,
  maskColor:     PropTypes.string,
  children:      PropTypes.node,
};

DataGridHero.defaultProps = {
  textMask:  null,
  maskColor: null,
  children:  null,
};
