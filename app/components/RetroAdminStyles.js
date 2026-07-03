/* Shared vintage IT FEST 6.0 admin theme — dipakai login + dashboard.
   Token warna & idiom (border 3px, hard shadow, sticker tag) ikut app/page.js. */

export const C = {
  sand: "#FDF5E4",
  lime: "#B5D948",
  yellow: "#FED245",
  coral: "#EB3C6B",
  orange: "#F6890C",
  blue: "#31AECE",
  navy: "#082E4B",
  ink: "#0F172A",
  muted: "#5A6A7E",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap');

  .fd { font-family: 'Fredoka', sans-serif; }
  .fb { font-family: 'Plus Jakarta Sans', sans-serif; }

  .adm-bg {
    min-height: 100vh;
    background-color: ${C.sand};
    background-image:
      repeating-linear-gradient(0deg,  transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px),
      repeating-linear-gradient(90deg, transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px);
    background-size: 28px 28px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: ${C.ink};
  }

  /* ── Cards ── */
  .adm-card {
    background: #fff;
    border: 3px solid #000;
    border-radius: 18px;
    box-shadow: 6px 6px 0 #000;
  }
  .adm-lift { transition: transform .15s ease, box-shadow .15s ease; }
  .adm-lift:hover { transform: translate(-2px,-3px); box-shadow: 8px 8px 0 #000; }
  .sh-coral  { box-shadow: 6px 6px 0 ${C.coral}; }
  .sh-coral.adm-lift:hover  { box-shadow: 8px 8px 0 ${C.coral}; }
  .sh-lime   { box-shadow: 6px 6px 0 ${C.lime}; }
  .sh-lime.adm-lift:hover   { box-shadow: 8px 8px 0 ${C.lime}; }
  .sh-blue   { box-shadow: 6px 6px 0 ${C.blue}; }
  .sh-blue.adm-lift:hover   { box-shadow: 8px 8px 0 ${C.blue}; }
  .sh-yellow { box-shadow: 6px 6px 0 ${C.yellow}; }
  .sh-yellow.adm-lift:hover { box-shadow: 8px 8px 0 ${C.yellow}; }
  .sh-navy   { box-shadow: 6px 6px 0 ${C.navy}; }

  /* ── Sticker tag ── */
  .adm-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 99px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    border: 2.5px solid #000; box-shadow: 3px 3px 0 #000;
    transform: rotate(-2deg);
  }

  /* ── Buttons ── */
  .adm-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-family: 'Fredoka', sans-serif; font-weight: 600;
    border: 3px solid #000; border-radius: 14px;
    padding: 10px 18px; font-size: 15px;
    cursor: pointer; text-decoration: none; color: #000;
    box-shadow: 4px 4px 0 #000;
    transition: transform .12s ease, box-shadow .12s ease;
    background: #fff;
  }
  .adm-btn:hover  { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
  .adm-btn:active { transform: translate(4px,4px); box-shadow: none; }
  .adm-btn:disabled { opacity: .5; cursor: not-allowed; }
  .adm-btn:focus-visible { outline: 3px dashed ${C.navy}; outline-offset: 3px; }
  .adm-btn-sm { padding: 6px 12px; font-size: 13px; border-radius: 11px; border-width: 2.5px; box-shadow: 3px 3px 0 #000; }
  .adm-btn-sm:hover { box-shadow: 1px 1px 0 #000; }

  /* ── Inputs ── */
  .adm-input {
    width: 100%; padding: 11px 14px;
    border: 3px solid #000; border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 14px;
    background: #fff; color: ${C.ink};
    box-shadow: 3px 3px 0 rgba(8,46,75,.25);
    transition: box-shadow .15s ease, transform .15s ease;
  }
  .adm-input:focus { outline: none; box-shadow: 4px 4px 0 ${C.coral}; transform: translate(-1px,-1px); }
  .adm-label {
    display: block; font-size: 11px; font-weight: 800;
    letter-spacing: .12em; text-transform: uppercase;
    color: ${C.navy}; margin-bottom: 7px;
  }

  /* ── Entrance animations ── */
  @keyframes admPop  { from { opacity: 0; transform: translateY(20px) rotate(var(--r,0deg)); }
                       to   { opacity: 1; transform: translateY(0) rotate(var(--r,0deg)); } }
  @keyframes admStamp{ 0% { opacity: 0; transform: scale(2.4) rotate(8deg); }
                       60%{ opacity: 1; transform: scale(.94) rotate(-3deg); }
                       100%{ opacity: 1; transform: scale(1) rotate(-2deg); } }
  @keyframes admFloatA { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
  @keyframes admFloatB { 0%,100%{transform:translateY(0) rotate(3deg)}  50%{transform:translateY(-8px) rotate(-3deg)} }
  @keyframes admSpin   { to { transform: rotate(360deg); } }

  .pop-in   { opacity: 0; animation: admPop .55s cubic-bezier(.22,1,.36,1) forwards; animation-delay: var(--d,0ms); }
  .stamp-in { opacity: 0; animation: admStamp .5s cubic-bezier(.22,1,.36,1) forwards; animation-delay: var(--d,0ms); }
  .a-floatA { animation: admFloatA 6s ease-in-out infinite; }
  .a-floatB { animation: admFloatB 7s ease-in-out infinite; }
  .a-spin   { animation: admSpin 14s linear infinite; }

  /* ── Ticket perforation (garis sobekan tiket) ── */
  .ticket-perf {
    position: relative;
    border-top: 3px dashed rgba(8,46,75,.35);
  }
  .ticket-perf::before, .ticket-perf::after {
    content: ""; position: absolute; top: -13px; width: 22px; height: 22px;
    background: ${C.sand}; border: 3px solid #000; border-radius: 50%;
  }
  .ticket-perf::before { left: -26px; }
  .ticket-perf::after  { right: -26px; }

  /* ── Progress bar ── */
  .adm-track { width: 100%; height: 14px; background: ${C.sand}; border: 2.5px solid #000; border-radius: 99px; overflow: hidden; }
  .adm-fill  { height: 100%; border-right: 2.5px solid #000; border-radius: 0 99px 99px 0; transition: width .6s cubic-bezier(.22,1,.36,1); }

  @media (prefers-reduced-motion: reduce) {
    .pop-in, .stamp-in { animation-duration: .01ms; animation-delay: 0ms; }
    .a-floatA, .a-floatB, .a-spin { animation: none; }
    .adm-lift, .adm-btn, .adm-input { transition: none; }
  }
`;

export default function RetroAdminStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
