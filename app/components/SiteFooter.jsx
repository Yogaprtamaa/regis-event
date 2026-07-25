import { MapPinIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

// Footer IT FEST — dipakai di daftar event & detail event biar seragam sama landing page.
const CSS = `
  .site-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; }
  @media (max-width: 768px) { .site-footer-grid { grid-template-columns: 1fr; gap: 32px; text-align: left; } }
  @keyframes site-footer-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .site-footer-ticker { overflow: hidden; }
  .site-footer-ticker-inner { display:flex; animation: site-footer-ticker 30s linear infinite; white-space:nowrap; }
  .site-footer-ticker-inner:hover { animation-play-state:paused; }
`;

const CONTACTS = [
  { I: MapPinIcon, t: 'Paramadina University, Cipayung, Jakarta' },
  { I: PhoneIcon, t: 'Ayu — 0819-9285-5778' },
  { I: EnvelopeIcon, t: 'itfestparamadina@gmail.com' },
];

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/itfest.paramadina', icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" /></svg> },
  { label: 'TikTok', href: 'https://www.tiktok.com/@itfestparamadina', icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg> },
];

export default function SiteFooter({ className = "mt-12 sm:mt-16" }) {
  return (
    <footer className={className} style={{ background: '#082E4B', borderTop: '3px solid #000' }}>
      <style>{CSS}</style>

      {/* Yellow accent strip */}
      <div className="site-footer-ticker" style={{ background: '#FED245', borderTop: '3px solid #000', borderBottom: '3px solid #000', padding: '6px 0' }}>
        <div className="site-footer-ticker-inner">
          {[0, 1].map((g) => (
            <div key={g} style={{ display: 'inline-flex' }} aria-hidden={g === 1}>
              {[...Array(12)].map((_, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 22, padding: '0 22px', whiteSpace: 'nowrap' }}>
                  <img src="/itfest-logo.png" alt="IT FEST 6.0" style={{ width: 76, height: 76, objectFit: 'contain' }} />
                  <span style={{ color: '#082E4B', opacity: .3, fontSize: 22, fontWeight: 800 }}>•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mx-auto max-w-7xl" style={{ padding: '52px 24px 0' }}>
        <div className="site-footer-grid" style={{ paddingBottom: 48 }}>

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: 18 }}>
              <div className="flex" style={{ borderRadius: 12, background: '#fff', padding: 5, border: '2px solid rgba(255,255,255,.2)' }}>
                <img src="/itfest-logo.png" alt="IT FEST 6.0" style={{ width: 40, height: 40, objectFit: 'contain' }} />
              </div>
              <div>
                <div className="font-fredoka" style={{ color: '#fff', fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>IT FEST 6.0</div>
                <div style={{ color: '#B5D948', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>Festival Teknologi 2026</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13.5, lineHeight: 1.85, maxWidth: 250, fontWeight: 500 }}>
              Diselenggarakan oleh <strong style={{ color: '#fff', fontWeight: 700 }}>Himpunan Mahasiswa Teknik Informatika</strong> dan <strong style={{ color: '#fff', fontWeight: 700 }}>Prodi Teknik Informatika</strong> Universitas Paramadina.
            </p>
          </div>

          {/* Contact */}
          <div>
            <div className="font-fredoka" style={{ color: 'rgba(255,255,255,.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16 }}>Kontak Panitia</div>
            {CONTACTS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 12, color: 'rgba(255,255,255,.55)', fontSize: 13, fontWeight: 500, alignItems: 'flex-start', lineHeight: 1.5 }}>
                <item.I width={15} height={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} /><span>{item.t}</span>
              </div>
            ))}
          </div>

          {/* Social */}
          <div>
            <div className="font-fredoka" style={{ color: 'rgba(255,255,255,.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16 }}>Ikuti IT FEST</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="flex items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', border: '1.5px solid rgba(255,255,255,.12)', transition: 'background .15s, color .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.16)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', textAlign: 'center', padding: '16px 24px', color: 'rgba(255,255,255,.18)', fontSize: 11, fontWeight: 600, letterSpacing: '.06em' }}>
        © 2026 IT FEST 6.0 · Himpunan Mahasiswa Teknik Informatika &amp; Prodi Teknik Informatika Universitas Paramadina
      </div>
    </footer>
  );
}
