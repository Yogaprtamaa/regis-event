/* Loading pantai IT FEST — dipakai semua route (app/loading.js) */

import Image from "next/image";

const C = {
  sand: "#FDF5E4",
  lime: "#B5D948",
  yellow: "#FED245",
  coral: "#EB3C6B",
  orange: "#F6890C",
  blue: "#31AECE",
  navy: "#082E4B",
};

const FLAGS = [C.coral, C.yellow, C.blue, C.lime, C.orange];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

  .ld-wrap {
    position: fixed; inset: 0; z-index: 100;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px;
    background: linear-gradient(180deg, #8FDCF0 0%, #5FC8E4 60%, ${C.blue} 100%);
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden;
    opacity: 1; transition: opacity .4s ease;
  }
  .ld-wrap.ld-out { opacity: 0; }

  .ld-sun { animation: ldSpin 8s linear infinite; transform-origin: center; }
  .ld-flag { transform-origin: top center; animation: ldSway 2.8s ease-in-out infinite; }
  .ld-wave-a { animation: ldSurf 3.2s ease-in-out infinite; }
  .ld-wave-b { animation: ldSurf 3.2s ease-in-out infinite reverse; }
  .ld-logo { animation: ldPop .5s cubic-bezier(.22,1,.36,1) both, ldBob 2.6s ease-in-out .5s infinite; }

  .ld-sub {
    color: ${C.navy}; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .24em;
  }

  .ld-bar-track {
    width: 200px; height: 8px; border-radius: 99px;
    background: rgba(255,255,255,.55); border: 2.5px solid #000; overflow: hidden;
  }
  .ld-bar-fill {
    height: 100%; width: 0%; border-radius: 99px;
    background: linear-gradient(90deg, ${C.coral}, ${C.orange});
    animation: ldFill 2s linear forwards;
  }

  @keyframes ldSpin   { to { transform: rotate(360deg); } }
  @keyframes ldSway   { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
  @keyframes ldSurf   { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-40px); } }
  @keyframes ldPop    { from { opacity: 0; transform: translateY(10px) scale(.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes ldBob    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
  @keyframes ldFill   { to { width: 100%; } }

  @media (prefers-reduced-motion: reduce) {
    .ld-sun { animation-duration: 30s; }
    .ld-flag, .ld-wave-a, .ld-wave-b, .ld-logo { animation: none; }
    .ld-bar-fill { animation: none; width: 100%; }
    .ld-wrap { transition: none; }
  }
`;

function Sun() {
  const rays = 12;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g className="ld-sun" style={{ transformBox: "fill-box" }}>
        {Array.from({ length: rays }, (_, i) => (
          <polygon key={i} points="50,4 55,18 45,18"
            fill={C.yellow} stroke="#000" strokeWidth="2" strokeLinejoin="round"
            transform={`rotate(${(360 / rays) * i}, 50, 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="26" fill={C.yellow} stroke="#000" strokeWidth="3" />
      <circle cx="50" cy="50" r="18" fill={C.orange} opacity=".55" />
    </svg>
  );
}

function BuntingTop() {
  const flags = 16;
  const w = flags * 46;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, lineHeight: 0 }} aria-hidden="true">
      <svg width="100%" height="40" viewBox={`0 0 ${w} 40`} preserveAspectRatio="none">
        <line x1="0" y1="3" x2={w} y2="3" stroke="#000" strokeWidth="3" />
        {Array.from({ length: flags }, (_, i) => (
          <polygon
            key={i}
            className="ld-flag"
            style={{ animationDelay: `${(i % 5) * 0.25}s` }}
            points={`${i * 46 + 4},4 ${i * 46 + 42},4 ${i * 46 + 23},36`}
            fill={FLAGS[i % FLAGS.length]}
            stroke="#000" strokeWidth="2.5" strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}

function WavesBottom() {
  const path = "M0,60 L0,30 Q60,6 120,30 T240,30 T360,30 T480,30 T600,30 T720,30 T840,30 T960,30 T1080,30 T1200,30 T1320,30 L1320,60 Z";
  return (
    <div style={{ position: "absolute", bottom: 0, left: -60, right: -60, lineHeight: 0 }} aria-hidden="true">
      <svg width="100%" height="70" viewBox="0 0 1320 60" preserveAspectRatio="none" style={{ display: "block" }}>
        <path className="ld-wave-a" d={path} fill="#fff" opacity=".5" />
        <path className="ld-wave-b" d={path} fill={C.navy} opacity=".9" transform="translate(0,10)" />
      </svg>
    </div>
  );
}

export default function Loading({ fading = false }) {
  return (
    <div className={`ld-wrap${fading ? " ld-out" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <BuntingTop />
      <Sun />

      <div style={{ textAlign: "center" }}>
        <Image src="/itfest-logo-hero.png" alt="IT FEST 6.0" width={220} height={109} priority
          className="ld-logo" style={{ objectFit: "contain", filter: "drop-shadow(4px 5px 0 rgba(0,0,0,.25))" }} />
        <p className="ld-sub" style={{ marginTop: 14 }}>Nyiapin Ombak Kreativitas</p>
      </div>

      <div className="ld-bar-track" aria-hidden="true">
        <div className="ld-bar-fill" />
      </div>

      <WavesBottom />
    </div>
  );
}
