"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── IT FEST 6.0 tokens (DESIGN.md + app/page.js C) ──
const C = {
  sand: "#FDF5E4",
  wetSand: "#E7D4A6",
  lime: "#B5D948",
  yellow: "#FED245",
  coral: "#EB3C6B",
  orange: "#F6890C",
  blue: "#31AECE",
  seaLight: "#5FC8E4",
  seaDeep: "#1E86AC",
  navy: "#082E4B",
  ink: "#0F172A",
  muted: "#5A6A7E",
};

export interface Speaker {
  name: string;
  role: string;
  src: string;
}

export interface ScrollPortraitWallProps {
  title?: React.ReactNode;
  date?: React.ReactNode;
  hint?: React.ReactNode;
  speakers?: Speaker[];
  columns?: number;
  showCaptions?: boolean;
  className?: string;
  /** IT FEST variant: sand = pasir (samain bg sekitar), sea = biru laut */
  variant?: "sand" | "sea";
  /** Judul di tengah sticky (center) atau di atas entry (top) */
  titlePosition?: "center" | "top";
}

function buildLayout(count: number, cols: number): number[][] {
  const rows: number[][] = [];
  let i = 0;
  let r = 0;
  while (i < count) {
    const row = new Array<number>(cols).fill(-1);
    const a = (r * 2 + (r % 2)) % cols;
    row[a] = i++;
    if (r % 3 === 0 && i < count) {
      let b = (a + 2) % cols;
      if (b === a) b = (a + 1) % cols;
      row[b] = i++;
    }
    rows.push(row);
    r++;
  }
  return rows;
}

function useResponsiveColumns(desired: number): number {
  const [cols, setCols] = React.useState(desired);
  React.useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      if (lg.matches) setCols(desired);
      else if (sm.matches) setCols(Math.min(desired, 3));
      else setCols(Math.min(desired, 2));
    };
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, [desired]);
  return cols;
}

const DEMO_SPEAKERS: Speaker[] = [
  { name: "Alex Johnson", role: "CEO & Founder" },
  { name: "Sarah Chen", role: "CTO" },
  { name: "Marcus Rivera", role: "Lead Designer" },
  { name: "Emily Watson", role: "Product Manager" },
  { name: "David Kim", role: "Senior Developer" },
  { name: "Lisa Thompson", role: "Marketing Director" },
  { name: "James Wilson", role: "UX Researcher" },
  { name: "Rachel Green", role: "Data Scientist" },
  { name: "Michael Brown", role: "DevOps Engineer" },
  { name: "Anna Davis", role: "Content Strategist" },
].map((s, i) => ({
  ...s,
  src: `https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/avatar-images/avatar-${String((i % 5) + 1).padStart(2, "0")}.jpg`,
}));

export function ScrollPortraitWall({
  title = (
    <>
      Pembicara <span style={{ color: C.yellow }}>IT FEST</span>
    </>
  ),
  date = "13 — 14 Okt 2026 · Universitas Paramadina",
  hint = "scroll untuk lihat efeknya",
  speakers = DEMO_SPEAKERS,
  columns = 4,
  showCaptions = true,
  className,
  variant = "sea",
  titlePosition = "center",
}: ScrollPortraitWallProps) {
  const root = React.useRef<HTMLElement | null>(null);
  const hintRef = React.useRef<HTMLDivElement | null>(null);
  const cols = useResponsiveColumns(Math.max(1, columns));
  const layout = React.useMemo(() => buildLayout(speakers.length, cols), [speakers.length, cols]);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const items = gsap.utils.toArray<HTMLElement>(".spw-item");
      if (reduce) {
        gsap.set(items, { scale: 1 });
        return;
      }
      gsap.to(hintRef.current, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=40%",
          scrub: true,
        },
      });
      items.forEach((el) => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          })
          .fromTo(el, { scale: 0 }, { scale: 1, ease: "power2.out", duration: 0.5 })
          .to(el, { scale: 0, ease: "power2.in", duration: 0.5 });
      });
    },
    { scope: root, dependencies: [cols], revertOnUpdate: true },
  );

  const isSand = variant === "sand";
  const isTop = titlePosition === "top";

  return (
    <section
      ref={root}
      aria-label={typeof title === "string" ? title : undefined}
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        background: isSand ? C.sand : `linear-gradient(180deg, ${C.seaLight} 0%, ${C.blue} 55%, ${C.seaDeep} 100%)`,
      }}
    >
      {/* grain — pasir butir / atau shimmer laut */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: isSand ? 0.55 : 0.18,
          pointerEvents: "none",
          backgroundImage: isSand
            ? "radial-gradient(circle at 8% 22%, rgba(139,105,20,.14) 1.4px, transparent 1.9px), radial-gradient(circle at 34% 68%, rgba(139,105,20,.11) 1px, transparent 1.6px), radial-gradient(circle at 62% 18%, rgba(139,105,20,.12) 1.2px, transparent 1.7px), radial-gradient(circle at 88% 55%, rgba(139,105,20,.13) 1.3px, transparent 1.8px)"
            : "radial-gradient(circle at 12% 20%, rgba(255,255,255,.9) 1.2px, transparent 1.8px), radial-gradient(circle at 70% 60%, rgba(255,255,255,.7) 1px, transparent 1.6px), radial-gradient(circle at 40% 85%, rgba(255,255,255,.8) 1.1px, transparent 1.7px)",
          backgroundSize: isSand ? "130px 130px, 100px 100px, 120px 120px, 140px 140px" : "140px 140px, 100px 100px, 120px 120px",
        }}
      />
      {isSand && isTop && (
        <>
          <div aria-hidden="true" style={{ position: "absolute", top: 18, left: "4%", opacity: 0.55, pointerEvents: "none" }}>
            <span style={{ fontSize: 28 }}>🐚</span>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", top: 24, right: "5%", opacity: 0.55, pointerEvents: "none" }}>
            <span style={{ fontSize: 24 }}>⭐</span>
          </div>
        </>
      )}

      {/* Hint — top mode: inline di header, center mode: floating */}
      {!isTop && (
        <div
          ref={hintRef}
          className="pointer-events-none absolute left-1/2 top-[58vh] z-10 grid -translate-x-1/2 content-start justify-items-center gap-4 text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-black px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[.14em] shadow-[3px_3px_0_#000]"
            style={{ background: C.yellow, color: C.navy, fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full border-2 border-black" style={{ background: C.coral }} />
            {hint}
          </span>
          <span aria-hidden="true" className="h-14 w-px bg-gradient-to-b from-black/40 to-transparent" style={{ opacity: 0.5 }} />
        </div>
      )}

      {/* Title — top: pakai SectionHead pasir (samain kayak About/Hasil), center: sticky tengah kayak demo */}
      {isTop ? (
        <div className="container" style={{ position: "relative", zIndex: 10, paddingTop: 72, paddingBottom: 0 }}>
          <div style={{ marginBottom: 36 }}>
            <span className="k-tag" style={{ background: C.yellow, color: C.navy, marginBottom: 14, display: "inline-flex" }}>
              {hint}
            </span>
            <h2
              className="fd"
              style={{
                fontSize: "clamp(1.7rem,3.2vw,2.4rem)",
                fontWeight: 600,
                color: C.navy,
                lineHeight: 1.1,
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              {title}
            </h2>
            {date && (
              <p
                className="fb"
                style={{
                  color: C.muted,
                  fontSize: 14,
                  fontWeight: 500,
                  marginTop: 10,
                  lineHeight: 1.75,
                  maxWidth: 520,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {date}
              </p>
            )}
            <p
              className="fb"
              style={{
                color: C.muted,
                fontSize: 13,
                fontWeight: 500,
                marginTop: 6,
                lineHeight: 1.7,
                maxWidth: 480,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              Dari kampus sampai industri — mereka yang bikin ombak IT FEST 6.0 makin gede.
            </p>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none sticky top-1/2 z-20 -translate-y-1/2 text-center">
          <div
            className="mx-auto inline-block rounded-[18px] border-[3px] border-black px-6 py-4 shadow-[6px_6px_0_#000] sm:px-8"
            style={{ background: C.navy, transform: "rotate(-1deg)" }}
          >
            <h2
              className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                color: C.lime,
                WebkitTextStroke: "3px #000",
                paintOrder: "stroke fill",
                textShadow: `3px 4px 0 ${C.yellow}, 6px 8px 0 rgba(0,0,0,.22)`,
                letterSpacing: "-.02em",
                lineHeight: 0.9,
              }}
            >
              {title}
            </h2>
            {date && (
              <p
                className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border-2 border-black px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.12em] shadow-[2px_2px_0_#000]"
                style={{ background: C.coral, color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                {date}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Grid — sparse wall kayak referensi, tapi dalam .container biar gak mojok. Sand+top tetap sparse, bukan dense. */}
      <div className={isTop ? "container relative z-0 pb-12" : "relative z-0 mb-[45vh] mt-[50vh] px-3 sm:px-6"}>
        <div className={isTop ? "" : "mx-auto max-w-[1100px]"}>
          {layout.map((row, ri) => (
            <div key={ri} className="flex w-full gap-3 sm:gap-4" style={{ marginBottom: showCaptions ? 28 : 12 }}>
              {row.map((idx, ci) => {
                if (idx === -1) return <div key={ci} className="aspect-square flex-1" />;
                const s = speakers[idx];
                const origin = ci < cols / 2 ? "right bottom" : "left bottom";
                const awningColor = [C.coral, C.yellow, C.lime, C.blue, C.orange][idx % 5];
                return (
                  <div key={ci} className="aspect-square flex-1 max-w-[360px]">
                    <div
                      className="spw-item relative h-full w-full overflow-hidden rounded-[18px] border-[3px] border-black shadow-[5px_5px_0_#000]"
                      style={{ transformOrigin: origin, transform: "scale(0)", background: "#fff" }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          height: 18,
                          background: `repeating-linear-gradient(90deg, ${awningColor} 0 14px, #fff 14px 28px)`,
                          borderBottom: "2.5px solid #000",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -9,
                            height: 9,
                            backgroundImage: `radial-gradient(circle at 9px 0, ${awningColor} 8px, transparent 9px)`,
                            backgroundRepeat: "repeat-x",
                            backgroundSize: "18px 9px",
                          }}
                        />
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.src}
                        alt={s.name}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-[calc(100%-18px)] w-full object-cover grayscale contrast-[1.05] transition-[filter,transform] duration-500 hover:grayscale-0 hover:scale-[0.98]"
                        style={{ display: "block" }}
                      />
                    </div>
                    {showCaptions && (
                      <div
                        className="mt-2 flex items-center justify-between gap-2 rounded-full border-[2.5px] border-black px-2.5 py-1 shadow-[2px_2px_0_#000]"
                        style={{ background: "#fff" }}
                      >
                        <span
                          className="truncate text-[10px] font-extrabold uppercase tracking-wide sm:text-[11px]"
                          style={{ color: C.navy, fontFamily: "Space Grotesk, sans-serif" }}
                        >
                          {s.name}
                        </span>
                        <span
                          className="shrink-0 rounded-full border-2 border-black px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide"
                          style={{
                            background: awningColor,
                            color: awningColor === C.yellow || awningColor === C.lime ? C.navy : "#fff",
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          {s.role}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* bottom fade — cuma untuk sea variant, sand udah nyambung ke footer */}
      {!isSand && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{ background: `linear-gradient(180deg, transparent 0%, ${C.sand} 100%)`, opacity: 0.9 }}
        />
      )}
    </section>
  );
}

export default ScrollPortraitWall;
