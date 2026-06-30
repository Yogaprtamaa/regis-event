"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter — counts from 0 to `value` with easing.
 *
 * Props:
 *  - value    : target number (e.g. 4)
 *  - suffix   : text after number (e.g. "hr", "+")
 *  - duration : animation ms (default 2000)
 *  - className / style
 */
export default function AnimatedCounter({
  value,
  suffix = "",
  duration = 2000,
  className = "",
  style = {},
}) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          io.disconnect();
          animateCount();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  function animateCount() {
    const isNumeric = !isNaN(parseFloat(value));
    if (!isNumeric) {
      setDisplay(String(value));
      return;
    }
    const target = parseFloat(value);
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(String(current));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  return (
    <span ref={ref} className={className} style={style}>
      {display}{suffix}
    </span>
  );
}
