"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DataGridHero from "@/components/ui/data-grid-hero";

/* Reveal elements with [data-reveal] as they scroll into view */
function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Tokens ───────────────────────────────────────────────────────────── */
const C = {
  sand:   "#FDF5E4",
  lime:   "#B5D948",
  yellow: "#FED245",
  coral:  "#EB3C6B",
  orange: "#F6890C",
  blue:   "#31AECE",
  navy:   "#082E4B",
  ink:    "#0F172A",
  muted:  "#64748B",
  border: "#E2E8F0",
  bg:     "#FAFAFA",
  white:  "#FFFFFF",
};

/* ── Global CSS ───────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Pacifico&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body { background: ${C.bg}; }

  .fd { font-family: 'Fredoka', sans-serif; }
  .fp { font-family: 'Pacifico', cursive; }
  .fb { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── Spacing ── 8-point grid */
  :root {
    --sp-1: 8px;  --sp-2: 16px; --sp-3: 24px;
    --sp-4: 32px; --sp-6: 48px; --sp-8: 64px; --sp-12: 96px;
    --radius-sm: 10px; --radius: 16px; --radius-lg: 24px; --radius-xl: 32px;
    --max: 1160px;
  }

  .container { max-width: var(--max); margin: 0 auto; padding: 0 24px; }

  /* ── Shadows ── */
  .sh-sm  { box-shadow: 0 1px 3px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05); }
  .sh     { box-shadow: 0 2px 8px rgba(0,0,0,.06), 0 8px 28px rgba(0,0,0,.08); }
  .sh-lg  { box-shadow: 0 4px 16px rgba(0,0,0,.08), 0 16px 48px rgba(0,0,0,.10); }

  /* Brutalist accent shadows — selective use */
  .bs-hard { box-shadow: 5px 5px 0 #000; }
  .bb-hard { border: 3px solid #000; }

  /* ── Button base ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-weight: 700; text-decoration: none; cursor: pointer; border: none;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .btn:hover { transform: translateY(-1px); }
  .btn-press:hover { transform: translate(2px, 2px) !important; box-shadow: none !important; }
  .btn-press:active { transform: translate(3px,3px) !important; }

  /* ── Cards ── */
  .card {
    background: ${C.white};
    border: 1.5px solid ${C.border};
    border-radius: var(--radius);
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,.1); }

  .card-hard {
    background: ${C.white};
    border: 3px solid #000;
    border-radius: var(--radius);
    box-shadow: 5px 5px 0 #000;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .card-hard:hover { transform: translate(-2px,-3px); box-shadow: 7px 7px 0 #000; }

  /* ── Ticker ── */
  .ticker-wrap  { overflow: hidden; white-space: nowrap; }
  .ticker-track { display: inline-flex; animation: ticker 36s linear infinite; }
  .ticker-track:hover { animation-play-state: paused; }

  /* ── Dot bg (events page parity) ── */
  .dot-bg {
    background-image: radial-gradient(circle, rgba(0,0,0,.06) 1px, transparent 1px);
    background-size: 28px 28px;
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
  }

  /* ── Grids ── */
  .hero-grid    { display: grid; grid-template-columns: 1.15fr 1fr; min-height: 520px; }
  .acara-grid   { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
  .lomba-grid   { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .about-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
  .footer-grid  { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; }
  .stats-grid   { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .hero-grid   { grid-template-columns: 1fr; }
    .hero-right  { border-left: 0 !important; border-top: 2px solid rgba(255,255,255,.12) !important; }
    .acara-grid  { grid-template-columns: repeat(3,1fr); }
    .lomba-grid  { grid-template-columns: 1fr; }
    .about-grid  { grid-template-columns: 1fr; gap: 32px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .acara-grid  { grid-template-columns: repeat(2,1fr); gap: 10px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .stats-grid  { grid-template-columns: repeat(3,1fr); }
    .container   { padding: 0 16px; }
  }
  @media (max-width: 400px) {
    .acara-grid  { grid-template-columns: repeat(2,1fr); }
  }

  /* ── Nav responsive ── */
  .nav-links  { display: flex; }
  .nav-burger { display: none; }
  @media (max-width: 800px) {
    .nav-links  { display: none; }
    .nav-burger { display: block; }
  }

  /* ── Animations ── */
  @keyframes ticker  { to { transform: translateX(-50%); } }
  @keyframes floatA  { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
  @keyframes floatB  { 0%,100%{transform:translateY(0) rotate(3deg)}  50%{transform:translateY(-8px) rotate(-3deg)} }
  @keyframes heroIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes spin    { to{transform:rotate(360deg)} }

  .a-float   { animation: floatA 6s ease-in-out infinite; }
  .a-floatB  { animation: floatB 8s ease-in-out infinite; }
  .a-heroIn  { animation: heroIn .7s cubic-bezier(.22,1,.36,1) both; }
  .a-up      { animation: slideUp .5s cubic-bezier(.22,1,.36,1) both; }
  .a-pulse   { animation: pulse 4s ease-in-out infinite; }

  /* ── Hero entrance (staggered) ── */
  @keyframes heroPop { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  .hero-anim { opacity: 0; animation: heroPop .65s cubic-bezier(.22,1,.36,1) forwards; }

  /* ── Scroll reveal (uses animation so it never fights inline hover transitions) ── */
  @keyframes revealUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
  [data-reveal] { opacity: 0; }
  [data-reveal].revealed {
    opacity: 1;
    animation: revealUp .6s cubic-bezier(.22,1,.36,1) backwards;
    animation-delay: var(--reveal-delay, 0ms);
  }

  /* ── Floating shapes (ambient) ── */
  @keyframes drift { 0%{transform:translate(0,0) rotate(0)} 33%{transform:translate(14px,-18px) rotate(8deg)} 66%{transform:translate(-10px,-8px) rotate(-6deg)} 100%{transform:translate(0,0) rotate(0)} }
  .a-drift { animation: drift 14s ease-in-out infinite; }

  /* ── Tag / Label (neobrutalist sticker) ── */
  .tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 800; letter-spacing: .12em;
    text-transform: uppercase; padding: 6px 15px;
    border-radius: 99px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    border: 2.5px solid #000;
    box-shadow: 3px 3px 0 #000;
    transform: rotate(-1.8deg);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .tag:hover { transform: rotate(0deg) scale(1.03); box-shadow: 4px 4px 0 #000; }

  /* ── Divider ── */
  .section-divider { height: 1px; background: ${C.border}; }

  /* ── Timeline (alternating zig-zag) ── */
  .tl-zigzag { position: relative; max-width: 880px; margin: 0 auto; padding: 8px 0; }

  /* center vertical spine */
  .tl-spine {
    position: absolute; top: 0; bottom: 0; left: 50%;
    width: 4px; transform: translateX(-50%);
    background: repeating-linear-gradient(${C.navy} 0 8px, transparent 8px 16px);
    border-radius: 99px;
  }

  .tl-row { position: relative; display: flex; width: 100%; margin-bottom: 36px; }
  .tl-row:last-child { margin-bottom: 0; }

  /* card sits on one half */
  .tl-card-wrap { width: 50%; box-sizing: border-box; }
  .tl-left  { justify-content: flex-start; }
  .tl-left  .tl-card-wrap { padding-right: 46px; }
  .tl-right { justify-content: flex-end; }
  .tl-right .tl-card-wrap { padding-left: 46px; }

  .tl-card {
    background: ${C.white};
    border: 2.5px solid #000;
    border-radius: 16px;
    padding: 20px 22px;
    box-shadow: 5px 5px 0 #000;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .tl-card:hover { transform: translate(-2px,-3px); box-shadow: 7px 7px 0 #000; }

  /* numbered node centered on spine */
  .tl-node {
    position: absolute; top: 14px; left: 50%;
    width: 38px; height: 38px; transform: translateX(-50%);
    border-radius: 50%; border: 3px solid #000;
    box-shadow: 3px 3px 0 #000;
    display: flex; align-items: center; justify-content: center;
    z-index: 2;
  }
  .tl-node-num { color: #fff; font-size: 16px; font-weight: 700; text-shadow: 1px 1px 0 rgba(0,0,0,.35); line-height: 1; }

  /* mobile → single column, spine on the left */
  @media (max-width: 720px) {
    .tl-zigzag { max-width: 520px; }
    .tl-spine  { left: 19px; }
    .tl-row    { margin-bottom: 24px; }
    .tl-card-wrap { width: 100%; }
    .tl-left  .tl-card-wrap,
    .tl-right .tl-card-wrap { padding-right: 0; padding-left: 58px; }
    .tl-node   { left: 19px; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
    [data-reveal], .hero-anim { opacity: 1 !important; transform: none !important; }
  }
`;

/* ── Data ─────────────────────────────────────────────────────────────── */
const ACARA = [
  { emoji:"🏆", label:"Lomba",    sub:"27 Jul – 14 Agt", color:C.coral,  tc:"#fff" },
  { emoji:"🎤", label:"Talkshow", sub:"13–14 Okt",        color:C.blue,   tc:"#fff" },
  { emoji:"🚀", label:"Expo",     sub:"13–14 Okt",        color:C.lime,   tc:C.navy },
  { emoji:"🎮", label:"Fun Game", sub:"13–14 Okt",        color:C.orange, tc:"#fff" },
  { emoji:"🛍️", label:"Bazzar",  sub:"13–14 Okt",        color:C.yellow, tc:C.navy },
];

const LOMBA = [
  { emoji:"💻", n:"01", title:"Hackathon",
    for:"Mahasiswa", color:C.lime, tc:C.navy,
    desc:"Selesaikan tantangan teknologi nyata dalam waktu terbatas. Asah kemampuan problem-solving dan kerja tim bersama peserta terbaik." },
  { emoji:"🔌", n:"02", title:"Internet of Things",
    for:"Mhs & SMA/SMK", color:C.blue, tc:"#fff",
    desc:"Kembangkan perangkat IoT berdampak nyata — dari sensor hingga dashboard — dan presentasikan di hadapan juri industri." },
  { emoji:"🎮", n:"03", title:"Game Making",
    for:"Mahasiswa", color:C.orange, tc:"#fff",
    desc:"Buat game digital dari nol: gameplay, visual, narasi. Platform untuk game developer muda menunjukkan karya terbaik mereka." },
  { emoji:"📝", n:"04", title:"Karya Tulis Ilmiah",
    for:"Mahasiswa", color:C.coral, tc:"#fff",
    desc:"Riset dan tulis solusi inovatif untuk masalah teknologi aktual, dipresentasikan ke akademisi dan praktisi terkemuka." },
];

const TIMELINE = [
  { emoji:"📝", label:"Pendaftaran & Pelaksanaan Lomba", date:"27 Jul – 12 Okt 2026", note:"Hackathon, IoT, Game Making & KTI", color:C.coral  },
  { emoji:"🏁", label:"Final Day (Online)",              date:"12 Oktober 2026",       note:"Babak final seluruh kategori lomba", color:C.orange },
  { emoji:"🎤", label:"Talkshow & Expo",                 date:"13–14 Oktober 2026",    note:"Untuk mahasiswa & siswa SMA/SMK", color:C.blue   },
  { emoji:"🎮", label:"Fun Game",                        date:"13–14 Oktober 2026",    note:"Turnamen game seru & kompetitif", color:C.lime   },
  { emoji:"🛍️", label:"Tenant Bazzar",                  date:"Coming Soon",           note:"Bazar produk, kuliner & merchandise", color:C.yellow },
];

/* ── Sun SVG ──────────────────────────────────────────────────────────── */
function Sun({ size = 72 }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true">
      <circle cx={r} cy={r} r={r * 0.38} fill={C.yellow} stroke="#000" strokeWidth={2.5}/>
      {[...Array(10)].map((_,i) => {
        const a = (i * 36 - 90) * Math.PI / 180;
        const r1 = r * 0.48, r2 = r * 0.62;
        return <line key={i} x1={r+r1*Math.cos(a)} y1={r+r1*Math.sin(a)} x2={r+r2*Math.cos(a)} y2={r+r2*Math.sin(a)} stroke="#000" strokeWidth={2.5} strokeLinecap="round"/>;
      })}
    </svg>
  );
}

/* ── Starburst sticker (neobrutalist seal) ────────────────────────────── */
function Starburst({ size = 76, color = C.yellow, textColor = C.navy, rotate = -12, lines = [] }) {
  const n = 14;
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const ang = (Math.PI / n) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? 49 : 38;
    pts.push(`${(50 + rad * Math.cos(ang)).toFixed(1)},${(50 + rad * Math.sin(ang)).toFixed(1)}`);
  }
  return (
    <div style={{ width:size, height:size, position:"relative", transform:`rotate(${rotate}deg)`, filter:"drop-shadow(3px 3px 0 #000)" }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <polygon points={pts.join(" ")} fill={color} stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
      </svg>
      <div className="fd" style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:0, color:textColor, lineHeight:.95, textAlign:"center" }}>
        {lines.map((l,i) => (
          <span key={i} style={{ fontWeight:700, fontSize: i===0 ? size*0.26 : size*0.14 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Section heading component ────────────────────────────────────────── */
function SectionHead({ tag, tagColor = C.coral, tagTextColor = "#fff", headline, sub, center = false }) {
  return (
    <div style={{ marginBottom: 40, textAlign: center ? "center" : "left" }}>
      <span className="tag" style={{ background: tagColor, color: tagTextColor, marginBottom: 14, display: "inline-flex" }}>
        {tag}
      </span>
      <h2 className="fd" style={{ fontSize:"clamp(1.75rem,3.5vw,2.5rem)", fontWeight:700, color:C.navy, lineHeight:1.1, letterSpacing:"-0.01em" }}>
        {headline}
      </h2>
      {sub && <p className="fb" style={{ color:C.muted, fontSize:14, fontWeight:500, marginTop:10, lineHeight:1.7, maxWidth: center ? 500 : 540, margin: center ? "10px auto 0" : "10px 0 0" }}>{sub}</p>}
    </div>
  );
}

/* ── Navbar ───────────────────────────────────────────────────────────── */
function Navbar({ open, setOpen }) {
  const links = [["Tentang","#about"],["Acara","#acara"],["Lomba","#lomba"],["Timeline","#timeline"]];
  return (
    <nav className="fb" style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,.92)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:`1.5px solid ${C.border}` }}>
      <div className="container" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:62 }}>

        <a href="#hero" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{ width:38, height:38, borderRadius:10, background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
            <Image src="/itfest-logo.png" alt="IT FEST 6.0" width={28} height={28} style={{ objectFit:"contain" }}/>
          </div>
          <div>
            <div className="fd" style={{ color:C.navy, fontSize:17, fontWeight:700, lineHeight:1.1 }}>IT FEST 6.0</div>
            <div className="fb" style={{ color:C.muted, fontSize:9.5, letterSpacing:".14em", textTransform:"uppercase", fontWeight:700 }}>HIMTI Paramadina</div>
          </div>
        </a>

        <div className="nav-links" style={{ alignItems:"center", gap:28 }}>
          {links.map(([l,h]) => (
            <a key={h} href={h} className="fb" style={{ color:C.muted, fontSize:13.5, fontWeight:600, textDecoration:"none", letterSpacing:".01em", transition:"color .15s" }}
              onMouseEnter={e=>e.currentTarget.style.color=C.navy} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>{l}</a>
          ))}
          <a href="/events" className="btn btn-press bb-hard bs-hard fd"
            style={{ background:C.coral, color:"#fff", fontSize:13, padding:"9px 20px", borderRadius:99, boxShadow:"4px 4px 0 #000" }}>
            Daftar Lomba
          </a>
        </div>

        <button className="nav-burger btn" onClick={()=>setOpen(v=>!v)}
          style={{ background:"none", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"8px 10px", cursor:"pointer" }}>
          <svg width="20" height="20" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round">
            {open?<><line x1="3" y1="3" x2="17" y2="17"/><line x1="17" y1="3" x2="3" y2="17"/></>
                 :<><line x1="2" y1="5" x2="18" y2="5"/><line x1="2" y1="10" x2="18" y2="10"/><line x1="2" y1="15" x2="18" y2="15"/></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="container fb" style={{ paddingTop:8, paddingBottom:16, borderTop:`1px solid ${C.border}` }}>
          {links.map(([l,h]) => (
            <a key={h} href={h} onClick={()=>setOpen(false)}
              style={{ display:"block", padding:"11px 0", color:C.ink, fontWeight:600, fontSize:15, textDecoration:"none", borderBottom:`1px solid ${C.border}` }}>{l}</a>
          ))}
          <a href="/events" onClick={()=>setOpen(false)}
            style={{ display:"block", marginTop:12, textAlign:"center", background:C.coral, color:"#fff", fontWeight:700, padding:"13px", borderRadius:12, textDecoration:"none", fontSize:14 }}>
            Daftar Lomba
          </a>
        </div>
      )}
    </nav>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="hero" style={{ position:"relative", zIndex:1 }}>
      {/*
        DataGridHero fills the full hero area.
        textMask="IT FEST" renders the text on an offscreen canvas;
        cells that overlap the letters pulse at high opacity (coral/yellow),
        background cells sit at near-zero opacity — creating a glowing
        watermark of "IT FEST" across the entire hero.
      */}
      <DataGridHero
        rows={36}
        cols={74}
        spacing={3}
        duration={4}
        color={C.yellow}
        maskColor={C.coral}
        animationType="pulse"
        pulseEffect={true}
        mouseGlow={true}
        opacityMin={0.03}
        opacityMax={0.55}
        background={C.navy}
        textMask="IT FEST"
      >
        {/* ── Content sits above the grid via dgh-content (z-index:2) ── */}
        <div style={{ padding:"64px 24px 72px", maxWidth:1160, margin:"0 auto", display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:48, alignItems:"center" }}
          className="hero-inner-grid">
          <style>{`
            .hero-inner-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center; }
            @media (max-width: 880px) { .hero-inner-grid { grid-template-columns: 1fr; text-align: center; } .hero-meta-row { justify-content: center !important; } .hero-cta-row { justify-content: center !important; } }
          `}</style>

          {/* Left: text content */}
          <div>
            {/* Eyebrow */}
            <div className="fb hero-anim" style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:22, animationDelay:"60ms" }}>
              <span className="hero-eyebrow-bar" style={{ width:20, height:2, background:C.coral, display:"inline-block", borderRadius:2 }}/>
              <span style={{ color:"rgba(255,255,255,.4)", fontSize:11, fontWeight:700, letterSpacing:".18em", textTransform:"uppercase" }}>
                HIMTI × Prodi TI Paramadina
              </span>
            </div>

            {/* Title */}
            <h1 className="fd hero-anim" style={{ fontSize:"clamp(3.6rem,8vw,6.4rem)", fontWeight:700, lineHeight:.9, letterSpacing:"-.02em", marginBottom:22, animationDelay:"160ms" }}>
              <span style={{ display:"block", color:C.yellow }}>IT FEST</span>
              <span style={{ display:"block", color:C.lime }}>6.0</span>
            </h1>

            {/* Tagline */}
            <p className="fp hero-anim" style={{ fontSize:"clamp(.85rem,1.7vw,1.05rem)", color:"rgba(255,255,255,.6)", lineHeight:1.65, marginBottom:28, maxWidth:400, animationDelay:"260ms" }}>
              "Human-Centered AI: Transforming the World with Integrity"
            </p>

            {/* Meta */}
            <div className="hero-meta-row hero-anim" style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:32, animationDelay:"360ms" }}>
              {[{ e:"📅", t:"27 Juli – 14 Oktober 2026" }, { e:"📍", t:"Universitas Paramadina, Jakarta" }].map((m,i) => (
                <span key={i} className="fb" style={{ display:"inline-flex", alignItems:"center", gap:8, color:"rgba(255,255,255,.48)", fontSize:13, fontWeight:600 }}>
                  {m.e} {m.t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="hero-cta-row hero-anim" style={{ display:"flex", gap:12, flexWrap:"wrap", animationDelay:"450ms" }}>
              <a href="/events" className="btn btn-press bb-hard fd"
                style={{ background:C.coral, color:"#fff", fontSize:14, fontWeight:700, padding:"14px 30px", borderRadius:99, border:"3px solid #000", boxShadow:"5px 5px 0 #000" }}>
                🏆 Daftar Sekarang
              </a>
              <a href="#acara" className="btn fd"
                style={{ background:"rgba(255,255,255,.08)", color:"#fff", fontSize:14, fontWeight:700, padding:"14px 30px", borderRadius:99, border:"2px solid rgba(255,255,255,.22)", backdropFilter:"blur(10px)" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.15)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}>
                Lihat Acara ↓
              </a>
            </div>
          </div>

          {/* Right: logo card + stats */}
          <div className="hero-anim" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, animationDelay:"340ms" }}>
            {/* Logo card (relative for sticker) */}
            <div style={{ position:"relative" }}>
              {/* Starburst sticker */}
              <div className="a-floatB" style={{ position:"absolute", top:-22, right:-22, zIndex:3 }}>
                <Starburst color={C.coral} textColor="#fff" rotate={14} size={82} lines={["6.0","EDITION"]}/>
              </div>

              <div className="a-pulse bb-hard" style={{ borderRadius:24, background:"rgba(255,255,255,.97)", padding:"28px 36px", display:"flex", flexDirection:"column", alignItems:"center", gap:12, boxShadow:"8px 8px 0 #000" }}>
                <Image src="/itfest-logo.png" alt="IT FEST 6.0" width={130} height={130} priority style={{ objectFit:"contain" }}/>
                <div style={{ textAlign:"center" }}>
                  <div className="fd" style={{ color:C.navy, fontSize:21, fontWeight:700, lineHeight:1.1 }}>IT FEST 6.0</div>
                  <div className="fp" style={{ color:C.coral, fontSize:12, marginTop:3 }}>Ride the Wave of Creativity</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, width:"100%", maxWidth:300 }}>
              {[
                { n:"4",   l:"Kategori\nLomba",      c:C.coral  },
                { n:"5",   l:"Jenis\nAcara",          c:C.lime   },
                { n:"2hr", l:"Celebration\nDay",      c:C.blue   },
              ].map((s,i) => (
                <div key={i} className="bb-hard" style={{ background:s.c, borderRadius:12, padding:"11px 8px", textAlign:"center", boxShadow:"3px 3px 0 #000" }}>
                  <div className="fd" style={{ color:"#fff", fontSize:21, fontWeight:700, textShadow:"1px 1px 0 rgba(0,0,0,.2)", lineHeight:1 }}>{s.n}</div>
                  <div className="fb" style={{ color:"rgba(255,255,255,.78)", fontSize:8.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", marginTop:4, lineHeight:1.35, whiteSpace:"pre-line" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DataGridHero>
    </section>
  );
}

/* ── Ticker ───────────────────────────────────────────────────────────── */
function Ticker() {
  const items = ["🏄 IT FEST 6.0","💡 Human-Centered AI","🎓 Universitas Paramadina","🏆 Hackathon · IoT · Game · KTI","🌊 Ride the Wave","📅 27 Juli – 14 Oktober 2026","🌴 Jakarta × Tech × Festival"];
  const d = [...items, ...items];
  return (
    <div className="ticker-wrap fb" style={{ background:C.coral, borderTop:"3px solid #000", borderBottom:"3px solid #000", padding:"11px 0", marginTop:0 }}>
      <div className="ticker-track">
        {d.map((t,i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"0 24px", color:"#fff", fontSize:12.5, fontWeight:700, whiteSpace:"nowrap", letterSpacing:".03em" }}>
            {t}<span style={{ opacity:.3, marginLeft:6, fontSize:10 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── About ────────────────────────────────────────────────────────────── */
function About() {
  return (
    <section id="about" style={{ background:"#fff", padding:"72px 0", position:"relative", zIndex:1 }}>
      <div className="container">
        <div className="about-grid">

          {/* Text */}
          <div>
            <SectionHead
              tag="Tentang Acara"
              tagColor={C.yellow}
              tagTextColor={C.navy}
              headline={<>Apa itu <span style={{ color:C.coral }}>IT FEST 6.0?</span></>}
            />
            <p className="fb" style={{ color:"#475569", fontSize:15, lineHeight:1.85, fontWeight:500, marginBottom:16 }}>
              IT Fest 6.0 adalah festival teknologi yang diselenggarakan oleh{" "}
              <strong style={{ color:C.navy, fontWeight:700 }}>HIMTI dan Prodi Teknik Informatika Universitas Paramadina</strong>{" "}
              dengan tema{" "}
              <span className="fp" style={{ color:C.coral, fontSize:".92em" }}>"Human-Centered AI: Transforming the World with Integrity"</span>.
            </p>
            <p className="fb" style={{ color:"#64748B", fontSize:14, lineHeight:1.85, fontWeight:500 }}>
              Wadah kolaboratif untuk mahasiswa dan siswa SMA/SMK mengeksplorasi teknologi secara kreatif, mempertemukan beragam perspektif, dan mendorong lahirnya inovasi yang berdampak nyata.
            </p>
          </div>

          {/* Audience cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { emoji:"🎓", label:"Mahasiswa", color:C.blue, items:["Hackathon","Internet of Things","Game Making","Karya Tulis Ilmiah"] },
              { emoji:"🏫", label:"Siswa SMA / SMK", color:C.lime, tc:C.navy, items:["Talkshow","Expo","Fun Game"] },
            ].map((a,i) => (
              <div key={i} className="card sh-sm" style={{ padding:"20px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:13 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                    {a.emoji}
                  </div>
                  <span className="fd" style={{ color:C.navy, fontSize:18, fontWeight:700 }}>{a.label}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {a.items.map((item,j) => (
                    <span key={j} className="fb" style={{ fontSize:11.5, fontWeight:700, padding:"5px 12px", borderRadius:99, background:`${a.color}22`, color:a.color===C.lime||a.color===C.yellow?C.navy:a.color }}>{item}</span>
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

/* ── Acara ────────────────────────────────────────────────────────────── */
function Acara() {
  return (
    <section id="acara" style={{ background:C.sand, padding:"72px 0", position:"relative", zIndex:1, borderTop:`1.5px solid ${C.border}`, borderBottom:`1.5px solid ${C.border}` }}>
      <div className="container">
        <SectionHead
          tag="Program Acara"
          tagColor={C.blue}
          tagTextColor="#fff"
          headline={<>Rangkaian <span style={{ color:C.blue }}>IT FEST 6.0</span></>}
          sub="Lima jenis kegiatan yang menjadi highlight festival teknologi terbesar Universitas Paramadina."
        />

        <div className="acara-grid">
          {ACARA.map((a,i) => (
            <div key={i} data-reveal style={{ "--reveal-delay":`${i*80}ms`, background:a.color, border:"2.5px solid #000", borderRadius:16, padding:"22px 14px 18px", textAlign:"center", boxShadow:"4px 4px 0 #000", transition:"transform .15s ease, box-shadow .15s ease", cursor:"default" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translate(-2px,-3px)"; e.currentTarget.style.boxShadow="6px 6px 0 #000"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="4px 4px 0 #000"; }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{a.emoji}</div>
              <div className="fd" style={{ color:a.tc, fontSize:16, fontWeight:700, marginBottom:8, lineHeight:1.1 }}>{a.label}</div>
              <div className="fb" style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99, display:"inline-block", background:"rgba(0,0,0,.15)", color:a.tc, letterSpacing:".04em" }}>
                {a.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Lomba ────────────────────────────────────────────────────────────── */
function Lomba() {
  return (
    <section id="lomba" style={{ background:"#fff", padding:"72px 0", position:"relative", zIndex:1 }}>
      <div className="container">
        <SectionHead
          tag="Daftar Lomba"
          tagColor={C.coral}
          tagTextColor="#fff"
          headline={<>Pilih <span style={{ color:C.coral }}>Kategori Lombamu</span></>}
          sub={<>Pendaftaran dibuka <strong style={{ color:C.navy }}>27 Juli – 14 Agustus 2026</strong> untuk semua kategori lomba.</>}
        />

        <div className="lomba-grid">
          {LOMBA.map((c,i) => (
            <div key={i} data-reveal style={{ "--reveal-delay":`${i*90}ms`, borderRadius:20, overflow:"hidden", border:"2.5px solid #000", boxShadow:"6px 6px 0 #000", transition:"transform .15s, box-shadow .15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translate(-2px,-3px)"; e.currentTarget.style.boxShadow="8px 8px 0 #000"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="6px 6px 0 #000"; }}>

              {/* Colored header */}
              <div style={{ background:c.color, padding:"28px 24px 24px", position:"relative", overflow:"hidden", borderBottom:"2.5px solid #000" }}>
                {/* Ghost number */}
                <div aria-hidden="true" className="fd" style={{ position:"absolute", bottom:-28, right:0, fontSize:120, fontWeight:700, color:"rgba(0,0,0,.07)", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>{c.n}</div>
                <div style={{ fontSize:32, marginBottom:10 }}>{c.emoji}</div>
                <h3 className="fd" style={{ color:c.tc, fontSize:21, fontWeight:700, lineHeight:1.15, marginBottom:8 }}>{c.title}</h3>
                <span className="fb" style={{ fontSize:10.5, fontWeight:700, padding:"4px 11px", borderRadius:99, display:"inline-block", background:"rgba(0,0,0,.18)", color:c.tc, letterSpacing:".06em" }}>{c.for}</span>
              </div>

              {/* Body */}
              <div style={{ background:"#fff", padding:"22px 24px 20px" }}>
                <p className="fb" style={{ color:"#64748B", fontSize:13.5, lineHeight:1.8, fontWeight:500, marginBottom:18 }}>{c.desc}</p>
                <a href="/events" className="btn btn-press bb-hard fd"
                  style={{ display:"block", textAlign:"center", background:c.color, color:c.tc, fontSize:12, fontWeight:700, padding:"12px", borderRadius:10, textDecoration:"none", letterSpacing:".07em", textTransform:"uppercase", border:"2.5px solid #000", boxShadow:"4px 4px 0 #000" }}>
                  Daftar Sekarang →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Bazzar ───────────────────────────────────────────────────────────── */
function Bazzar() {
  return (
    <section style={{ background:C.sand, padding:"72px 0", borderTop:`1.5px solid ${C.border}`, borderBottom:`1.5px solid ${C.border}`, position:"relative", zIndex:1 }}>
      <div className="container">
        <div style={{ maxWidth:520, margin:"0 auto", textAlign:"center", position:"relative" }}>
          {/* SOON sticker */}
          <div className="a-floatB" style={{ position:"absolute", top:-26, right:-6, zIndex:3, pointerEvents:"none" }}>
            <Starburst color={C.yellow} textColor={C.navy} rotate={16} size={78} lines={["SOON","STAY TUNED"]}/>
          </div>
          <div className="card sh" data-reveal style={{ padding:"44px 40px" }}>
            <div style={{ width:68, height:68, borderRadius:18, background:C.orange, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 20px", border:"2.5px solid #000", boxShadow:"3px 3px 0 #000" }}>
              🛍️
            </div>
            <h3 className="fd" style={{ color:C.navy, fontSize:26, fontWeight:700, marginBottom:10 }}>Tenant Bazzar</h3>
            <p className="fb" style={{ color:C.muted, fontSize:14, lineHeight:1.8, marginBottom:24, maxWidth:360, margin:"0 auto 24px" }}>
              Jadilah bagian dari Bazzar IT FEST 6.0! Informasi ketentuan dan biaya tenant akan segera diumumkan oleh panitia.
            </p>
            <span className="fd" style={{ display:"inline-block", padding:"10px 24px", borderRadius:99, background:C.orange, color:"#fff", fontWeight:700, fontSize:13, letterSpacing:".07em", textTransform:"uppercase", border:"2.5px solid #000", boxShadow:"4px 4px 0 #000" }}>
              ⏳ Coming Soon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Timeline ─────────────────────────────────────────────────────────── */
function Timeline() {
  const txt = (bg) => (bg === C.yellow || bg === C.lime ? C.navy : "#fff");
  return (
    <section id="timeline" style={{ background:"#fff", padding:"80px 0", position:"relative", zIndex:1 }}>
      <div className="container">
        <SectionHead
          center
          tag="Jadwal Kegiatan"
          tagColor={C.lime}
          tagTextColor={C.navy}
          headline={<>Timeline <span style={{ color:C.lime }}>IT FEST 6.0</span></>}
          sub="Rangkaian kegiatan lengkap dari awal pendaftaran hingga hari puncak festival."
        />

        <div className="tl-zigzag">
          {/* Center spine */}
          <span className="tl-spine" aria-hidden="true" />

          {TIMELINE.map((item, i) => {
            const side = i % 2 === 0 ? "left" : "right";
            return (
              <div key={i} className={`tl-row tl-${side}`} data-reveal style={{ "--reveal-delay":`${i*90}ms` }}>
                {/* Card */}
                <div className="tl-card-wrap">
                  <div className="tl-card" style={{ borderTop:`5px solid ${item.color}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                      <span style={{ width:42, height:42, flexShrink:0, borderRadius:12, background:item.color, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:20, border:"2.5px solid #000", boxShadow:"3px 3px 0 #000" }}>
                        {item.emoji}
                      </span>
                      <h3 className="fd" style={{ color:C.navy, fontSize:17, fontWeight:700, lineHeight:1.2 }}>{item.label}</h3>
                    </div>
                    <p className="fb" style={{ color:C.muted, fontSize:12.5, fontWeight:500, lineHeight:1.6, marginBottom:14 }}>{item.note}</p>
                    <span className="fb" style={{ fontSize:11, fontWeight:700, padding:"5px 13px", borderRadius:99, display:"inline-block", background:item.color, color:txt(item.color), border:"2px solid #000", letterSpacing:".03em", boxShadow:"2px 2px 0 #000" }}>
                      📅 {item.date}
                    </span>
                  </div>
                </div>

                {/* Node on the spine */}
                <span className="tl-node" style={{ background:item.color }} aria-hidden="true">
                  <span className="tl-node-num fd">{i + 1}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:C.navy, borderTop:"3px solid #000", position:"relative", zIndex:1 }}>
      {/* Yellow accent strip */}
      <div className="ticker-wrap fb" style={{ background:C.yellow, borderBottom:"3px solid #000", padding:"10px 0" }}>
        <div className="ticker-track" style={{ animationDuration:"22s" }}>
          {[...Array(14)].map((_,i) => (
            <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"0 18px", color:C.navy, fontSize:12.5, fontWeight:700, whiteSpace:"nowrap" }}>
              🌊 IT FEST 6.0 <span style={{ opacity:.25 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding:"52px 24px 0" }}>
        <div className="footer-grid" style={{ paddingBottom:48 }}>

          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ borderRadius:12, background:C.white, padding:"5px", display:"flex", border:"2px solid rgba(255,255,255,.2)" }}>
                <Image src="/itfest-logo.png" alt="IT FEST 6.0" width={40} height={40} style={{ objectFit:"contain" }}/>
              </div>
              <div>
                <div className="fd" style={{ color:"#fff", fontSize:19, fontWeight:700, lineHeight:1.1 }}>IT FEST 6.0</div>
                <div className="fp" style={{ color:C.lime, fontSize:11 }}>Ride the Wave of Creativity</div>
              </div>
            </div>
            <p className="fb" style={{ color:"rgba(255,255,255,.35)", fontSize:13.5, lineHeight:1.8, maxWidth:220 }}>
              Festival teknologi HIMTI & Prodi TI Universitas Paramadina.
            </p>
          </div>

          {/* Contact */}
          <div>
            <div className="fd" style={{ color:"rgba(255,255,255,.35)", fontSize:10.5, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", marginBottom:16 }}>Kontak Panitia</div>
            {[{ e:"📍", t:"Paramadina University, Cipayung, Jakarta" }, { e:"📞", t:"Ayu — 0819-9285-5778" }, { e:"📧", t:"itfestparamadina@gmail.com" }].map((item,i) => (
              <div key={i} className="fb" style={{ display:"flex", gap:9, marginBottom:12, color:"rgba(255,255,255,.55)", fontSize:13, fontWeight:500, alignItems:"flex-start", lineHeight:1.5 }}>
                <span style={{ flexShrink:0 }}>{item.e}</span><span>{item.t}</span>
              </div>
            ))}
          </div>

          {/* Social */}
          <div>
            <div className="fd" style={{ color:"rgba(255,255,255,.35)", fontSize:10.5, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", marginBottom:16 }}>Ikuti IT FEST</div>
            <div style={{ display:"flex", gap:10 }}>
              {[
                { label:"Instagram", icon:<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg> },
                { label:"TikTok", icon:<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg> },
              ].map((s,i) => (
                <a key={i} href="#" className="btn"
                  style={{ width:40, height:40, borderRadius:10, background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.6)", border:"1.5px solid rgba(255,255,255,.12)", transition:"background .15s, color .15s" }}
                  aria-label={s.label}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,.16)"; e.currentTarget.style.color="#fff"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.08)"; e.currentTarget.style.color="rgba(255,255,255,.6)"; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fb" style={{ borderTop:"1px solid rgba(255,255,255,.07)", textAlign:"center", padding:"16px 24px", color:"rgba(255,255,255,.18)", fontSize:11, fontWeight:600, letterSpacing:".06em" }}>
        © 2026 IT FEST 6.0 · HIMTI & Prodi Teknik Informatika Universitas Paramadina
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
      <div className="fb" style={{ background:C.bg }}>
        <div className="dot-bg" aria-hidden="true"/>
        <Navbar open={open} setOpen={setOpen}/>
        <main style={{ position:"relative", zIndex:1 }}>
          <Hero/>
          <Ticker/>
          <About/>
          <Acara/>
          <Lomba/>
          <Bazzar/>
          <Timeline/>
        </main>
        <Footer/>
      </div>
    </>
  );
}
