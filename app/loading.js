/* Loading pantai IT FEST — dipakai semua route (app/loading.js) */

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
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

  .ld-wrap {
    position: fixed; inset: 0; z-index: 100;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px;
    background: linear-gradient(180deg, #8FDCF0 0%, #5FC8E4 60%, ${C.blue} 100%);
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden;
  }

  .ld-sun { animation: ldSpin 8s linear infinite; transform-origin: center; }
  .ld-flag { transform-origin: top center; animation: ldSway 2.8s ease-in-out infinite; }
  .ld-wave-a { animation: ldSurf 3.2s ease-in-out infinite; }
  .ld-wave-b { animation: ldSurf 3.2s ease-in-out infinite reverse; }

  .ld-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 34px; font-weight: 700;
    -webkit-text-stroke: 3px #157347;
    paint-order: stroke fill;
    color: ${C.lime};
    text-shadow: 3px 4px 0 ${C.yellow}, 6px 8px 0 rgba(0,0,0,.18);
  }
  .ld-sub {
    color: ${C.navy}; font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: .24em;
  }
  .ld-dot {
    width: 10px; height: 10px; border-radius: 99px; border: 2px solid #000;
    animation: ldBounce 1.1s ease-in-out infinite;
  }

  @keyframes ldSpin   { to { transform: rotate(360deg); } }
  @keyframes ldSway   { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
  @keyframes ldBounce { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
  @keyframes ldSurf   { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-40px); } }

  @media (prefers-reduced-motion: reduce) {
    .ld-sun { animation-duration: 30s; }
    .ld-flag, .ld-dot, .ld-wave-a, .ld-wave-b { animation: none; }
  }
`;

function Sun() {
  const rays = 12;
  return (
    <svg width="140" height="140" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

export default function Loading() {
  return (
    <div className="ld-wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <BuntingTop />
      <Sun />

      <div style={{ textAlign: "center" }}>
        <div className="ld-title fd">IT FEST 6.0</div>
        <p className="ld-sub" style={{ marginTop: 10 }}>Nyiapin Ombak Kreativitas</p>
      </div>

      <div style={{ display: "flex", gap: 8 }} aria-hidden="true">
        {[C.coral, C.yellow, C.navy].map((c, i) => (
          <span key={i} className="ld-dot" style={{ background: c, animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>

      <WavesBottom />
    </div>
  );
}
