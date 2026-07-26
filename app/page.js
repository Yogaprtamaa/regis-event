"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Loading from "./loading";
import { formatTanggalPengumuman } from "@/lib/scoring";
import { youtubeEmbedUrl } from "@/lib/youtube";
import {
  TrophyIcon,
  MicrophoneIcon,
  RocketLaunchIcon,
  PuzzlePieceIcon,
  ShoppingBagIcon,
  CodeBracketIcon,
  CpuChipIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  FlagIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

/* ── Scroll reveal ─────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("revealed")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Parallax: satu listener set --sy di root, elemen konsumsi via calc ── */
function useParallax() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const set = () => {
      document.documentElement.style.setProperty("--sy", String(window.scrollY));
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    set();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

/* ── Tokens — palet resmi IT FEST ──────────────────────────────────── */
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

const FLAG_COLORS = [C.coral, C.yellow, C.blue, C.lime, C.orange];

/* ── Global CSS ─────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=Fredoka:wght@500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { overflow-x: hidden; background: ${C.seaDeep}; }

  .fd { font-family: 'Space Grotesk', sans-serif; letter-spacing: -.01em; }
  .fb { font-family: 'Plus Jakarta Sans', sans-serif; }

  :root { --max: 1140px; --sy: 0; }
  .container { max-width: var(--max); margin: 0 auto; padding: 0 24px; }
  .sec { position: relative; }

  /* ── Judul groovy (poster resmi) ── */
  .groovy {
    -webkit-text-stroke: 4px #157347;
    paint-order: stroke fill;
    color: ${C.lime};
    text-shadow: 4px 5px 0 ${C.yellow}, 8px 10px 0 rgba(0,0,0,.18);
    letter-spacing: -.01em;
  }

  /* ── Pita brush tagline ── */
  .ribbon {
    display: inline-block; background: ${C.navy}; color: #fff;
    border: 3px solid #000; border-radius: 10px; box-shadow: 4px 4px 0 #000;
    transform: rotate(-1.6deg); padding: 10px 22px;
  }

  /* ── Kartu retro ── */
  .k-card { background: #fff; border: 3px solid #000; border-radius: 18px; box-shadow: 6px 6px 0 #000; }

  /* ── Sticker tag ── */
  .k-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
    padding: 6px 15px; border-radius: 99px; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 2.5px solid #000; box-shadow: 3px 3px 0 #000; transform: rotate(-1.5deg);
  }

  /* ── Tombol ── */
  .k-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-family: 'Fredoka', sans-serif; font-weight: 600;
    border: 3px solid #000; border-radius: 99px;
    cursor: pointer; text-decoration: none; box-shadow: 5px 5px 0 #000;
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .k-btn:hover  { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
  .k-btn:active { transform: translate(4px,4px); box-shadow: none; }
  .k-btn:focus-visible { outline: 3px dashed ${C.yellow}; outline-offset: 3px; }

  /* ── Booth / cabana pantai ── */
  .booth { border: 3px solid #000; border-radius: 18px; overflow: hidden; background: #fff; box-shadow: 6px 6px 0 #000; transition: transform .18s ease, box-shadow .18s ease; }
  .booth:hover { transform: translate(-2px,-4px); box-shadow: 9px 9px 0 #000; }
  .awning { height: 44px; border-bottom: 3px solid #000; position: relative; }
  .awning-scallop { position: absolute; left: 0; right: 0; bottom: -17px; height: 17px; z-index: 2; background-repeat: repeat-x; background-size: 28px 17px; }

  /* ── Butiran pasir (tekstur realistik) ── */
  .sand-grain {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      radial-gradient(circle at 8% 22%,  rgba(139,105,20,.16) 1.5px, transparent 2px),
      radial-gradient(circle at 34% 68%, rgba(139,105,20,.13) 1px,   transparent 1.6px),
      radial-gradient(circle at 52% 15%, rgba(139,105,20,.15) 1.5px, transparent 2px),
      radial-gradient(circle at 71% 55%, rgba(139,105,20,.12) 1px,   transparent 1.6px),
      radial-gradient(circle at 88% 30%, rgba(139,105,20,.16) 1.5px, transparent 2px),
      radial-gradient(circle at 20% 85%, rgba(139,105,20,.12) 1px,   transparent 1.6px),
      radial-gradient(circle at 63% 90%, rgba(139,105,20,.14) 1.5px, transparent 2px),
      radial-gradient(circle at 95% 78%, rgba(139,105,20,.1)  1px,   transparent 1.6px);
    background-size: 130px 130px, 90px 90px, 150px 150px, 100px 100px, 140px 140px, 95px 95px, 120px 120px, 105px 105px;
  }

  /* ── Jejak kaki di pasir ── */
  .footprint { opacity: .55; }

  /* ── Ticker ── */
  .ticker-wrap  { overflow: hidden; white-space: nowrap; }
  .ticker-track { display: inline-flex; animation: ticker 36s linear infinite; }
  .ticker-track:hover { animation-play-state: paused; }

  /* ── Grids ── */
  .acara-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 16px; }
  .lomba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
  /* kartu terakhir yang kesisa sendirian dilebarin 2 kolom biar barisnya gak nyeplak */
  .lomba-grid > :last-child:nth-child(odd) { grid-column: 1 / -1; }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: center; }
  .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; }
  .hero-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 40px; align-items: flex-end; }
  .hero-beach { display: flex; justify-content: center; align-items: flex-end; }

  /* ── Nav ── */
  .nav-links  { display: flex; }
  .nav-burger { display: none; }
  @media (max-width: 800px) { .nav-links { display: none; } .nav-burger { display: flex; } }

  /* ── Rute jejak kaki (timeline) ── */
  .rute { position: relative; max-width: 720px; margin: 0 auto; }
  .rute-spine { position: absolute; top: 8px; bottom: 8px; left: 27px; width: 0; border-left: 3px dashed rgba(8,46,75,.4); }
  .rute-row { position: relative; display: flex; gap: 22px; margin-bottom: 26px; align-items: flex-start; }
  .rute-row:last-child { margin-bottom: 0; }
  .rute-node { position: relative; z-index: 2; width: 54px; height: 54px; flex-shrink: 0; border: 3px solid #000; border-radius: 50%; box-shadow: 3px 3px 0 #000; display: flex; align-items: center; justify-content: center; }
  .rute-card { flex: 1; background: #fff; border: 3px solid #000; border-radius: 16px; padding: 16px 20px; box-shadow: 5px 5px 0 #000; transition: transform .15s ease, box-shadow .15s ease; }
  .rute-card:hover { transform: translate(-2px,-3px); box-shadow: 7px 7px 0 #000; }

  /* ── Gelembung ── */
  .bubble { position: absolute; bottom: -40px; border-radius: 50%; background: rgba(255,255,255,.5); border: 1.5px solid rgba(255,255,255,.7); animation: rise linear infinite; }

  /* ── Ikan drift ── */
  .fish { position: absolute; animation: swim linear infinite; }

  /* ── Parallax helper ── */
  .px-slow { transform: translateY(calc(var(--sy) * .04px)); }
  .px-mid  { transform: translateY(calc(var(--sy) * -.05px)); }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .acara-grid { grid-template-columns: repeat(3,1fr); }
    .lomba-grid { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .hero-grid { grid-template-columns: 1fr; gap: 8px; text-align: center; }
    .hero-beach { display: none; }
    .hero-sky { display: none; }
    .hero-cta-row { justify-content: center; }
    .fish { display: none; } /* ponytail: fixed top% drifts into reflowed content on narrower layouts */
  }
  @media (max-width: 600px) {
    .acara-grid { grid-template-columns: repeat(2,1fr); gap: 12px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .container { padding: 0 16px; }
    section { padding-top: 56px !important; padding-bottom: 56px !important; }
    .px-slow, .px-mid { transform: none; }
  }

  /* ── Animasi ── */
  @keyframes ticker { to { transform: translateX(-50%); } }
  @keyframes waveDrift { to { transform: translateX(-50%); } }
  @keyframes waveSurge { 0% { transform: translateY(4px); } 35% { transform: translateY(-8px); } 100% { transform: translateY(4px); } }
  @keyframes slowSpin { to { transform: rotate(360deg); } }
  @keyframes bob { 0%,100% { transform: translateY(0) rotate(var(--rot,0deg)); } 50% { transform: translateY(-12px) rotate(var(--rot,0deg)); } }
  @keyframes drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(26px); } }
  @keyframes rise { 0%   { transform: translateY(0) translateX(0); opacity: 0; }
                    10%  { opacity: 1; }
                    40%  { transform: translateY(-45vh) translateX(calc(var(--bx,20px) * -0.4)); }
                    70%  { transform: translateY(-85vh) translateX(calc(var(--bx,20px) * 0.7)); }
                    90%  { opacity: 1; }
                    100% { transform: translateY(-118vh) translateX(var(--bx,20px)); opacity: 0; } }
  @keyframes swim { 0%   { transform: translateX(-14vw) translateY(0) scaleX(var(--fx,1)); }
                     25%  { transform: translateX(15vw) translateY(-14px) scaleX(var(--fx,1)); }
                     50%  { transform: translateX(50vw) translateY(6px) scaleX(var(--fx,1)); }
                     75%  { transform: translateX(82vw) translateY(-11px) scaleX(var(--fx,1)); }
                     100% { transform: translateX(114vw) translateY(0) scaleX(var(--fx,1)); } }
  @keyframes heroPop { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes revealUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
  @keyframes sway { 0%,100% { transform: rotate(-.8deg); } 50% { transform: rotate(.8deg); } }

  .wave-move { animation: waveDrift 18s linear infinite; }
  .wave-surge { animation: waveSurge 4.2s cubic-bezier(.45,0,.55,1) infinite; }
  @keyframes shaftGlow { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
  .shaft { animation: shaftGlow 7s ease-in-out infinite; }
  .spin-slow { animation: slowSpin 24s linear infinite; transform-origin: center; }
  .bob   { animation: bob 5s ease-in-out infinite; }
  .drift { animation: drift 9s ease-in-out infinite; }
  .hero-anim { opacity: 0; animation: heroPop .6s cubic-bezier(.22,1,.36,1) forwards; }
  .bunting-sway { transform-origin: top center; animation: sway 5.5s ease-in-out infinite; }

  [data-reveal] { opacity: 0; }
  [data-reveal].revealed { animation: revealUp .7s cubic-bezier(.22,1,.36,1) forwards; animation-delay: var(--reveal-delay,0ms); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
    [data-reveal], .hero-anim { opacity: 1 !important; transform: none !important; }
    .bubble, .fish { display: none !important; }
    .px-slow, .px-mid { transform: none !important; }
    .shaft { opacity: .7 !important; }
  }
`;

/* ── Data ─────────────────────────────────────────────────────────────── */
const ACARA = [
  { Icon: TrophyIcon, label: "Lomba", sub: "27 Jul – 14 Agt", color: C.coral, tc: "#fff" },
  { Icon: FlagIcon, label: "Final Day", sub: "12 Okt", color: C.navy, tc: "#fff" },
  { Icon: MicrophoneIcon, label: "Talkshow", sub: "13–14 Okt", color: C.blue, tc: "#fff" },
  { Icon: RocketLaunchIcon, label: "Expo", sub: "13–14 Okt", color: C.lime, tc: C.navy },
  { Icon: PuzzlePieceIcon, label: "Fun Game", sub: "14 Okt", color: C.orange, tc: "#fff" },
  { Icon: ShoppingBagIcon, label: "Bazzar", sub: "13–14 Okt", color: C.yellow, tc: C.navy },
];

const LOMBA = [
  { Icon: CodeBracketIcon, title: "Hackathon", color: C.lime, tc: C.navy, desc: "Selesaikan tantangan teknologi nyata dalam waktu terbatas. Asah problem-solving dan kerja tim bersama peserta terbaik dari seluruh Indonesia." },
  { Icon: CpuChipIcon, title: "Internet of Things", color: C.blue, tc: "#fff", desc: "Kembangkan perangkat IoT berdampak nyata — dari sensor hingga dashboard — dan presentasikan di hadapan juri industri." },
  { Icon: DocumentTextIcon, title: "Karya Tulis Ilmiah", color: C.yellow, tc: C.navy, desc: "Riset dan tulis solusi inovatif untuk masalah teknologi aktual, dipresentasikan ke akademisi dan praktisi terkemuka." },
];

const HASIL_KATEGORI = [
  { value: "HACKATHON", label: "Hackathon", color: C.lime, tc: C.navy },
  { value: "IOT", label: "Internet of Things", color: C.blue, tc: "#fff" },
  { value: "KTI", label: "Karya Tulis Ilmiah", color: C.yellow, tc: C.navy },
];

// Langkahnya diturunkan dari alur asli di /events/[id] dan /submit-karya —
// kalau syarat berkas di lib/kategori.js berubah, teks di sini ikut disesuaikan.
const TATA_CARA = [
  {
    value: "DAFTAR",
    label: "Pendaftaran Peserta",
    Icon: PencilSquareIcon,
    color: C.coral,
    tc: "#fff",
    ringkas: "Berlaku untuk semua kategori lomba.",
    video: "", // tempel link YouTube di sini — kosong = tampil placeholder

    langkah: [
      "Buka halaman Lomba, pilih kategori yang mau kamu ikuti.",
      "Klik “Bergabunglah Sekarang”, lalu isi data ketua beserta seluruh anggota tim.",
      "Unggah screenshot follow @himti dan @itfest, foto KTM tiap anggota, dan bukti pembayaran bila lombanya berbayar.",
      "Buat password akun peserta (minimal 6 karakter). Password ini dipakai untuk memantau verifikasi dan mengumpulkan karya.",
      "Kirim formulir. Kamu langsung masuk sebagai peserta, tidak perlu login ulang.",
      "Tunggu panitia memverifikasi. Status berubah jadi “Terverifikasi” di halaman peserta, dan setelah itu tombol pengumpulan karya terbuka.",
    ],
  },
  {
    value: "KTI",
    label: "Pengumpulan KTI",
    Icon: DocumentTextIcon,
    color: C.yellow,
    tc: C.navy,
    ringkas: "Naskah diunggah langsung, bukan lewat Drive.",
    video: "",

    langkah: [
      "Login di halaman peserta, pastikan status akun sudah Terverifikasi.",
      "Isi judul karya dan deskripsi singkat.",
      "Unggah naskah karya tulis dalam format PDF, maksimal 10MB.",
      "Unggah laporan Turnitin dalam format PDF (maksimal 10MB) dengan similarity maksimal 30%.",
      "Link video presentasi bersifat opsional — boleh dikosongkan.",
      "Klik Kirim Karya. Satu tim hanya bisa mengumpulkan satu kali, jadi periksa lagi sebelum mengirim.",
    ],
  },
  {
    value: "HACKATHON",
    label: "Pengumpulan Hackathon",
    Icon: CodeBracketIcon,
    color: C.lime,
    tc: C.navy,
    ringkas: "Berkas karya dikumpulkan lewat Google Drive.",
    video: "",

    langkah: [
      "Login di halaman peserta, pastikan status akun sudah Terverifikasi.",
      "Isi judul karya dan deskripsi singkat.",
      "Kumpulkan seluruh berkas karya dalam satu folder Google Drive, lalu set aksesnya ke “siapa saja yang punya link”.",
      "Tempel link folder Drive tadi di kolom Link Google Drive Karya.",
      "Isi link repository. Pastikan repo bisa diakses publik selama penjurian.",
      "Isi link video demo (Google Drive atau YouTube), lalu klik Kirim Karya. Jangan ubah isi folder sampai penjurian selesai.",
    ],
  },
  {
    value: "IOT",
    label: "Pengumpulan IoT",
    Icon: CpuChipIcon,
    color: C.blue,
    tc: "#fff",
    ringkas: "Berkas karya dikumpulkan lewat Google Drive.",
    video: "",

    langkah: [
      "Login di halaman peserta, pastikan status akun sudah Terverifikasi.",
      "Isi judul karya dan deskripsi singkat.",
      "Kumpulkan laporan dan seluruh berkas pendukung dalam satu folder Google Drive, lalu set aksesnya ke “siapa saja yang punya link”.",
      "Tempel link folder Drive tadi di kolom Link Google Drive Karya.",
      "Isi link video demo (Google Drive atau YouTube).",
      "Klik Kirim Karya. Jangan ubah isi folder sampai penjurian selesai.",
    ],
  },
];

const TIMELINE = [
  { Icon: PencilSquareIcon, label: "Pendaftaran & Pelaksanaan Lomba", date: "27 Jul – 12 Okt 2026", note: "Hackathon, IoT & KTI", color: C.coral },
  { Icon: FlagIcon, label: "Final Day", date: "12 Oktober 2026", note: "Babak final seluruh kategori lomba", color: C.orange },
  { Icon: MicrophoneIcon, label: "Talkshow & Expo", date: "13–14 Oktober 2026", note: "Link pendaftaran segera dibuka", color: C.blue },
  { Icon: PuzzlePieceIcon, label: "Fun Game", date: "14 Oktober 2026", note: "Link pendaftaran segera dibuka", color: C.lime },
  { Icon: ShoppingBagIcon, label: "Tenant Bazzar", date: "13–14 Oktober 2026", note: "Bazar produk, kuliner & merchandise", color: C.yellow },
];

/* ── Gelembung deterministik (hindari hydration mismatch) ──────────── */
function Bubbles({ count = 14, tint = "rgba(255,255,255,.5)" }) {
  const items = Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const rnd2 = ((i * 4099 + 7907) % 233280) / 233280;
    const size = 8 + Math.round(rnd * 22);
    return {
      left: Math.round((i / count) * 100 + rnd2 * 6) + "%",
      size,
      dur: (7 + rnd * 9).toFixed(1) + "s",
      delay: (rnd2 * 8).toFixed(1) + "s",
      bx: (rnd < 0.5 ? -1 : 1) * (10 + Math.round(rnd2 * 34)) + "px",
    };
  });
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {items.map((b, i) => (
        <span key={i} className="bubble" style={{
          left: b.left, width: b.size, height: b.size,
          background: tint, animationDuration: b.dur, animationDelay: b.delay,
          "--bx": b.bx,
        }} />
      ))}
    </div>
  );
}

/* ── Ikan drift ────────────────────────────────────────────────────── */
function Fish({ color = C.yellow, size = 46, top = "30%", dur = "26s", delay = "0s", flip = false }) {
  return (
    <div className="fish" style={{ top, animationDuration: dur, animationDelay: delay, "--fx": flip ? -1 : 1 }} aria-hidden="true">
      <svg width={size} height={size * 0.62} viewBox="0 0 50 31" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 15 Q14 2 32 6 Q46 9 48 15 Q46 21 32 24 Q14 28 2 15 Z" fill={color} stroke="#000" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M2 15 L-6 6 L-2 15 L-6 24 Z" transform="translate(8,0)" fill={color} stroke="#000" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="40" cy="13" r="2.4" fill="#000" />
      </svg>
    </div>
  );
}

/* ── Matahari ──────────────────────────────────────────────────────── */
function Sun({ size = 130 }) {
  const rays = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g className="spin-slow" style={{ transformBox: "fill-box" }}>
        {Array.from({ length: rays }, (_, i) => (
          <polygon key={i} points="50,4 55,18 45,18" fill={C.yellow} stroke="#000" strokeWidth="2" strokeLinejoin="round"
            transform={`rotate(${(360 / rays) * i}, 50, 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="26" fill={C.yellow} stroke="#000" strokeWidth="3" />
      <circle cx="50" cy="50" r="18" fill={C.orange} opacity=".55" />
    </svg>
  );
}

/* ── Starburst merah (alas judul) ──────────────────────────────────── */
function StarburstBig({ size = 360, color = C.coral }) {
  const n = 14;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 49 : 36;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points={pts.join(" ")} fill={color} stroke="#000" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Hibiscus ──────────────────────────────────────────────────────── */
function Hibiscus({ size = 74, color = C.coral }) {
  const n = 5;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx="30" cy="15" rx="9" ry="15" fill={color} stroke="#000" strokeWidth="2"
          transform={`rotate(${(360 / n) * i + 36}, 30, 30)`} />
      ))}
      <circle cx="30" cy="30" r="7" fill={C.yellow} stroke="#000" strokeWidth="2" />
    </svg>
  );
}

/* ── Awan ──────────────────────────────────────────────────────────── */
function Cloud({ size = 110 }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 100 55" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 45 Q4 45 6 33 Q8 22 20 24 Q22 8 38 10 Q50 2 60 12 Q76 6 80 22 Q96 22 94 36 Q92 46 78 45 Z"
        fill="#fff" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" opacity=".95" />
    </svg>
  );
}

/* ── Kerang & bintang laut (pantai) ────────────────────────────────── */
function Shell({ size = 54, color = C.coral }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M30 54 Q6 40 8 20 Q10 6 30 6 Q50 6 52 20 Q54 40 30 54 Z" fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
      {[18, 30, 42].map((x, i) => (
        <path key={i} d={`M30 12 Q${x} 34 30 52`} fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
      ))}
      <path d="M30 12 Q30 34 30 52" fill="none" stroke="#000" strokeWidth="1.6" opacity=".55" />
    </svg>
  );
}
function Starfish({ size = 60, color = C.orange }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 28 : 12;
    return `${(30 + r * Math.cos(a)).toFixed(1)},${(30 + r * Math.sin(a)).toFixed(1)}`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points={pts.join(" ")} fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
      {[[30, 18], [22, 32], [38, 32], [26, 40], [34, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="#000" opacity=".5" />
      ))}
    </svg>
  );
}

/* ── Jejak kaki di pasir ─────────────────────────────────────────────── */
function Footprint({ size = 30, color = "rgba(139,105,20,.4)", rotate = 0 }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)` }}>
      <ellipse cx="15" cy="27" rx="9" ry="14" fill={color} />
      {[[6, 6], [12, 2], [18, 2], [24, 6]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="3" ry="4.2" fill={color} />
      ))}
    </svg>
  );
}

/* ── Bunting: bendera segitiga ──────────────────────────────────────── */
function Bunting({ flags = 22, height = 34, sway = false }) {
  const w = flags * 46;
  return (
    <div className={sway ? "bunting-sway" : ""} style={{ width: "100%", overflow: "hidden", lineHeight: 0 }} aria-hidden="true">
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="3" x2={w} y2="3" stroke="#000" strokeWidth="3" />
        {Array.from({ length: flags }, (_, i) => (
          <polygon key={i} points={`${i * 46 + 4},4 ${i * 46 + 42},4 ${i * 46 + 23},${height - 4}`}
            fill={FLAG_COLORS[i % FLAG_COLORS.length]} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
        ))}
      </svg>
    </div>
  );
}

/* ── Gelombang ubin: bikin path periodik yang bisa di-loop mulus ──── */
function tiledWavePath(period, repeats, height, crestY, dipY) {
  let d = `M0,${height} L0,${crestY} Q${period / 2},${dipY} ${period},${crestY} `;
  for (let i = 1; i < repeats; i++) d += `T${period * (i + 1)},${crestY} `;
  d += `L${period * repeats},${height} Z`;
  return d;
}

/* ── Tekstur buih: sel-sel gelembung kecil berpola (deterministik) ── */
function foamCells(seed, n, w, h) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((i * 7919 + seed * 131) % 10000) / 10000;
    const b = ((i * 104729 + seed * 17) % 10000) / 10000;
    return { cx: (a * w).toFixed(1), cy: (h * 0.22 + b * h * 0.62).toFixed(1), r: (3 + b * 5).toFixed(1) };
  });
}
function FoamTexture({ id, w = 150, h = 46, n = 6 }) {
  const seed = Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      {foamCells(seed, n, w, h).map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#fff" opacity=".16" />)}
    </pattern>
  );
}

/* ── FoamDivider: buih ombak antar-section laut, bertekstur & bergerak (loop mulus) ── */
function FoamDivider({ top, bottom, flip = false, id = "foam" }) {
  // top = warna section atas, bottom = warna section bawah (yang buihnya)
  // SVG digambar lebih tinggi dari kotak keliatan (h), lalu digeser vertikal dalam
  // batas `pad` — fill-nya selalu nutup penuh jadi gak ada celah warna nongol pas ombak "surut-pasang".
  const h = 46;
  const pad = 10;
  const hSvg = h + pad * 2;
  return (
    <div style={{ lineHeight: 0, marginTop: -1, marginBottom: -1, height: h, transform: flip ? "scaleY(-1)" : "none", background: top, overflow: "hidden", position: "relative" }} aria-hidden="true">
      <div className="wave-surge" style={{ position: "absolute", top: -pad, left: 0, right: 0 }}>
        <svg className="wave-move" width="200%" height={hSvg} viewBox={`0 0 2400 ${hSvg}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <defs><FoamTexture id={id} h={hSvg} /></defs>
          <path d={tiledWavePath(150, 16, hSvg, 24 + pad, 4 + pad)} fill={bottom} stroke="#000" strokeWidth="3" />
          <path d={tiledWavePath(150, 16, hSvg, 24 + pad, 4 + pad)} fill={`url(#${id})`} stroke="none" />
          <path d={tiledWavePath(150, 16, hSvg, 30 + pad, 12 + pad)} fill="none" stroke="#fff" strokeWidth="3" opacity=".6" />
        </svg>
      </div>
    </div>
  );
}

/* ── Sinar cahaya menembus laut dalam ────────────────────────────── */
function LightShafts({ count = 3 }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="shaft" style={{
          position: "absolute", top: -60, left: `${12 + i * 32}%`, width: 90 + i * 14, height: "150%",
          background: "linear-gradient(180deg, rgba(255,255,255,.26), rgba(255,255,255,0) 78%)",
          transform: `rotate(${9 + i * 3}deg)`, animationDelay: `${i * 1.3}s`,
        }} />
      ))}
    </div>
  );
}

/* ── Hiu siluet: drift pelan di laut dalam ──────────────────────── */
function SharkSilhouette({ size = 130, color = "rgba(8,46,75,.5)", top = "70%", dur = "52s", delay = "0s" }) {
  return (
    <div className="fish" style={{ top, animationDuration: dur, animationDelay: delay, "--fx": 1 }} aria-hidden="true">
      <svg width={size} height={size * 0.46} viewBox="0 0 100 46" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 30 Q22 38 46 34 Q40 18 62 6 Q54 20 60 28 Q80 24 98 30 Q80 38 58 33 Q68 42 60 46 Q45 40 40 31 Q20 37 2 30 Z" fill={color} />
      </svg>
    </div>
  );
}

/* ── Lumba-lumba: melompat ────────────────────────────────────────── */
function Dolphin({ color = C.blue, size = 60, top = "40%", dur = "30s", delay = "0s", flip = false }) {
  return (
    <div className="fish" style={{ top, animationDuration: dur, animationDelay: delay, "--fx": flip ? -1 : 1 }} aria-hidden="true">
      <svg width={size} height={size * 0.6} viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 26 Q8 10 24 8 Q30 4 36 8 Q40 4 46 2 Q43 8 38 11 Q44 13 50 10 Q46 18 38 17 Q34 26 20 25 Q10 30 2 26 Z" fill={color} stroke="#000" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="15" cy="18" r="1.8" fill="#000" />
      </svg>
    </div>
  );
}

/* ── Kura-kura: gerak lambat di dasar ────────────────────────────── */
function Turtle({ size = 66, color = C.lime }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="14" cy="10" rx="8" ry="5" fill={color} stroke="#000" strokeWidth="2" transform="rotate(-28 14 10)" />
      <ellipse cx="14" cy="42" rx="8" ry="5" fill={color} stroke="#000" strokeWidth="2" transform="rotate(28 14 42)" />
      <ellipse cx="58" cy="14" rx="7" ry="4.4" fill={color} stroke="#000" strokeWidth="2" transform="rotate(24 58 14)" />
      <ellipse cx="58" cy="38" rx="7" ry="4.4" fill={color} stroke="#000" strokeWidth="2" transform="rotate(-24 58 38)" />
      <ellipse cx="34" cy="26" rx="24" ry="16" fill={color} stroke="#000" strokeWidth="2.5" />
      <path d="M22 26 Q34 20 46 26 M22 26 Q34 32 46 26 M34 12 L34 40" fill="none" stroke="#000" strokeWidth="1.3" opacity=".45" />
      <circle cx="9" cy="24" r="6" fill={color} stroke="#000" strokeWidth="2.2" />
    </svg>
  );
}

/* ── Karang: dekor statis di sudut dasar laut ────────────────────── */
function Coral({ size = 90, color = C.coral }) {
  const branches = ["M30 74 Q28 48 30 40", "M30 50 Q16 42 12 20", "M30 46 Q44 36 46 14", "M30 40 Q30 22 30 6"];
  return (
    <svg width={size} height={size} viewBox="0 0 60 74" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {branches.map((d, i) => <path key={"o" + i} d={d} fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />)}
      {branches.map((d, i) => <path key={"c" + i} d={d} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />)}
    </svg>
  );
}

/* ── Scallop tenda ─────────────────────────────────────────────────── */
function awningStyle(color) {
  return {
    awning: { background: `repeating-linear-gradient(90deg, ${color} 0 22px, #fff 22px 44px)` },
    scallop: { backgroundImage: `radial-gradient(circle at 14px 0, ${color} 13px, transparent 14px)` },
  };
}

/* ── Section heading ────────────────────────────────────────────────── */
function SectionHead({ tag, tagColor = C.coral, tagTextColor = "#fff", headline, sub, center = false, dark = false }) {
  return (
    <div style={{ marginBottom: 44, textAlign: center ? "center" : "left" }} data-reveal>
      <span className="k-tag" style={{ background: tagColor, color: tagTextColor, marginBottom: 14, display: "inline-flex" }}>{tag}</span>
      <h2 className="fd" style={{ fontSize: "clamp(1.7rem,3.2vw,2.4rem)", fontWeight: 600, color: dark ? "#fff" : C.navy, lineHeight: 1.1 }}>
        {headline}
      </h2>
      {sub && <p className="fb" style={{ color: dark ? "rgba(255,255,255,.62)" : C.muted, fontSize: 14, fontWeight: 500, marginTop: 10, lineHeight: 1.75, maxWidth: 520, margin: center ? "10px auto 0" : "10px 0 0" }}>{sub}</p>}
    </div>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────────── */
function Navbar({ open, setOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { l: "Tentang", h: "#about" },
    { l: "Acara", h: "#acara" },
    { l: "Lomba", h: "#lomba" },
    { l: "Tata Cara", h: "#tatacara" },
    { l: "Jadwal", h: "#timeline" },
    { l: "Hasil", h: "#hasil" },
  ];

  return (
    <nav className="fb" style={{
      position: "sticky", top: 0, zIndex: 60,
      background: "rgba(253,245,228,.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: "3px solid #000",
      boxShadow: scrolled ? "0 4px 0 rgba(0,0,0,.14)" : "none", transition: "box-shadow .3s ease",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <a href="#hero" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blue, border: "2.5px solid #000", boxShadow: "2px 2px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <Image src="/itfest-logo.png" alt="IT FEST 6.0" width={28} height={28} style={{ objectFit: "contain" }} />
          </div>
          <div>
            <div className="fd" style={{ color: C.navy, fontSize: 17, fontWeight: 600, lineHeight: 1.1 }}>IT FEST 6.0</div>
            <div className="fb" style={{ color: C.muted, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700 }}>Universitas Paramadina</div>
          </div>
        </a>

        <div className="nav-links" style={{ alignItems: "center", gap: 26 }}>
          {links.map(({ l, h }) => (
            <a key={h} href={h} className="fd" style={{ color: C.navy, fontSize: 15, fontWeight: 500, textDecoration: "none" }}>{l}</a>
          ))}
          <a href="/events" className="k-btn fd" style={{ background: C.coral, color: "#fff", fontSize: 14, padding: "9px 22px" }}>
            Daftar Lomba
          </a>
        </div>

        <button className="nav-burger" onClick={() => setOpen(v => !v)} aria-label={open ? "Tutup" : "Buka menu"}
          style={{ background: open ? C.navy : "#fff", border: "2.5px solid #000", borderRadius: 10, width: 42, height: 42, alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: open ? "none" : "2px 2px 0 #000", flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke={open ? "#fff" : C.navy} strokeWidth="2.4" strokeLinecap="round">
            {open ? <><line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" /></>
              : <><line x1="2" y1="5" x2="16" y2="5" /><line x1="2" y1="9.5" x2="16" y2="9.5" /><line x1="2" y1="14" x2="16" y2="14" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="fb" style={{ background: "#fff", borderTop: "3px solid #000" }}>
          <div style={{ padding: "8px 20px 0" }}>
            {links.map(({ l, h }, i) => (
              <a key={h} href={h} onClick={() => setOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0", textDecoration: "none", borderBottom: "1.5px solid #E2E8F0" }}>
                <span style={{ width: 12, height: 12, borderRadius: 99, background: FLAG_COLORS[i % FLAG_COLORS.length], border: "2px solid #000", flexShrink: 0 }} />
                <span className="fd" style={{ color: C.navy, fontWeight: 600, fontSize: 17 }}>{l}</span>
                <ArrowRightIcon width={15} height={15} strokeWidth={2.5} style={{ marginLeft: "auto", color: C.muted }} />
              </a>
            ))}
          </div>
          <div style={{ padding: "16px 20px 20px" }}>
            <a href="/events" onClick={() => setOpen(false)} className="k-btn fd"
              style={{ display: "flex", background: C.coral, color: "#fff", padding: "15px", fontSize: 16, borderRadius: 16 }}>
              <TrophyIcon width={19} height={19} strokeWidth={2.2} /> Daftar Lomba Sekarang
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PERJALANAN: 1. PERMUKAAN LAUT (hero)
   ══════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section id="hero" className="sec" style={{ background: `linear-gradient(180deg, #9BE0F2 0%, ${C.seaLight} 58%, ${C.blue} 100%)`, borderBottom: "3px solid #000", overflow: "hidden" }}>
      <div className="hero-sky px-mid" style={{ position: "absolute", top: 64, right: "8%" }} aria-hidden="true">
        <div className="hero-anim" style={{ animationDelay: "100ms" }}><Sun size={130} /></div>
      </div>
      <div className="hero-sky drift px-slow" style={{ position: "absolute", top: 90, left: "4%" }} aria-hidden="true"><Cloud size={120} /></div>
      <div className="hero-sky drift px-slow" style={{ position: "absolute", top: 210, right: "28%", animationDelay: "3s" }} aria-hidden="true"><Cloud size={80} /></div>

      <div className="container" style={{ paddingTop: 72, paddingBottom: 40, position: "relative", zIndex: 2 }}>
        <div className="hero-grid">
          <div>
            <div className="hero-anim" style={{ animationDelay: "60ms" }}>
              <span className="k-tag" style={{ background: C.yellow, color: C.navy }}>
                Festival Teknologi · 27 Jul – 14 Okt 2026
              </span>
            </div>

            <div className="hero-anim" style={{ animationDelay: "160ms", position: "relative", display: "inline-block", marginTop: 78, padding: "30px 20px" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", filter: "drop-shadow(5px 6px 0 rgba(0,0,0,.25))" }} aria-hidden="true">
                <div className="spin-slow" style={{ animationDuration: "40s" }}><StarburstBig size={360} /></div>
              </div>
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h1 className="fd groovy" style={{ fontSize: "clamp(3.2rem,9vw,5.8rem)", fontWeight: 700, lineHeight: .9, textAlign: "center" }}>
                  IT FEST<br />6.0
                </h1>
              </div>
            </div>

            <div className="hero-anim" style={{ animationDelay: "280ms", marginTop: 20 }}>
              <span className="ribbon fb" style={{ fontSize: "clamp(.8rem,1.5vw,1rem)", fontWeight: 700, lineHeight: 1.5 }}>
                Human-Centered AI: Transforming the World with Integrity
              </span>
            </div>

            <p className="fb hero-anim" style={{ animationDelay: "360ms", color: C.navy, fontSize: 14.5, fontWeight: 600, marginTop: 20, maxWidth: 470, lineHeight: 1.8 }}>
              Ride the wave of creativity — lomba, talkshow, expo, fun game, dan bazzar
              dari HIMTI &amp; Prodi Teknik Informatika Universitas Paramadina.
            </p>

            <div className="hero-anim hero-cta-row" style={{ animationDelay: "440ms", display: "flex", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
              <a href="/events" className="k-btn fd" style={{ background: C.coral, color: "#fff", fontSize: 15, padding: "13px 30px" }}>
                <TrophyIcon width={18} height={18} strokeWidth={2.2} /> Daftar Sekarang
              </a>
              <a href="#about" className="k-btn fd" style={{ background: "#fff", color: C.navy, fontSize: 15, padding: "13px 30px" }}>
                Mulai Menyelam ↓
              </a>
            </div>

            <div className="hero-anim" style={{ animationDelay: "520ms", display: "inline-flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              {[
                { I: MapPinIcon, t: "Universitas Paramadina", bg: C.lime },
                { I: CalendarIcon, t: "27 Jul – 14 Okt 2026", bg: C.yellow },
              ].map((m, i) => (
                <span key={i} className="fb" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: m.bg, color: C.navy, fontSize: 12, fontWeight: 800, padding: "8px 15px", borderRadius: 10, border: "2.5px solid #000", boxShadow: "3px 3px 0 #000", transform: `rotate(${i === 0 ? -1.2 : 1}deg)` }}>
                  <m.I width={14} height={14} strokeWidth={2.5} /> {m.t}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-beach hero-anim" style={{ animationDelay: "300ms", position: "relative", minHeight: 440 }}>
            <div className="px-slow bob" style={{ position: "absolute", bottom: 20, right: "2%", width: 420, maxWidth: "none" }}>
              <Image src="/itfest-logo-hero.png" alt="Logo IT FEST 6.0" width={420} height={207} style={{ width: "100%", height: "auto", maxWidth: "none", objectFit: "contain", filter: "drop-shadow(6px 8px 0 rgba(0,0,0,.25))" }} />
            </div>
            <div className="bob" style={{ position: "absolute", bottom: 40, left: "18%", animationDelay: "1.4s" }}><Hibiscus size={68} /></div>
            <div className="bob" style={{ position: "absolute", top: 40, right: "16%", animationDelay: "2.2s" }}><Hibiscus size={48} color={C.orange} /></div>
          </div>
        </div>
      </div>

      {/* Permukaan air pecah ke bawah — air bergerak, loop mulus */}
      <div style={{ position: "relative", zIndex: 2, marginTop: 10, overflow: "hidden" }} aria-hidden="true">
        <svg className="wave-move" width="200%" height="54" viewBox="0 0 2400 54" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path d={tiledWavePath(120, 20, 54, 30, 6)} fill="#fff" opacity=".55" />
          <path d={tiledWavePath(150, 16, 54, 38, 16)} fill={C.blue} stroke="#000" strokeWidth="3" />
        </svg>
      </div>
    </section>
  );
}

/* ── Ticker (papan tepi dermaga) ───────────────────────────────────── */
function Ticker() {
  const items = ["IT FEST 6.0", "Ride the Wave of Creativity", "Universitas Paramadina", "Hackathon · IoT · KTI", "27 Juli – 14 Oktober 2026", "Human-Centered AI"];
  const d = [...items, ...items];
  return (
    <div className="ticker-wrap fb" style={{ background: C.yellow, borderTop: "3px solid #000", borderBottom: "3px solid #000", padding: "12px 0" }}>
      <div className="ticker-track">
        {d.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 24px", color: C.navy, fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap", letterSpacing: ".06em", textTransform: "uppercase" }}>
            {t}<span style={{ opacity: .35, marginLeft: 10, fontSize: 13 }}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. TEPAT DI BAWAH PERMUKAAN (about) — biru laut terang
   ══════════════════════════════════════════════════════════════════════ */
function About() {
  return (
    <section id="about" className="sec" style={{ background: C.blue, padding: "76px 0 84px", overflow: "hidden" }}>
      <Bubbles count={12} />
      <Fish color={C.yellow} size={44} top="18%" dur="30s" delay="1s" />
      <Fish color={C.coral} size={34} top="72%" dur="38s" delay="6s" flip />
      <Dolphin color="#fff" size={54} top="45%" dur="34s" delay="3s" />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="about-grid">
          <div>
            <SectionHead
              dark
              tag="Menyelam ke Cerita"
              tagColor={C.yellow}
              tagTextColor={C.navy}
              headline={<>Apa itu <span style={{ color: C.yellow }}>IT FEST 6.0?</span></>}
            />
            <p className="fb" data-reveal style={{ color: C.navy, fontSize: 15, lineHeight: 1.85, fontWeight: 500, marginBottom: 16 }}>
              IT Fest 6.0 adalah festival teknologi yang diselenggarakan oleh{" "}
              <strong style={{ color: "#04141f" }}>Himpunan Mahasiswa Teknik Informatika dan Prodi Teknik Informatika Universitas Paramadina</strong>{" "}
              dengan tema{" "}
              <strong style={{ color: "#04141f" }}>&ldquo;Human-Centered AI: Transforming the World with Integrity&rdquo;</strong>.
            </p>
            <p className="fb" data-reveal style={{ "--reveal-delay": "80ms", color: "rgba(8,46,75,.92)", fontSize: 14, lineHeight: 1.85, fontWeight: 500 }}>
              Perlombaan IT FEST 6.0 <strong style={{ color: C.navy }}>khusus untuk mahasiswa</strong> — daftar via website ini. Talkshow, Expo, dan Fun Game terbuka untuk umum via Google Form.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { Icon: AcademicCapIcon, label: "Lomba — Khusus Mahasiswa", color: C.blue, note: "Daftar via website ini", items: ["Hackathon", "Internet of Things", "Karya Tulis Ilmiah"] },
              { Icon: MicrophoneIcon, label: "Talkshow, Expo & Fun Game", color: C.lime, note: "Daftar via Google Form", items: ["Terbuka untuk umum & SMA/SMK"] },
            ].map((a, i) => {
              const st = awningStyle(a.color);
              return (
                <div key={i} className="booth" data-reveal style={{ "--reveal-delay": `${i * 110}ms` }}>
                  <div className="awning" style={st.awning}><div className="awning-scallop" style={st.scallop} /></div>
                  <div style={{ padding: "30px 24px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2.5px solid #000", boxShadow: "2px 2px 0 #000" }}>
                        <a.Icon width={21} height={21} strokeWidth={2.2} style={{ color: a.color === C.lime ? C.navy : "#fff" }} />
                      </div>
                      <span className="fd" style={{ color: C.navy, fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{a.label}</span>
                    </div>
                    <div className="fb" style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>{a.note}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {a.items.map((item, j) => (
                        <span key={j} className="fb" style={{ fontSize: 11.5, fontWeight: 700, padding: "5px 13px", borderRadius: 99, background: a.color, color: a.color === C.lime || a.color === C.yellow ? C.navy : "#fff", border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}>{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. LAUT DALAM (acara) — biru tua, banyak gelembung + ikan
   ══════════════════════════════════════════════════════════════════════ */
function Acara() {
  return (
    <>
      <FoamDivider top={C.blue} bottom={C.seaDeep} id="foam-1" />
      <section id="acara" className="sec" style={{ background: `linear-gradient(180deg, ${C.seaDeep} 0%, #14688A 100%)`, padding: "64px 0 84px", overflow: "hidden" }}>
        <LightShafts count={3} />
        <Bubbles count={18} tint="rgba(255,255,255,.42)" />
        <Fish color={C.orange} size={50} top="14%" dur="34s" delay="0s" />
        <Fish color={C.lime} size={38} top="46%" dur="42s" delay="4s" flip />
        <Fish color={C.yellow} size={30} top="80%" dur="28s" delay="9s" />
        <SharkSilhouette top="64%" size={140} dur="55s" />
        <Dolphin color={C.lime} size={50} top="30%" dur="40s" delay="7s" flip />
        <div className="bob" style={{ position: "absolute", bottom: 24, left: "6%", animationDelay: "2s" }}><Turtle size={58} /></div>
        <div style={{ position: "absolute", bottom: -6, left: "-10px" }}><Coral size={84} color={C.coral} /></div>
        <div style={{ position: "absolute", bottom: -6, right: "-10px" }}><Coral size={70} color={C.orange} /></div>

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <SectionHead
            center dark
            tag="Menyelam Lebih Dalam"
            tagColor={C.yellow}
            tagTextColor={C.navy}
            headline={<>Enam <span style={{ color: C.yellow }}>Ombak Acara</span> IT FEST</>}
            sub="Rangkaian kegiatan utama festival — masing-masing punya panggungnya sendiri."
          />
          <div className="acara-grid">
            {ACARA.map((a, i) => {
              const st = awningStyle(a.color);
              const inner = (
                <>
                  <div className="awning" style={{ ...st.awning, height: 34 }}>
                    <div className="awning-scallop" style={{ ...st.scallop, height: 14, backgroundSize: "24px 14px", bottom: -14 }} />
                  </div>
                  <div style={{ padding: "28px 12px 20px", textAlign: "center" }}>
                    <div style={{ width: 50, height: 50, borderRadius: 13, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: "2.5px solid #000", boxShadow: "3px 3px 0 #000" }}>
                      <a.Icon width={24} height={24} strokeWidth={2.2} style={{ color: a.tc }} />
                    </div>
                    <div className="fd" style={{ color: C.navy, fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.2 }}>{a.label}</div>
                    <div className="fb" style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 99, display: "inline-block", background: C.sand, color: C.navy, border: "2px solid #000", letterSpacing: ".04em", textTransform: "uppercase" }}>
                      {a.sub}
                    </div>
                  </div>
                </>
              );
              return (
                <div key={i} data-reveal style={{ "--reveal-delay": `${i * 70}ms` }}>
                  {a.href ? (
                    <a href={a.href} target="_blank" rel="noopener noreferrer" className="booth" style={{ display: "block", textDecoration: "none" }}>{inner}</a>
                  ) : (
                    <div className="booth">{inner}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   4. NAIK KE PERAIRAN DANGKAL (lomba) — turquoise
   ══════════════════════════════════════════════════════════════════════ */
function Lomba() {
  return (
    <>
      <FoamDivider top="#14688A" bottom={C.seaLight} id="foam-2" />
      <section id="lomba" className="sec" style={{ background: `linear-gradient(180deg, ${C.seaLight} 0%, #7FD6EA 100%)`, padding: "72px 0 92px", overflow: "hidden" }}>
        <Bubbles count={18} tint="rgba(255,255,255,.55)" />
        <Fish color={C.coral} size={40} top="16%" dur="32s" delay="2s" />
        <Fish color={C.navy} size={30} top="34%" dur="40s" delay="8s" flip />
        <Fish color={C.yellow} size={36} top="86%" dur="27s" delay="12s" />
        <Dolphin color="#fff" size={48} top="76%" dur="36s" delay="5s" flip />
        <div className="bob" style={{ position: "absolute", top: "9%", right: "4%" }} aria-hidden="true"><Starfish size={44} color={C.yellow} /></div>
        <div className="bob" style={{ position: "absolute", top: "48%", left: "3%", animationDelay: "1.4s" }} aria-hidden="true"><Shell size={38} color={C.navy} /></div>
        <div style={{ position: "absolute", bottom: -6, left: "-8px" }} aria-hidden="true"><Coral size={64} color={C.orange} /></div>
        <div style={{ position: "absolute", bottom: -6, right: "-8px" }} aria-hidden="true"><Coral size={56} color={C.coral} /></div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <SectionHead
            tag="Naik ke Permukaan"
            tagColor={C.coral}
            tagTextColor="#fff"
            headline={<>Pilih <span style={{ color: C.coral }}>Booth Lombamu</span></>}
            sub={<>Pendaftaran dibuka <strong style={{ color: C.navy }}>27 Juli – 14 Agustus 2026</strong> untuk semua kategori. Khusus mahasiswa.</>}
          />
          <div className="lomba-grid">
            {LOMBA.map((item, i) => {
              const st = awningStyle(item.color);
              return (
                <div key={i} className="booth" data-reveal style={{ "--reveal-delay": `${i * 90}ms`, display: "flex", flexDirection: "column" }}>
                  <div className="awning" style={st.awning}><div className="awning-scallop" style={st.scallop} /></div>
                  <div style={{ padding: "34px 26px 26px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 54, height: 54, borderRadius: 15, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}>
                        <item.Icon width={27} height={27} strokeWidth={2.2} style={{ color: item.tc }} />
                      </div>
                      <div>
                        <h3 className="fd" style={{ color: C.navy, fontSize: 23, fontWeight: 600, lineHeight: 1.1 }}>{item.title}</h3>
                        <span className="fb" style={{ fontSize: 10.5, fontWeight: 800, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>Khusus Mahasiswa</span>
                      </div>
                    </div>
                    <p className="fb" style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.8, fontWeight: 500, marginBottom: 22, flex: 1 }}>{item.desc}</p>
                    <a href="/events" className="k-btn fd" style={{ background: item.color, color: item.tc, fontSize: 14, padding: "12px 20px", borderRadius: 14 }}>
                      Daftar Sekarang <ArrowRightIcon width={16} height={16} strokeWidth={2.5} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5. BAZZAR — kotak harta di dasar dangkal
   ══════════════════════════════════════════════════════════════════════ */
function Bazzar() {
  return (
    <section className="sec" style={{ background: "#7FD6EA", padding: "16px 0 64px", position: "relative" }}>
      <div className="container" style={{ maxWidth: 560, textAlign: "center", position: "relative", zIndex: 1 }}>
        <div className="booth" data-reveal style={{ background: "#fff" }}>
          <div className="awning" style={awningStyle(C.orange).awning}>
            <div className="awning-scallop" style={awningStyle(C.orange).scallop} />
          </div>
          <div style={{ padding: "36px 36px 32px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}>
              <ShoppingBagIcon width={30} height={30} strokeWidth={2} style={{ color: "#fff" }} />
            </div>
            <h3 className="fd" style={{ color: C.navy, fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Tenant Bazzar</h3>
            <p className="fb" style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.8, marginBottom: 22 }}>
              Jadilah bagian dari Bazzar IT FEST 6.0! Informasi ketentuan dan biaya tenant akan segera diumumkan.
            </p>
            <span className="fd k-tag" style={{ background: C.orange, color: "#fff", fontSize: 12, transform: "rotate(-1deg)" }}>
              13–14 Oktober 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5.5 TATA CARA — filter per tahap, masih di air dangkal
   ══════════════════════════════════════════════════════════════════════ */
function TataCara() {
  const [active, setActive] = useState(TATA_CARA[0].value);
  const current = TATA_CARA.find((t) => t.value === active);
  const embedUrl = youtubeEmbedUrl(current.video);

  return (
    <section id="tatacara" className="sec" style={{ background: "#7FD6EA", padding: "16px 0 72px", position: "relative", overflow: "hidden" }}>
      <Bubbles count={16} tint="rgba(255,255,255,.5)" />
      <Fish color={C.coral} size={36} top="12%" dur="34s" delay="1s" />
      <Fish color={C.navy} size={28} top="52%" dur="44s" delay="9s" flip />
      <Fish color={C.yellow} size={32} top="80%" dur="29s" delay="4s" />
      <Dolphin color="#fff" size={44} top="66%" dur="38s" delay="6s" flip />
      <div className="bob" style={{ position: "absolute", top: "8%", left: "4%" }} aria-hidden="true"><Starfish size={40} color={C.orange} /></div>
      <div className="bob" style={{ position: "absolute", top: "38%", right: "3.5%", animationDelay: "1.6s" }} aria-hidden="true"><Shell size={36} color={C.navy} /></div>
      <div className="bob" style={{ position: "absolute", bottom: "22%", left: "6%", animationDelay: "2.8s" }} aria-hidden="true"><Hibiscus size={44} /></div>
      <div style={{ position: "absolute", bottom: -6, left: "-10px" }} aria-hidden="true"><Coral size={58} color={C.lime} /></div>
      <div style={{ position: "absolute", bottom: -6, right: "-10px" }} aria-hidden="true"><Coral size={66} color={C.coral} /></div>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <SectionHead
          center
          tag="Sebelum Menyelam"
          tagColor={C.navy}
          tagTextColor="#fff"
          headline={<>Tata Cara <span style={{ color: C.coral }}>Pendaftaran</span></>}
          sub="Pilih tahap yang mau kamu baca. Pendaftaran sama untuk semua kategori, cara pengumpulan karyanya berbeda-beda."
        />

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 30 }} data-reveal>
          {TATA_CARA.map((t) => (
            <button
              key={t.value}
              onClick={() => setActive(t.value)}
              className="fd k-tag"
              aria-pressed={active === t.value}
              style={{
                cursor: "pointer", border: "2.5px solid #000", transform: "none",
                background: active === t.value ? t.color : "#fff",
                color: active === t.value ? t.tc : C.navy,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="booth" data-reveal style={{ maxWidth: 640, margin: "0 auto", background: "#fff" }}>
          <div className="awning" style={awningStyle(current.color).awning}>
            <div className="awning-scallop" style={awningStyle(current.color).scallop} />
          </div>
          <div style={{ padding: "34px 28px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 22 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: current.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2.5px solid #000", boxShadow: "3px 3px 0 #000" }}>
                <current.Icon width={24} height={24} strokeWidth={2.2} style={{ color: current.tc }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="fd" style={{ color: C.navy, fontSize: 20, fontWeight: 600, lineHeight: 1.15 }}>{current.label}</h3>
                <p className="fb" style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginTop: 2 }}>{current.ringkas}</p>
              </div>
            </div>

            {embedUrl ? (
              <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden", border: "2.5px solid #000", boxShadow: "4px 4px 0 #000", marginBottom: 22, background: "#000" }}>
                <iframe
                  src={embedUrl}
                  title={`Video ${current.label}`}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                />
              </div>
            ) : (
              <div style={{ aspectRatio: "16 / 9", borderRadius: 14, border: "2.5px dashed #000", marginBottom: 22, background: C.sand, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: 16 }}>
                <ClockIcon width={26} height={26} strokeWidth={2} style={{ color: C.navy }} />
                <p className="fd" style={{ color: C.navy, fontSize: 15, fontWeight: 600 }}>Video panduan menyusul</p>
                <p className="fb" style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>Sementara ikuti langkah tertulis di bawah ini.</p>
              </div>
            )}

            <ol style={{ display: "flex", flexDirection: "column", gap: 14, listStyle: "none", margin: 0, padding: 0 }}>
              {current.langkah.map((teks, i) => (
                <li key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <span
                    className="fd"
                    style={{
                      width: 28, height: 28, flexShrink: 0, borderRadius: 9, background: current.color, color: current.tc,
                      border: "2px solid #000", boxShadow: "2px 2px 0 #000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="fb" style={{ color: C.navy, fontSize: 13.5, fontWeight: 500, lineHeight: 1.75 }}>{teks}</p>
                </li>
              ))}
            </ol>

            <a href="/events" className="k-btn fd" style={{ background: current.color, color: current.tc, fontSize: 14, padding: "12px 20px", borderRadius: 14, marginTop: 24 }}>
              {current.value === "DAFTAR" ? "Mulai Daftar" : "Ke Halaman Lomba"}{" "}
              <ArrowRightIcon width={16} height={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   6. MENEPI KE PANTAI (timeline) — pasir basah → kering
   ══════════════════════════════════════════════════════════════════════ */
function Timeline() {
  const tc = (bg) => (bg === C.yellow || bg === C.lime ? C.navy : "#fff");
  return (
    <>
      {/* buih terakhir sebelum menyentuh pasir */}
      <FoamDivider top="#7FD6EA" bottom={C.wetSand} id="foam-3" />
      <section id="timeline" className="sec" style={{ background: `linear-gradient(180deg, ${C.wetSand} 0%, ${C.sand} 45%)`, padding: "70px 0 92px", position: "relative", overflow: "hidden" }}>
        <div className="sand-grain" aria-hidden="true" />
        <div className="footprint" style={{ position: "absolute", top: "58%", left: "6%" }} aria-hidden="true"><Footprint size={26} rotate={-8} /></div>
        <div className="footprint" style={{ position: "absolute", top: "64%", left: "10.5%" }} aria-hidden="true"><Footprint size={26} rotate={6} /></div>
        <div className="bob" style={{ position: "absolute", top: "20%", right: "5%", animationDelay: "1.2s" }} aria-hidden="true"><Shell size={40} color={C.blue} /></div>
        <div className="bob" style={{ position: "absolute", bottom: "8%", right: "10%", animationDelay: "2.6s" }} aria-hidden="true"><Starfish size={44} /></div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <SectionHead center
            tag="Menepi ke Pantai"
            tagColor={C.lime}
            tagTextColor={C.navy}
            headline={<>Ikuti <span style={{ color: C.coral }}>Jejaknya</span> Sampai Puncak</>}
            sub="Rangkaian kegiatan lengkap dari pendaftaran hingga hari puncak festival."
          />
          <div className="rute">
            <span className="rute-spine" aria-hidden="true" />
            {TIMELINE.map((item, i) => {
              const card = (
                <div className="rute-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <h3 className="fd" style={{ color: C.navy, fontSize: 16.5, fontWeight: 600, lineHeight: 1.25 }}>{item.label}</h3>
                    <span className="fb" style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99, background: item.color, color: tc(item.color), border: "2px solid #000", boxShadow: "2px 2px 0 #000", whiteSpace: "nowrap" }}>
                      {item.date}
                    </span>
                  </div>
                  <p className="fb" style={{ color: C.muted, fontSize: 12.5, fontWeight: 500, lineHeight: 1.65, marginTop: 8 }}>{item.note}</p>
                </div>
              );
              return (
                <div key={i} className="rute-row" data-reveal style={{ "--reveal-delay": `${i * 80}ms` }}>
                  <span className="rute-node" style={{ background: item.color }}>
                    <item.Icon width={22} height={22} strokeWidth={2.2} style={{ color: tc(item.color) }} />
                  </span>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>{card}</a>
                  ) : card}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   6.5 PAPAN PENGUMUMAN (hasil) — pasir kering, sebelum footer
   ══════════════════════════════════════════════════════════════════════ */
function Hasil() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(HASIL_KATEGORI[0].value);

  useEffect(() => {
    Promise.all(
      HASIL_KATEGORI.map((k) =>
        fetch(`/api/finalists/${k.value}`)
          .then((r) => r.json())
          .then((d) => [k.value, d])
          .catch(() => [k.value, { published: false, finalists: [] }]),
      ),
    ).then((entries) => {
      setData(Object.fromEntries(entries));
      setLoading(false);
    });
  }, []);

  const current = HASIL_KATEGORI.find((k) => k.value === active);
  const result = data[active];

  return (
    <section id="hasil" className="sec" style={{ background: C.sand, padding: "70px 0 84px", position: "relative", overflow: "hidden" }}>
      <div className="sand-grain" aria-hidden="true" />
      <div className="bob" style={{ position: "absolute", top: "12%", left: "6%" }} aria-hidden="true"><Hibiscus size={54} /></div>
      <div className="bob" style={{ position: "absolute", top: "18%", right: "7%", animationDelay: "1.8s" }} aria-hidden="true"><Starfish size={46} color={C.orange} /></div>
      <div className="bob" style={{ position: "absolute", bottom: "10%", left: "9%", animationDelay: "3s" }} aria-hidden="true"><Shell size={38} color={C.coral} /></div>
      <div className="footprint" style={{ position: "absolute", bottom: "16%", right: "13%" }} aria-hidden="true"><Footprint size={24} rotate={10} /></div>
      <div className="footprint" style={{ position: "absolute", bottom: "10%", right: "9%" }} aria-hidden="true"><Footprint size={24} rotate={-4} /></div>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <SectionHead
          center
          tag="Papan Pengumuman"
          tagColor={C.coral}
          tagTextColor="#fff"
          headline={<>Siapa yang <span style={{ color: C.coral }}>Lolos ke Final?</span></>}
          sub="Hasil seleksi tiap kategori, diperbarui langsung sama panitia begitu penjurian selesai."
        />

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 30 }} data-reveal>
          {HASIL_KATEGORI.map((k) => (
            <button
              key={k.value}
              onClick={() => setActive(k.value)}
              className="fd k-tag"
              style={{
                cursor: "pointer", border: "2.5px solid #000", transform: "none",
                background: active === k.value ? k.color : "#fff",
                color: active === k.value ? k.tc : C.navy,
              }}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="booth" data-reveal style={{ maxWidth: 600, margin: "0 auto", background: "#fff" }}>
          <div className="awning" style={awningStyle(current.color).awning}>
            <div className="awning-scallop" style={awningStyle(current.color).scallop} />
          </div>
          <div style={{ padding: "34px 30px 30px" }}>
            {loading ? (
              <p className="fb" style={{ color: C.muted, fontSize: 14, fontWeight: 600, textAlign: "center" }}>Memuat hasil...</p>
            ) : !result?.published ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: C.sand, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", border: "2.5px solid #000", boxShadow: "3px 3px 0 #000" }}>
                  <ClockIcon width={26} height={26} strokeWidth={2} style={{ color: C.navy }} />
                </div>
                <p className="fd" style={{ color: C.navy, fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Belum diumumkan</p>
                <p className="fb" style={{ color: C.muted, fontSize: 13, fontWeight: 500, lineHeight: 1.7 }}>
                  {result?.announceAt ? (
                    <>Hasil {current.label} lagi dinilai juri. Pengumuman diinfokan lewat website ini pada tanggal{" "}
                      <strong style={{ color: C.navy }}>{formatTanggalPengumuman(result.announceAt)}</strong>.</>
                  ) : (
                    <>Hasil {current.label} lagi diseleksi panitia & dinilai juri. Pantau terus halaman ini ya!</>
                  )}
                </p>
              </div>
            ) : (
              <>
                <p className="fb" style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".1em", textAlign: "center", marginBottom: 18 }}>
                  Top 5 Finalis — {current.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.finalists.map((f) => (
                    <div key={f.rank} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: C.sand, border: "2px solid #000" }}>
                      <span className="fd" style={{ fontSize: 20, fontWeight: 700, color: C.coral, width: 28, flexShrink: 0 }}>#{f.rank}</span>
                      <div style={{ minWidth: 0 }}>
                        <p className="fd" style={{ color: C.navy, fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{f.namaTim}</p>
                        <p className="fb" style={{ color: C.muted, fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>{f.judulKarya}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="fb" style={{ color: C.muted, fontSize: 11.5, fontWeight: 600, lineHeight: 1.7, textAlign: "center", marginTop: 18 }}>
                  Nama timmu gak ada di atas? Berarti belum lolos ke babak final {current.label} tahun ini — makasih udah ikut berjuang, sampai jumpa di IT FEST berikutnya!
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   7. TIBA DI PANTAI (footer) — pasir + langit senja
   ══════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="sec" style={{ position: "relative" }}>
      {/* Bibir pantai: pasir dengan kerang & bintang laut */}
      <div style={{ background: C.sand, position: "relative", overflow: "hidden" }}>
        <div className="sand-grain" aria-hidden="true" />
        <div className="bob" style={{ position: "absolute", top: 18, left: "8%" }} aria-hidden="true"><Shell size={46} color={C.coral} /></div>
        <div className="bob" style={{ position: "absolute", top: 40, right: "12%", animationDelay: "1.6s" }} aria-hidden="true"><Starfish size={54} /></div>
        <div className="bob" style={{ position: "absolute", bottom: 22, left: "22%", animationDelay: "2.4s" }} aria-hidden="true"><Shell size={34} color={C.blue} /></div>
        <div className="bob" style={{ position: "absolute", top: 70, left: "42%", animationDelay: "0.8s" }} aria-hidden="true"><Hibiscus size={40} color={C.orange} /></div>
        <div className="footprint" style={{ position: "absolute", bottom: 16, right: "20%" }} aria-hidden="true"><Footprint size={22} rotate={-6} /></div>
        <div className="footprint" style={{ position: "absolute", bottom: 10, right: "16%" }} aria-hidden="true"><Footprint size={22} rotate={8} /></div>

        <div className="container" style={{ padding: "44px 24px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <span className="k-tag" style={{ background: C.coral, color: "#fff", display: "inline-flex" }}>Sampai Jumpa di Pantai</span>
          <h2 className="fd" style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 600, color: C.navy, marginTop: 14, lineHeight: 1.15 }}>
            Ombaknya nunggu — <span style={{ color: C.coral }}>ayo naik!</span>
          </h2>
          <a href="/events" className="k-btn fd" style={{ background: C.coral, color: "#fff", fontSize: 15, padding: "13px 30px", marginTop: 20 }}>
            <TrophyIcon width={18} height={18} strokeWidth={2.2} /> Daftar Lomba Sekarang
          </a>
        </div>
      </div>

      {/* Garis pantai ke langit senja */}
      <div style={{ lineHeight: 0, background: C.sand }} aria-hidden="true">
        <svg width="100%" height="40" viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ display: "block" }}>
          <path d="M0,40 L0,18 Q100,2 200,18 T400,18 T600,18 T800,18 T1000,18 T1200,18 L1200,40 Z" fill={C.navy} stroke="#000" strokeWidth="3" />
        </svg>
      </div>

      {/* Langit senja */}
      <div style={{ background: C.navy }}>
        <Bunting flags={22} height={34} />
        <div className="container" style={{ padding: "44px 24px 44px" }}>
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
              <p className="fb" style={{ color: "rgba(255,255,255,.65)", fontSize: 13.5, lineHeight: 1.85, maxWidth: 250, fontWeight: 500 }}>
                Diselenggarakan oleh <strong style={{ color: "rgba(255,255,255,.9)" }}>Himpunan Mahasiswa Teknik Informatika</strong> dan <strong style={{ color: "rgba(255,255,255,.9)" }}>Prodi Teknik Informatika</strong> Universitas Paramadina.
              </p>
            </div>

            <div>
              <div className="fd" style={{ color: "rgba(255,255,255,.7)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Kontak Panitia</div>
              {[{ I: MapPinIcon, t: "Paramadina University, Cipayung, Jakarta" }, { I: PhoneIcon, t: "Ayu — 0819-9285-5778" }, { I: EnvelopeIcon, t: "itfestparamadina@gmail.com" }].map((item, i) => (
                <div key={i} className="fb" style={{ display: "flex", gap: 9, marginBottom: 12, color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 500, alignItems: "flex-start", lineHeight: 1.5 }}>
                  <item.I width={15} height={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} /><span>{item.t}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="fd" style={{ color: "rgba(255,255,255,.7)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Ikuti IT FEST</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Instagram", href: "https://www.instagram.com/itfest.paramadina", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" /></svg> },
                  { label: "TikTok", href: "https://www.tiktok.com/@itfestparamadina", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg> },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)", border: "2px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s, color .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.55)"; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="fb" style={{ textAlign: "center", padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.25)", fontSize: 11, fontWeight: 600, letterSpacing: ".06em" }}>
          © 2026 IT FEST 6.0 · Himpunan Mahasiswa Teknik Informatika &amp; Prodi Teknik Informatika Universitas Paramadina
        </div>
      </div>
    </footer>
  );
}

/* ── Root ─────────────────────────────────────────────────────────── */
export default function Page() {
  const [open, setOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderFading, setLoaderFading] = useState(false);
  useScrollReveal();
  useParallax();
  useEffect(() => {
    const t1 = setTimeout(() => setLoaderFading(true), 1600);
    const t2 = setTimeout(() => setShowLoader(false), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <>
      <style>{CSS}</style>
      {showLoader && <Loading fading={loaderFading} />}
      <div className="fb">
        <Navbar open={open} setOpen={setOpen} />
        <main>
          <Hero />
          <Ticker />
          <About />
          <Acara />
          <Lomba />
          <Bazzar />
          <TataCara />
          <Timeline />
          <Hasil />
        </main>
        <Footer />
      </div>
    </>
  );
}
