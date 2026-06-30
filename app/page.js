"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import DataGridHero from "@/components/ui/data-grid-hero";
import AnimatedCounter from "@/components/ui/animated-counter";
import TiltCard from "@/components/ui/tilt-card";
import MagneticButton from "@/components/ui/magnetic-button";

/* ── Scroll reveal ─────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("revealed")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Tokens ─────────────────────────────────────────────────────────── */
const C = {
  sand: "#FDF5E4",
  lime: "#B5D948",
  yellow: "#FED245",
  coral: "#EB3C6B",
  orange: "#F6890C",
  blue: "#31AECE",
  navy: "#082E4B",
  white: "#FFFFFF",
  ink: "#0F172A",
  muted: "#5A6A7E",
  border: "#E2E8F0",
  bg: "#FEF8EC",
};

/* ── Global CSS ─────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #FEF8EC; overflow-x: hidden; }

  /* ── Vintage pattern — semua section sama ── */
  .bg-vintage {
    background-color: #FFFDF6;
    background-image:
      repeating-linear-gradient(0deg,  transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px),
      repeating-linear-gradient(90deg, transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px);
    background-size: 28px 28px;
  }
  .bg-vintage-sand {
    background-color: #FDF5E4;
    background-image:
      repeating-linear-gradient(0deg,  transparent 0, transparent 27px, rgba(8,46,75,.06) 27px, rgba(8,46,75,.06) 28px),
      repeating-linear-gradient(90deg, transparent 0, transparent 27px, rgba(8,46,75,.06) 27px, rgba(8,46,75,.06) 28px);
    background-size: 28px 28px;
  }

  .fd  { font-family: 'Fredoka', sans-serif; }
  .fb  { font-family: 'Plus Jakarta Sans', sans-serif; }

  :root { --max: 1140px; }
  .container { max-width: var(--max); margin: 0 auto; padding: 0 24px; }

  /* ── Groovy text — hanya hero title pakai stroke ── */
  .groovy-hero {
    -webkit-text-stroke: 4px #000;
    paint-order: stroke fill;
    letter-spacing: -.02em;
    line-height: .88;
  }

  /* ── Retro cards ── */
  .r-card {
    background: #fff;
    border: 3px solid #000;
    border-radius: 20px;
    box-shadow: 6px 6px 0 #000;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .r-card:hover { transform: translate(-2px,-3px); box-shadow: 8px 8px 0 #000; }
  .r-card-orange { border-color: ${C.orange}; box-shadow: 6px 6px 0 ${C.orange}; }
  .r-card-orange:hover { box-shadow: 8px 8px 0 ${C.orange}; }
  .r-card-coral  { border-color: ${C.coral};  box-shadow: 6px 6px 0 ${C.coral};  }
  .r-card-coral:hover  { box-shadow: 8px 8px 0 ${C.coral}; }
  .r-card-lime   { border-color: ${C.lime};   box-shadow: 6px 6px 0 ${C.lime};   }
  .r-card-blue   { border-color: ${C.blue};   box-shadow: 6px 6px 0 ${C.blue};   }

  /* ── Tag badge ── */
  .tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
    padding: 6px 15px; border-radius: 99px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    border: 2.5px solid #000; box-shadow: 3px 3px 0 #000;
    transform: rotate(-1.5deg);
    transition: transform .15s, box-shadow .15s;
  }
  .tag:hover { transform: rotate(0deg) scale(1.03); box-shadow: 4px 4px 0 #000; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-weight: 700; text-decoration: none; cursor: pointer; border: none;
    transition: transform .12s ease, box-shadow .12s ease;
    font-family: 'Fredoka', sans-serif;
  }
  .btn-press:hover  { transform: translate(2px,2px) !important; box-shadow: none !important; }
  .btn-press:active { transform: translate(3px,3px) !important; }

  /* ── Ticker ── */
  .ticker-wrap  { overflow: hidden; white-space: nowrap; }
  .ticker-track { display: inline-flex; animation: ticker 36s linear infinite; }
  .ticker-track:hover { animation-play-state: paused; }

  /* ── Grids ── */
  .acara-grid  { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; }
  .about-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: center; }
  .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; }
  .bento-grid  { display: grid; grid-template-columns: repeat(12,1fr); gap: 18px; align-items: stretch; }
  .bento-hero  { grid-column: span 7; }
  .bento-side  { grid-column: span 5; }
  .bento-half  { grid-column: span 6; }

  /* ── Nav ── */
  .nav-links  { display: flex; }
  .nav-burger { display: none; }
  @media (max-width: 800px) { .nav-links { display: none; } .nav-burger { display: flex; } }

  /* ── Timeline ── */
  .tl-zigzag { position: relative; max-width: 880px; margin: 0 auto; padding: 8px 0; }
  .tl-spine  { position: absolute; top: 0; bottom: 0; left: 50%; width: 3px; transform: translateX(-50%);
               background: linear-gradient(to bottom, ${C.coral}, ${C.blue} 50%, ${C.lime}); border-radius: 99px; opacity: .4; }
  .tl-row    { position: relative; display: flex; width: 100%; margin-bottom: 36px; }
  .tl-row:last-child { margin-bottom: 0; }
  .tl-card-wrap { width: 50%; box-sizing: border-box; }
  .tl-left  { justify-content: flex-start; }
  .tl-left  .tl-card-wrap { padding-right: 46px; }
  .tl-right { justify-content: flex-end; }
  .tl-right .tl-card-wrap { padding-left: 46px; }
  .tl-card { background: #fff; border: 3px solid #000; border-radius: 18px; padding: 18px 20px; box-shadow: 5px 5px 0 #000; transition: transform .15s ease, box-shadow .15s ease; }
  .tl-card:hover { transform: translate(-2px,-3px); box-shadow: 7px 7px 0 #000; }
  .tl-node { position: absolute; top: 12px; left: 50%; width: 40px; height: 40px; transform: translateX(-50%);
             border-radius: 50%; border: 3px solid #000; box-shadow: 3px 3px 0 #000;
             display: flex; align-items: center; justify-content: center; z-index: 2; }
  @media (max-width: 720px) {
    .tl-spine { left: 20px; }
    .tl-row   { margin-bottom: 24px; }
    .tl-card-wrap { width: 100%; }
    .tl-left .tl-card-wrap, .tl-right .tl-card-wrap { padding-right: 0; padding-left: 58px; }
    .tl-node { left: 20px; }
  }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .acara-grid  { grid-template-columns: repeat(3,1fr); }
    .about-grid  { grid-template-columns: 1fr; gap: 32px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .bento-grid  { grid-template-columns: 1fr 1fr; }
    .bento-hero, .bento-side, .bento-half { grid-column: span 1; }
  }
  @media (max-width: 600px) {
    .acara-grid  { grid-template-columns: repeat(2,1fr); gap: 10px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .container   { padding: 0 16px; }
    section      { padding-top: 52px !important; padding-bottom: 52px !important; }
    .bento-grid  { grid-template-columns: 1fr; gap: 14px; }
    .bento-hero, .bento-side, .bento-half { grid-column: span 1; }
  }
  @media (max-width: 400px) {
    .acara-grid { grid-template-columns: repeat(2,1fr); gap: 8px; }
  }

  /* ── Animations ── */
  @keyframes ticker  { to { transform: translateX(-50%); } }
  @keyframes floatA  { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
  @keyframes floatB  { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-8px) rotate(-3deg)} }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  @keyframes heroPop { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes revealUp{ from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }

  .a-float  { animation: floatA 6s ease-in-out infinite; }
  .a-floatB { animation: floatB 7s ease-in-out infinite; }
  .a-spin   { animation: spin 18s linear infinite; }
  .a-pulse  { animation: pulse 4s ease-in-out infinite; }
  .hero-anim { opacity: 0; animation: heroPop .6s cubic-bezier(.22,1,.36,1) forwards; }

  /* ── Scroll reveal ── */
  [data-reveal] { opacity: 0; }
  [data-reveal].revealed { animation: revealUp .6s cubic-bezier(.22,1,.36,1) forwards; animation-delay: var(--reveal-delay,0ms); }

  /* ── Mag button ── */
  .mag-btn { position: relative; overflow: hidden; }
  .mag-shimmer { position:absolute;inset:0;border-radius:inherit;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.28) 50%,transparent 70%);background-size:200% auto;opacity:0;transition:opacity .2s;animation:shimmer 1.8s linear infinite; }
  @keyframes shimmer { from{background-position:-200% center} to{background-position:200% center} }
  .mag-btn:hover .mag-shimmer { opacity: 1; }

  /* ── TiltCard ── */
  .tilt-glare-layer { position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(ellipse at var(--glare-x,50%) var(--glare-y,50%),rgba(255,255,255,.16) 0%,transparent 60%); }

  /* ── Hero mobile ── */
  .hero-wrap { padding: 60px 24px 68px; max-width: 1140px; margin: 0 auto; display: grid; grid-template-columns: 1.05fr 1fr; gap: 48px; align-items: center; }
  .hero-right { display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .hero-meta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 26px; }
  .hero-cta-row  { display: flex; gap: 12px; flex-wrap: wrap; }
  .hero-stats-mobile { display: none; }
  @media (max-width: 880px) {
    .hero-wrap { grid-template-columns: 1fr; gap: 0; text-align: center; padding: 48px 20px 52px; }
    .hero-right { display: none; }
    .hero-meta-row { justify-content: center; }
    .hero-cta-row  { justify-content: center; }
    .hero-stats-mobile { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 26px; }
  }
  @media (max-width: 420px) {
    .hero-cta-row { flex-direction: column; align-items: center; }
    .hero-cta-row a, .hero-cta-row button { width: 100%; justify-content: center; }
  }

  /* ── Motif strip ── */
  .motif-strip { width: 100%; display: block; }

  /* ── Daisy float pos ── */
  .daisy-tl { position: absolute; top: 18px;  left: 18px;  opacity: .82; pointer-events: none; }
  .daisy-tr { position: absolute; top: 14px;  right: 24px; opacity: .72; pointer-events: none; }
  .daisy-bl { position: absolute; bottom: 20px; left: 12%;  opacity: .55; pointer-events: none; }
  .daisy-br { position: absolute; bottom: 28px; right: 8%;  opacity: .48; pointer-events: none; }

  /* ── Sparkle ── */
  .sparkle { display: inline-block; font-size: 18px; line-height: 1; vertical-align: middle; margin: 0 6px; color: ${C.yellow}; -webkit-text-stroke: 1px #000; paint-order: stroke fill; }

  /* ── Ghost btn ── */
  .hero-ghost-btn:hover { background: rgba(255,255,255,.14) !important; border-color: rgba(255,255,255,.4) !important; }

  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
    [data-reveal], .hero-anim { opacity: 1 !important; transform: none !important; }
  }
`;

/* ── Data ─────────────────────────────────────────────────────────────── */
const ACARA = [
  { emoji: "🏆", label: "Lomba", sub: "27 Jul – 14 Agt", color: C.coral, tc: "#fff" },
  { emoji: "🎤", label: "Talkshow", sub: "13–14 Okt", color: C.blue, tc: "#fff" },
  { emoji: "🚀", label: "Expo", sub: "13–14 Okt", color: C.lime, tc: C.navy },
  { emoji: "🎮", label: "Fun Game", sub: "13–14 Okt", color: C.orange, tc: "#fff" },
  { emoji: "🛍️", label: "Bazzar", sub: "Coming Soon", color: C.yellow, tc: C.navy },
];

const LOMBA = [
  { emoji: "💻", n: "01", title: "Hackathon", for: "Mahasiswa", color: C.lime, tc: C.navy, desc: "Selesaikan tantangan teknologi nyata dalam waktu terbatas. Asah problem-solving dan kerja tim bersama peserta terbaik dari seluruh Indonesia." },
  { emoji: "🔌", n: "02", title: "Internet of Things", for: "Mahasiswa", color: C.blue, tc: "#fff", desc: "Kembangkan perangkat IoT berdampak nyata — dari sensor hingga dashboard — dan presentasikan di hadapan juri industri." },
  { emoji: "🎮", n: "03", title: "Game Making", for: "Mahasiswa", color: C.orange, tc: "#fff", desc: "Buat game digital dari nol: gameplay, visual, narasi. Platform untuk game developer muda menunjukkan karya terbaik." },
  { emoji: "📝", n: "04", title: "Karya Tulis Ilmiah", for: "Mahasiswa", color: C.coral, tc: "#fff", desc: "Riset dan tulis solusi inovatif untuk masalah teknologi aktual, dipresentasikan ke akademisi dan praktisi terkemuka." },
];

const TIMELINE = [
  { emoji: "📝", label: "Pendaftaran & Pelaksanaan Lomba", date: "27 Jul – 12 Okt 2026", note: "Hackathon, IoT, Game Making & KTI", color: C.coral },
  { emoji: "🏁", label: "Final Day (Online)", date: "12 Oktober 2026", note: "Babak final seluruh kategori lomba", color: C.orange },
  { emoji: "🎤", label: "Talkshow & Expo", date: "13–14 Oktober 2026", note: "Pendaftaran via Google Form", color: C.blue },
  { emoji: "🎮", label: "Fun Game", date: "13–14 Oktober 2026", note: "Pendaftaran via Google Form", color: C.lime },
  { emoji: "🛍️", label: "Tenant Bazzar", date: "Coming Soon", note: "Bazar produk, kuliner & merchandise", color: C.yellow },
];

/* ── MotifStrip ────────────────────────────────────────────────────────── */
function MotifStrip({ height = 22, flipped = false }) {
  const cols = [C.coral, C.yellow, C.lime, C.navy, C.orange, C.blue, C.coral, C.yellow, C.lime, C.navy, C.orange, C.blue];
  const n = 60;
  const pts = (i, h) => {
    const x = i * 2;
    return flipped
      ? `${x},0 ${x + 1},${h} ${x + 2},0`
      : `${x},${h} ${x + 1},0 ${x + 2},${h}`;
  };
  return (
    <svg className="motif-strip" height={height} viewBox={`0 0 ${n * 2} ${height}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <polygon key={i} points={pts(i, height)} fill={cols[i % cols.length]} />
      ))}
    </svg>
  );
}

/* ── Daisy ─────────────────────────────────────────────────────────────── */
function Daisy({ size = 64, petalColor = "#fff", centerColor = C.yellow }) {
  const n = 8;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx="30" cy="13" rx="7" ry="14"
          fill={petalColor} stroke="#000" strokeWidth="1.8"
          transform={`rotate(${(360 / n) * i}, 30, 30)`} />
      ))}
      <circle cx="30" cy="30" r="10" fill={centerColor} stroke="#000" strokeWidth="2.2" />
      <circle cx="27" cy="27" r="3" fill="rgba(255,255,255,.45)" />
    </svg>
  );
}

/* ── StarburstBig ──────────────────────────────────────────────────────── */
function StarburstBig({ size = 320, color = C.coral }) {
  const n = 16;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 49 : 37;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points={pts.join(" ")} fill={color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Starburst (small) ─────────────────────────────────────────────────── */
function Starburst({ size = 76, color = C.yellow, textColor = C.navy, rotate = -12, lines = [] }) {
  const n = 14;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 49 : 38;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  });
  return (
    <div style={{ width: size, height: size, position: "relative", transform: `rotate(${rotate}deg)`, filter: "drop-shadow(3px 3px 0 #000)" }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <polygon points={pts.join(" ")} fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <div className="fd" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: textColor, lineHeight: .9, textAlign: "center" }}>
        {lines.map((l, i) => <span key={i} style={{ fontWeight: 700, fontSize: i === 0 ? size * .26 : size * .14 }}>{l}</span>)}
      </div>
    </div>
  );
}

/* ── Section heading ────────────────────────────────────────────────────── */
function SectionHead({ tag, tagColor = C.coral, tagTextColor = "#fff", headline, sub, center = false, dark = false }) {
  return (
    <div style={{ marginBottom: 40, textAlign: center ? "center" : "left" }}>
      <span className="tag" style={{ background: tagColor, color: tagTextColor, marginBottom: 14, display: "inline-flex" }}>{tag}</span>
      <h2 className="fd" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 600, color: dark ? "#fff" : C.navy, lineHeight: 1.1, letterSpacing: "-.005em" }}>
        {headline}
      </h2>
      {sub && <p className="fb" style={{ color: dark ? "rgba(255,255,255,.5)" : C.muted, fontSize: 14, fontWeight: 500, marginTop: 10, lineHeight: 1.75, maxWidth: center ? 500 : 540, margin: center ? "10px auto 0" : "10px 0 0" }}>{sub}</p>}
    </div>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────────────── */
function Navbar({ open, setOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { l: "Tentang", h: "#about", emoji: "✦", color: C.yellow },
    { l: "Acara", h: "#acara", emoji: "🎤", color: C.blue },
    { l: "Lomba", h: "#lomba", emoji: "🏆", color: C.coral },
    { l: "Timeline", h: "#timeline", emoji: "📅", color: C.lime },
  ];

  return (
    <nav className="fb" style={{
      position: "sticky", top: 0, zIndex: 50,
      background: scrolled ? "rgba(255,255,255,.97)" : "rgba(255,255,255,.90)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: scrolled ? `2px solid #000` : "2px solid rgba(0,0,0,.08)",
      transition: "background .3s ease, box-shadow .3s ease, border-color .3s ease",
      boxShadow: scrolled ? "0 3px 0 #000" : "none",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
        <a href="#hero" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.sand, border: "2px solid #000", boxShadow: "2px 2px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <Image src="/itfest-logo.png" alt="IT FEST 6.0" width={28} height={28} style={{ objectFit: "contain" }} />
          </div>
          <div>
            <div className="fd" style={{ color: C.navy, fontSize: 17, fontWeight: 600, lineHeight: 1.1 }}>IT FEST 6.0</div>
            <div className="fb" style={{ color: C.muted, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700 }}>Universitas Paramadina</div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="nav-links" style={{ alignItems: "center", gap: 28 }}>
          {links.map(({ l, h }) => (
            <a key={h} href={h} className="fb" style={{ color: C.muted, fontSize: 13.5, fontWeight: 600, textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.navy}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>{l}</a>
          ))}
          <MagneticButton as="a" href="/events" strength={8} glow
            className="btn btn-press fd"
            style={{ background: C.coral, color: "#fff", fontSize: 13, padding: "9px 20px", borderRadius: 99, border: "2.5px solid #000", boxShadow: "4px 4px 0 #000" }}>
            Daftar Lomba
          </MagneticButton>
        </div>

        {/* Burger */}
        <button className="nav-burger" onClick={() => setOpen(v => !v)} aria-label={open ? "Tutup" : "Buka menu"}
          style={{ background: open ? C.navy : "transparent", border: `2px solid ${open ? C.navy : "#000"}`, borderRadius: 10, width: 40, height: 40, alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: open ? "none" : "2px 2px 0 #000", transition: "background .2s, box-shadow .2s", flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke={open ? "#fff" : C.navy} strokeWidth="2.2" strokeLinecap="round">
            {open ? <><line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" /></>
              : <><line x1="2" y1="5" x2="16" y2="5" /><line x1="2" y1="9.5" x2="16" y2="9.5" /><line x1="2" y1="14" x2="16" y2="14" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fb" style={{ background: "#fff", borderTop: "2px solid #000" }}>
          {/* Motif strip accent */}
          <MotifStrip height={16} />

          <div style={{ padding: "8px 20px 0" }}>
            {links.map(({ l, h, emoji, color }) => (
              <a key={h} href={h} onClick={() => setOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", textDecoration: "none", borderBottom: `1.5px solid ${C.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>{emoji}</div>
                <span className="fd" style={{ color: C.navy, fontWeight: 700, fontSize: 17 }}>{l}</span>
                <span style={{ marginLeft: "auto", color: C.muted, fontSize: 14, fontWeight: 700 }}>→</span>
              </a>
            ))}
          </div>

          <div style={{ padding: "16px 20px 20px" }}>
            <a href="/events" onClick={() => setOpen(false)} className="fd btn"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.coral, color: "#fff", fontWeight: 700, padding: "15px", borderRadius: 14, textDecoration: "none", fontSize: 16, border: "2.5px solid #000", boxShadow: "4px 4px 0 #000" }}>
              🏆 Daftar Lomba Sekarang
            </a>
            <p className="fb" style={{ textAlign: "center", color: C.muted, fontSize: 11.5, marginTop: 10, fontWeight: 500 }}>
              📅 27 Juli – 14 Oktober 2026 · Universitas Paramadina
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="hero" style={{ position: "relative" }}>
      <DataGridHero rows={34} cols={70} spacing={3} duration={4} color={C.yellow} maskColor={C.coral}
        animationType="pulse" pulseEffect mouseGlow opacityMin={0.03} opacityMax={0.8}
        background={C.navy} textMask="IT FEST">

        {/* Daisy decorations */}
        <div className="daisy-tl a-floatB"><Daisy size={80} petalColor="#fff" centerColor={C.yellow} /></div>
        <div className="daisy-tr a-float" style={{ transform: "rotate(25deg)" }}><Daisy size={60} petalColor={C.lime} centerColor={C.yellow} /></div>
        <div className="daisy-bl a-floatB" style={{ transform: "rotate(-15deg)" }}><Daisy size={52} petalColor={C.yellow} centerColor={C.orange} /></div>
        <div className="daisy-br a-float"><Daisy size={44} petalColor="#fff" centerColor={C.lime} /></div>

        <div className="hero-wrap" style={{ position: "relative" }}>
          <style>{`
            @media(max-width:880px){
              .hero-starburst-wrap { width:220px!important; height:220px!important; }
              .hero-starburst-wrap svg { width:220px!important; height:220px!important; }
              .hero-title-wrap h1 { font-size:clamp(3rem,14vw,5rem)!important; }
            }
          `}</style>

          {/* Left — text */}
          <div>
            {/* Groovy title with starburst */}
            <div className="hero-anim" style={{ position: "relative", display: "inline-block", marginBottom: 18, animationDelay: "40ms" }}>
              <div className="a-spin" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 0, opacity: .95 }} aria-hidden="true">
                <StarburstBig size={300} color={C.coral} />
              </div>
              <div className="hero-title-wrap" style={{ position: "relative", zIndex: 1, padding: "4px 16px" }}>
                <h1 className="fd groovy-hero" style={{ fontSize: "clamp(3.2rem,10vw,7rem)", fontWeight: 700, color: C.yellow, lineHeight: .88, letterSpacing: "-.02em" }}>
                  IT FEST<br />6.0
                </h1>
              </div>
            </div>

            {/* Theme badge */}
            <div className="hero-anim r-card r-card-orange" style={{ display: "inline-block", padding: "12px 20px", marginBottom: 22, animationDelay: "160ms" }}>
              <div className="fb" style={{ color: C.navy, fontWeight: 700, fontSize: "clamp(.8rem,1.5vw,.95rem)", lineHeight: 1.55 }}>
                <span className="sparkle">✦</span>
                Human-Centered AI: Transforming the World with Integrity
                <span className="sparkle">✦</span>
              </div>
            </div>

            {/* Meta pills */}
            <div className="hero-meta-row hero-anim" style={{ animationDelay: "260ms" }}>
              {[{ e: "📅", t: "27 Jul – 14 Okt 2026", bg: C.yellow, c: C.navy },
              { e: "📍", t: "Universitas Paramadina", bg: C.lime, c: C.navy }].map((m, i) => (
                <span key={i} className="fb" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: m.bg, color: m.c, fontSize: 12, fontWeight: 800, padding: "7px 14px", borderRadius: 99, border: "2px solid #000", boxShadow: "2px 2px 0 #000", letterSpacing: ".02em" }}>
                  {m.e} {m.t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="hero-cta-row hero-anim" style={{ animationDelay: "360ms" }}>
              <MagneticButton as="a" href="/events" strength={10} glow
                className="btn btn-press fd"
                style={{ background: C.coral, color: "#fff", fontSize: 15, fontWeight: 700, padding: "13px 28px", borderRadius: 99, border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
                🏆 Daftar Sekarang
              </MagneticButton>
              <a href="#acara" className="btn fd hero-ghost-btn"
                style={{ background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 15, fontWeight: 700, padding: "13px 28px", borderRadius: 99, border: "2px solid rgba(255,255,255,.4)", textDecoration: "none", transition: "background .2s, border-color .2s" }}>
                Lihat Acara ↓
              </a>
            </div>

            {/* Mobile-only stats */}
            <div className="hero-stats-mobile hero-anim" style={{ animationDelay: "460ms" }}>
              {[{ n: 4, suf: "", l: "Kategori Lomba", c: C.coral },
              { n: 5, suf: "", l: "Jenis Acara", c: C.lime },
              { n: 2, suf: "hr", l: "Festival Day", c: C.blue }].map((s, i) => (
                <div key={i} style={{ background: s.c, borderRadius: 12, padding: "12px 8px", textAlign: "center", border: "2.5px solid #000", boxShadow: "3px 3px 0 #000" }}>
                  <div className="fd" style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>
                    <AnimatedCounter value={s.n} suffix={s.suf} duration={1400} />
                  </div>
                  <div className="fb" style={{ color: "rgba(255,255,255,.82)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — logo card + stats (desktop) */}
          <div className="hero-right hero-anim" style={{ animationDelay: "300ms" }}>
            <div style={{ position: "relative" }}>
              <div className="a-floatB" style={{ position: "absolute", top: -22, right: -22, zIndex: 3 }}>
                <Starburst color={C.yellow} textColor={C.navy} rotate={14} size={80} lines={["6.0", "EDITION"]} />
              </div>
              <TiltCard maxTilt={10} glare scale={1.03} style={{ borderRadius: 22, boxShadow: "8px 8px 0 #000", border: "3px solid #000" }}>
                <div className="a-pulse" style={{ borderRadius: 20, background: "#fff", padding: "28px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <Image src="/itfest-logo.png" alt="IT FEST 6.0" width={130} height={130} priority style={{ objectFit: "contain" }} />
                  <div style={{ textAlign: "center" }}>
                    <div className="fd" style={{ color: C.navy, fontSize: 21, fontWeight: 700, lineHeight: 1.1 }}>IT FEST 6.0</div>
                    <div className="fb" style={{ color: C.coral, fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", marginTop: 4 }}>Festival Teknologi 2026</div>
                  </div>
                </div>
              </TiltCard>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, width: "100%", maxWidth: 296 }}>
              {[{ n: 4, suf: "", l: "Kategori\nLomba", c: C.coral },
              { n: 5, suf: "", l: "Jenis\nAcara", c: C.lime },
              { n: 2, suf: "hr", l: "Festival\nDay", c: C.blue }].map((s, i) => (
                <div key={i} style={{ background: s.c, borderRadius: 12, padding: "11px 8px", textAlign: "center", border: "2.5px solid #000", boxShadow: "3px 3px 0 #000" }}>
                  <div className="fd" style={{ color: "#fff", fontSize: 21, fontWeight: 700, lineHeight: 1 }}>
                    <AnimatedCounter value={s.n} suffix={s.suf} duration={1400} />
                  </div>
                  <div className="fb" style={{ color: "rgba(255,255,255,.8)", fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", marginTop: 4, lineHeight: 1.3, whiteSpace: "pre-line" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DataGridHero>

      {/* Motif border bottom */}
      <MotifStrip height={24} />
    </section>
  );
}

/* ── Ticker ────────────────────────────────────────────────────────────── */
function Ticker() {
  const items = ["🏄 IT FEST 6.0", "💡 Human-Centered AI", "🎓 Universitas Paramadina", "🏆 Hackathon · IoT · Game · KTI", "📅 27 Juli – 14 Oktober 2026", "🌴 Jakarta × Tech × Festival"];
  const d = [...items, ...items];
  return (
    <div className="ticker-wrap fb" style={{ background: C.coral, borderBottom: "3px solid #000", padding: "11px 0" }}>
      <div className="ticker-track">
        {d.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 24px", color: "#fff", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: ".03em" }}>
            {t}<span style={{ opacity: .35, marginLeft: 6, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── About ─────────────────────────────────────────────────────────────── */
function About() {
  return (
    <section id="about" className="bg-vintage" style={{ padding: "72px 0", borderBottom: "3px solid #000", position: "relative" }}>
      <div className="container">
        <div className="about-grid">
          <div>
            <SectionHead
              tag="Tentang Acara"
              tagColor={C.yellow}
              tagTextColor={C.navy}
              headline={<>Apa itu <span style={{ color: C.coral }}>IT FEST 6.0?</span></>}
            />
            <p className="fb" style={{ color: "#475569", fontSize: 15, lineHeight: 1.85, fontWeight: 500, marginBottom: 16 }}>
              IT Fest 6.0 adalah festival teknologi yang diselenggarakan oleh{" "}
              <strong style={{ color: C.navy }}>Himpunan Mahasiswa Teknik Informatika dan Prodi Teknik Informatika Universitas Paramadina</strong>{" "}
              dengan tema{" "}
              <strong style={{ color: C.coral }}>"Human-Centered AI: Transforming the World with Integrity"</strong>.
            </p>
            <p className="fb" style={{ color: C.muted, fontSize: 14, lineHeight: 1.85, fontWeight: 500 }}>
              Perlombaan IT FEST 6.0 <strong style={{ color: C.navy }}>khusus untuk mahasiswa</strong> — daftar via website ini. Talkshow, Expo, dan Fun Game terbuka untuk umum via Google Form.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { emoji: "🎓", label: "Lomba — Khusus Mahasiswa", color: C.blue, cardColor: "r-card-blue", note: "Daftar via website ini", items: ["Hackathon", "Internet of Things", "Game Making", "Karya Tulis Ilmiah"] },
              { emoji: "🎤", label: "Talkshow, Expo & Fun Game", color: C.lime, cardColor: "r-card-lime", note: "Daftar via Google Form", items: ["Terbuka untuk umum & SMA/SMK"] },
            ].map((a, i) => (
              <div key={i} className={`r-card ${a.cardColor}`} style={{ padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>
                    {a.emoji}
                  </div>
                  <span className="fd" style={{ color: C.navy, fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{a.label}</span>
                </div>
                <div className="fb" style={{ fontSize: 11, fontWeight: 800, color: a.color === C.lime ? "#4a6010" : a.color, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>{a.note}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {a.items.map((item, j) => (
                    <span key={j} className="fb" style={{ fontSize: 11.5, fontWeight: 700, padding: "5px 13px", borderRadius: 99, background: a.color, color: a.color === C.lime || a.color === C.yellow ? C.navy : "#fff", border: "1.5px solid #000", boxShadow: "2px 2px 0 #000" }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Acara ─────────────────────────────────────────────────────────────── */
function Acara() {
  return (
    <section id="acara" className="bg-vintage-sand" style={{ padding: "72px 0", borderBottom: "3px solid #000" }}>
      <div className="container">
        <SectionHead
          tag="Program Acara"
          tagColor={C.blue}
          tagTextColor="#fff"
          headline={<>Rangkaian <span style={{ color: C.blue }}>IT FEST 6.0</span></>}
          sub="Lima jenis kegiatan yang menjadi highlight festival teknologi terbesar Universitas Paramadina."
        />
        <div className="acara-grid">
          {ACARA.map((a, i) => (
            <div key={i} data-reveal style={{ "--reveal-delay": `${i * 70}ms` }}>
              <div className="r-card" style={{ padding: "24px 12px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div aria-hidden="true" className="fd" style={{ position: "absolute", bottom: -16, right: -2, fontSize: 70, fontWeight: 500, color: `${a.color}1a`, lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>{i + 1}</div>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 13, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 12px", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
                    {a.emoji}
                  </div>
                  <div className="fd" style={{ color: C.navy, fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.2 }}>{a.label}</div>
                  <div className="fb" style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 99, display: "inline-block", background: a.color, color: a.tc, border: "1.5px solid #000", boxShadow: "2px 2px 0 #000", letterSpacing: ".04em", textTransform: "uppercase" }}>
                    {a.sub}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Lomba ─────────────────────────────────────────────────────────────── */
function LombaCard({ item, className }) {
  return (
    <div className={`r-card ${className}`} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ background: item.color, padding: "28px 24px 22px", position: "relative", overflow: "hidden", borderRadius: "17px 17px 0 0", borderBottom: "3px solid #000" }}>
        <div aria-hidden="true" className="fd" style={{ position: "absolute", bottom: -24, right: -4, fontSize: 100, fontWeight: 500, color: "rgba(0,0,0,.07)", lineHeight: 1, userSelect: "none" }}>{item.n}</div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{item.emoji}</div>
          <h3 className="fd" style={{ color: item.tc, fontSize: 22, fontWeight: 600, lineHeight: 1.15, marginBottom: 10 }}>{item.title}</h3>
          <span className="fb" style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 12px", borderRadius: 99, display: "inline-block", background: "rgba(0,0,0,.18)", color: item.tc, letterSpacing: ".06em", textTransform: "uppercase" }}>{item.for}</span>
        </div>
      </div>
      <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <p className="fb" style={{ color: C.muted, fontSize: 13, lineHeight: 1.8, fontWeight: 400, marginBottom: 18 }}>{item.desc}</p>
        <a href="/events" className="btn btn-press fd"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: item.color, color: item.tc, fontSize: 13, fontWeight: 600, padding: "12px 18px", borderRadius: 12, textDecoration: "none", letterSpacing: ".05em", textTransform: "uppercase", border: "2.5px solid #000", boxShadow: "4px 4px 0 #000" }}>
          Daftar Sekarang <span style={{ fontSize: 15 }}>→</span>
        </a>
      </div>
    </div>
  );
}

function Lomba() {
  const borderClass = ["r-card-lime", "r-card-blue", "r-card-orange", "r-card-coral"];
  return (
    <section id="lomba" className="bg-vintage" style={{ padding: "80px 0", borderBottom: "3px solid #000" }}>
      <div className="container">
        <SectionHead
          tag="Daftar Lomba"
          tagColor={C.coral}
          tagTextColor="#fff"
          headline={<>Pilih <span style={{ color: C.coral }}>Kategori Lombamu</span></>}
          sub={<>Pendaftaran dibuka <strong style={{ color: C.navy }}>27 Juli – 14 Agustus 2026</strong> untuk semua kategori.</>}
        />
        <div className="bento-grid">
          <div className="bento-hero" data-reveal style={{ "--reveal-delay": "0ms" }}>
            <LombaCard item={LOMBA[0]} className={borderClass[0]} />
          </div>
          <div className="bento-side" data-reveal style={{ "--reveal-delay": "90ms" }}>
            <LombaCard item={LOMBA[1]} className={borderClass[1]} />
          </div>
          <div className="bento-half" data-reveal style={{ "--reveal-delay": "160ms" }}>
            <LombaCard item={LOMBA[2]} className={borderClass[2]} />
          </div>
          <div className="bento-half" data-reveal style={{ "--reveal-delay": "230ms" }}>
            <LombaCard item={LOMBA[3]} className={borderClass[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Bazzar ─────────────────────────────────────────────────────────────── */
function Bazzar() {
  return (
    <section style={{ background: C.navy, padding: "68px 0", borderBottom: "3px solid #000", position: "relative", overflow: "hidden" }}>
      <MotifStrip height={20} />
      {/* Decorative daisies */}
      <div style={{ position: "absolute", top: 30, right: 40, opacity: .3 }} aria-hidden="true">
        <Daisy size={100} petalColor={C.lime} centerColor={C.yellow} />
      </div>
      <div style={{ position: "absolute", bottom: 20, left: 30, opacity: .2 }} aria-hidden="true">
        <Daisy size={72} petalColor={C.yellow} centerColor={C.coral} />
      </div>
      <div className="container" style={{ position: "relative", paddingTop: 28 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
            <div className="a-floatB" style={{ position: "absolute", top: -24, right: -18, zIndex: 2 }}>
              <Starburst color={C.yellow} textColor={C.navy} rotate={16} size={76} lines={["SOON", "OPEN"]} />
            </div>
            <div className="r-card r-card-orange" style={{ padding: "36px 40px 32px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", border: "2.5px solid #000", boxShadow: "3px 3px 0 #000" }}>🛍️</div>
              <h3 className="fd" style={{ color: C.navy, fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Tenant Bazzar</h3>
              <p className="fb" style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.8, marginBottom: 22 }}>
                Jadilah bagian dari Bazzar IT FEST 6.0! Informasi ketentuan dan biaya tenant akan segera diumumkan.
              </p>
              <span className="fd btn" style={{ padding: "10px 24px", borderRadius: 99, background: C.orange, color: "#fff", fontSize: 13, letterSpacing: ".07em", textTransform: "uppercase", border: "2.5px solid #000", boxShadow: "4px 4px 0 #000", cursor: "default" }}>
                ⏳ Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Timeline ────────────────────────────────────────────────────────────── */
function Timeline() {
  const tc = (bg) => (bg === C.yellow || bg === C.lime ? C.navy : "#fff");
  return (
    <section id="timeline" className="bg-vintage-sand" style={{ padding: "80px 0", borderBottom: "3px solid #000" }}>
      <div className="container">
        <SectionHead center
          tag="Jadwal Kegiatan"
          tagColor={C.lime}
          tagTextColor={C.navy}
          headline={<>Timeline <span style={{ color: C.lime }}>IT FEST 6.0</span></>}
          sub="Rangkaian kegiatan lengkap dari pendaftaran hingga hari puncak festival."
        />
        <div className="tl-zigzag">
          <span className="tl-spine" aria-hidden="true" />
          {TIMELINE.map((item, i) => {
            const side = i % 2 === 0 ? "left" : "right";
            return (
              <div key={i} className={`tl-row tl-${side}`} data-reveal style={{ "--reveal-delay": `${i * 80}ms` }}>
                <div className="tl-card-wrap">
                  <div className="tl-card" style={{ borderTop: `4px solid ${item.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 9 }}>
                      <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, background: item.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>
                        {item.emoji}
                      </span>
                      <h3 className="fd" style={{ color: C.navy, fontSize: 15.5, fontWeight: 600, lineHeight: 1.2 }}>{item.label}</h3>
                    </div>
                    <p className="fb" style={{ color: C.muted, fontSize: 12.5, fontWeight: 400, lineHeight: 1.65, marginBottom: 12 }}>{item.note}</p>
                    <span className="fb" style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, display: "inline-block", background: item.color, color: tc(item.color), border: "1.5px solid #000", boxShadow: "2px 2px 0 #000", letterSpacing: ".03em" }}>
                      📅 {item.date}
                    </span>
                  </div>
                </div>
                <span className="tl-node" style={{ background: item.color }} aria-hidden="true">
                  <span className="fd" style={{ color: tc(item.color), fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{i + 1}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: C.navy }}>
      <MotifStrip height={22} />

      {/* Logo ticker */}
      <div className="ticker-wrap" style={{ background: C.yellow, borderTop: "3px solid #000", borderBottom: "3px solid #000", padding: "6px 0" }}>
        <div className="ticker-track" style={{ animationDuration: "28s" }}>
          {[0, 1].map(g => (
            <div key={g} style={{ display: "inline-flex" }} aria-hidden={g === 1}>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "0 20px" }}>
                  <Image src="/itfest-logo.png" alt="" width={64} height={64} style={{ objectFit: "contain" }} aria-hidden="true" />
                  <span style={{ color: C.navy, opacity: .25, fontSize: 20, fontWeight: 900 }}>•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Daisy decorations */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 24, right: 48, opacity: .18 }} aria-hidden="true">
          <Daisy size={88} petalColor={C.lime} centerColor={C.yellow} />
        </div>
        <div style={{ position: "absolute", bottom: 40, left: 32, opacity: .14 }} aria-hidden="true">
          <Daisy size={64} petalColor={C.yellow} centerColor={C.coral} />
        </div>

        <div className="container" style={{ padding: "52px 24px 48px", position: "relative" }}>
          <div className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ borderRadius: 12, background: "rgba(255,255,255,.1)", padding: 5, border: "2px solid rgba(255,255,255,.18)" }}>
                  <Image src="/itfest-logo.png" alt="IT FEST 6.0" width={40} height={40} style={{ objectFit: "contain" }} />
                </div>
                <div>
                  <div className="fd" style={{ color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>IT FEST 6.0</div>
                  <div className="fb" style={{ color: C.lime, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", marginTop: 2 }}>Festival Teknologi 2026</div>
                </div>
              </div>
              <p className="fb" style={{ color: "rgba(255,255,255,.4)", fontSize: 13.5, lineHeight: 1.85, maxWidth: 250, fontWeight: 500 }}>
                Diselenggarakan oleh <strong style={{ color: "rgba(255,255,255,.7)" }}>Himpunan Mahasiswa Teknik Informatika</strong> dan <strong style={{ color: "rgba(255,255,255,.7)" }}>Prodi Teknik Informatika</strong> Universitas Paramadina.
              </p>
            </div>

            <div>
              <div className="fd" style={{ color: "rgba(255,255,255,.3)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Kontak Panitia</div>
              {[{ e: "📍", t: "Paramadina University, Cipayung, Jakarta" }, { e: "📞", t: "Ayu — 0819-9285-5778" }, { e: "📧", t: "itfestparamadina@gmail.com" }].map((item, i) => (
                <div key={i} className="fb" style={{ display: "flex", gap: 9, marginBottom: 12, color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 500, alignItems: "flex-start", lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0 }}>{item.e}</span><span>{item.t}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="fd" style={{ color: "rgba(255,255,255,.3)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Ikuti IT FEST</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Instagram", href: "https://www.instagram.com/itfest.paramadina", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" /></svg> },
                  { label: "TikTok", href: "https://www.tiktok.com/@itfestparamadina", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg> },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.5)", border: "1.5px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s, color .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MotifStrip height={18} flipped />
      <div className="fb" style={{ textAlign: "center", padding: "14px 24px", color: "rgba(255,255,255,.2)", fontSize: 11, fontWeight: 600, letterSpacing: ".06em" }}>
        © 2026 IT FEST 6.0 · Himpunan Mahasiswa Teknik Informatika &amp; Prodi Teknik Informatika Universitas Paramadina
      </div>
    </footer>
  );
}

/* ── Root ─────────────────────────────────────────────────────────────── */
export default function Page() {
  const [open, setOpen] = useState(false);
  useScrollReveal();
  return (
    <>
      <style>{CSS}</style>
      <div className="fb" style={{ background: C.bg }}>
        <Navbar open={open} setOpen={setOpen} />
        <main>
          <Hero />
          <Ticker />
          <About />
          <Acara />
          <Lomba />
          <Bazzar />
          <Timeline />
        </main>
        <Footer />
      </div>
    </>
  );
}
