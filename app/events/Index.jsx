import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '../utils/inertia-compat';
import { useState, useEffect } from 'react';
import { MapPinIcon, UsersIcon, MagnifyingGlassIcon, PlusIcon, FunnelIcon, BoltIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, PhoneIcon, EnvelopeIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
    body {
        background-color: #FDF5E4;
        background-image:
            repeating-linear-gradient(0deg,  transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px),
            repeating-linear-gradient(90deg, transparent 0, transparent 27px, rgba(8,46,75,.07) 27px, rgba(8,46,75,.07) 28px);
        background-size: 28px 28px;
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .font-fredoka { font-family: 'Fredoka', sans-serif; }
    .footer-grid-it { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 48px; }
    @media (max-width: 768px) { .footer-grid-it { grid-template-columns: 1fr; gap: 32px; text-align: left; } }

    .b-border    { border: 4px solid #000; }
    .b-border-2  { border: 2px solid #000; }
    .b-shadow    { box-shadow: 12px 12px 0px #000; }
    .b-shadow-md { box-shadow: 8px 8px 0px #000; }
    .b-shadow-sm { box-shadow: 4px 4px 0px #000; }
    .b-btn       { transition: all 0.12s ease; }
    .b-btn:hover  { transform: translate(2px,2px); box-shadow: 0px 0px 0px #000 !important; }

    .bg-dots {
        background-image: radial-gradient(circle, #000 1px, transparent 1px);
        background-size: 24px 24px;
        opacity: 0.04;
        pointer-events: none;
    }

    @keyframes float  { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
    @keyframes floatB { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-10px) rotate(-3deg)} }
    @keyframes up     { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
    @keyframes heroIn { from{opacity:0;transform:scale(0.97) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes bar    { from{width:0} }
    @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

    .c-float  { animation: float  5s ease-in-out infinite; }
    .c-floatB { animation: floatB 7s ease-in-out infinite; }
    .c-up     { animation: up     0.5s cubic-bezier(.22,1,.36,1) both; }
    .c-heroIn { animation: heroIn 0.65s cubic-bezier(.22,1,.36,1) both; }
    .c-bar    { animation: bar    1.2s ease both; }

    .event-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .event-card:hover { transform: translate(-3px,-5px); box-shadow: 14px 14px 0px #000; }

    .ticker-wrap  { overflow: hidden; }
    .ticker-inner { display:flex; animation: ticker 22s linear infinite; white-space:nowrap; }
    .ticker-inner:hover { animation-play-state:paused; }

    .card-layer-yellow { transition: transform 0.45s cubic-bezier(.22,1,.36,1); }
    .hero-card-wrap:hover .card-layer-yellow { transform: translateX(28px) translateY(28px) rotate(6deg) !important; }

    /* 3D card flip */
    .card-3d-scene { perspective: 1200px; }
    @keyframes flipIn  { 0%   { transform: rotateY(-90deg) scale(0.95); opacity: 0; }
                         60%  { transform: rotateY(8deg)  scale(1.02); opacity: 1; }
                         100% { transform: rotateY(0deg)  scale(1);    opacity: 1; } }
    .flip-in  { animation: flipIn  0.55s cubic-bezier(.22,1,.36,1) both; transform-origin: center center; }
`;

const CARD_ACCENT = [
    { btn: '#EB3C6B', bar: '#EB3C6B', cover: 'from-pink-400 to-rose-600'   },
    { btn: '#31AECE', bar: '#31AECE', cover: 'from-cyan-400 to-sky-600'    },
    { btn: '#F6890C', bar: '#F6890C', cover: 'from-orange-400 to-amber-600' },
    { btn: '#B5D948', bar: '#B5D948', cover: 'from-lime-400 to-green-600'  },
    { btn: '#FED245', bar: '#FED245', cover: 'from-yellow-300 to-amber-500' },
];

const STATUS_CFG = {
    PUBLISHED: { color: '#B5D948', textColor: '#082E4B', label: 'Open'   },
    DRAFT:     { color: '#fef08a', textColor: '#713f12', label: 'Draft'  },
    CLOSED:    { color: '#fca5a5', textColor: '#7f1d1d', label: 'Closed' },
};

function HeroCarousel({ events }) {
    const upcoming = events.filter(e => e.status === 'PUBLISHED' && new Date(e.date) > new Date());
    const items    = upcoming.length > 0 ? upcoming : events.slice(0, 6);
    const [cur, setCur]       = useState(0);
    const [flipKey, setFlipKey] = useState(0);
    const [paused, setPaused] = useState(false);
    const total = items.length;

    const goTo = (n) => {
        setCur((n + total) % total);
        setFlipKey(k => k + 1);
    };

    useEffect(() => {
        if (paused || total <= 1) return;
        const t = setInterval(() => goTo(cur + 1), 4000);
        return () => clearInterval(t);
    }, [paused, total, cur]);

    if (total === 0) return (
        <div className="w-full max-w-sm py-16 font-bold text-center text-slate-400">
            Belum terdapat kegiatan yang tersedia saat ini.
        </div>
    );

    const item = items[cur];
    const d    = new Date(item.date);

    return (
        <div className="w-[90%] sm:w-full max-w-[17rem] sm:max-w-sm mx-auto"
            style={{ transform: 'translateX(-8px)' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}>

            <div className="flex items-end justify-between mb-8 sm:mb-12">
                <h3 className="font-fredoka text-[1.75rem] sm:text-[2rem] font-bold leading-none text-slate-900">
                    Segera Hadir<span style={{ color: '#EB3C6B' }}>.</span>
                </h3>
                {total > 1 && (
                    <div className="flex gap-2 sm:gap-3">
                        {[ChevronLeftIcon, ChevronRightIcon].map((Icon, i) => (
                            <button key={i}
                                onClick={() => goTo(i === 0 ? cur - 1 : cur + 1)}
                                className="flex items-center text-black justify-center w-10 h-10 transition-colors duration-150 bg-white sm:w-12 sm:h-12 b-border rounded-xl sm:rounded-2xl hover:bg-black hover:text-white"
                                style={{ boxShadow: '4px 4px 0 #000' }}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative card-3d-scene hero-card-wrap">
                <div className="card-layer-yellow absolute inset-0 bg-pink-500 b-border rounded-[2rem] sm:rounded-[2.5rem]"
                    style={{ transform: 'translateX(16px) translateY(16px) rotate(3deg)' }} />
                <div className="absolute inset-0 bg-black b-border rounded-[2rem] sm:rounded-[2.5rem]"
                    style={{ transform: 'translateX(8px) translateY(8px)' }} />

                <div key={flipKey} className="flip-in relative bg-white b-border rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                    <div className="relative h-48 overflow-hidden sm:h-60" style={{ borderBottom: '4px solid #000' }}>
                        {item.poster
                            ? <img src={`/storage/${item.poster}`} alt={item.title}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                            : <div className={`w-full h-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-end pb-5 pl-6`}>
                                <span className="font-bold leading-none select-none font-fredoka text-white/20"
                                    style={{ fontSize: '7.5rem' }}>
                                    {item.title.charAt(0)}
                                </span>
                              </div>
                        }
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                            <span className="bg-black text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                                Featured
                            </span>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
                            <h4 className="font-fredoka text-[1.4rem] sm:text-[1.6rem] font-bold leading-snug text-slate-900 flex-1 line-clamp-2">
                                {item.title}
                            </h4>
                        </div>

                        <div className="mb-6 space-y-2 sm:mb-8 sm:space-y-3">
                            <p className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-500">
                                <MapPinIcon className="flex-shrink-0 w-4 h-4" strokeWidth={2.5} />
                                <span className="truncate">{item.location}</span>
                            </p>
                            <p className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-500">
                                <CalendarIcon className="flex-shrink-0 w-4 h-4" strokeWidth={2.5} />
                                {d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                            </p>
                        </div>

                        <Link href={`/events/${item.id}`}
                            className="b-btn block w-full text-center text-white py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] b-border font-black text-xs sm:text-sm uppercase tracking-[0.15em]"
                            style={{ background: '#EB3C6B', boxShadow: '4px 4px 0 #000' }}>
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </div>

            {total > 1 && (
                <div className="flex items-center gap-4 mt-8 sm:mt-12">
                    <span className="w-6 text-sm font-black text-center text-slate-500 tabular-nums">
                        {String(cur + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 h-3 overflow-hidden rounded-full b-border-2 bg-slate-200">
                        <div className="h-full rounded-full"
                            style={{
                                width: `${((cur + 1) / total) * 100}%`,
                                background: '#EB3C6B',
                                borderRight: '3px solid #000',
                                transition: 'width 0.55s cubic-bezier(.22,1,.36,1)',
                            }} />
                    </div>
                    <span className="w-6 text-sm font-black text-center text-slate-400 tabular-nums">
                        {String(total).padStart(2, '0')}
                    </span>
                </div>
            )}
        </div>
    );
}

function EventCard({ event, idx, showAdminActions = false }) {
    const acc    = CARD_ACCENT[idx % CARD_ACCENT.length];
    const status = STATUS_CFG[event.status] || STATUS_CFG.DRAFT;
    const filled = event._count?.participants || 0;
    const pct    = Math.min(Math.round((filled / event.quota) * 100), 100);
    const d      = new Date(event.date);
    const isFull = pct >= 100;

    return (
        <div className="c-up event-card group bg-white rounded-[2rem] b-border b-shadow-md flex flex-col overflow-hidden"
            style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}>

            {/* Colored accent strip — signature neobrutalist detail */}
            <div className="flex-shrink-0 h-[6px]" style={{ background: acc.btn }} />

            <div className="relative flex-shrink-0 h-52 overflow-hidden sm:h-60">
                {event.poster
                    ? <img src={`/storage/${event.poster}`} alt={event.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                    : <div className={`w-full h-full bg-gradient-to-br ${acc.cover} relative flex items-end pb-4 pl-5`}>
                        {/* Decorative ambient circles */}
                        <div className="absolute top-5 right-5 w-10 h-10 rounded-full opacity-20 border-2 border-white" />
                        <div className="absolute top-9 right-9 w-5 h-5 rounded-full opacity-15 bg-white" />
                        <div className="absolute top-3 right-16 w-6 h-6 rounded-sm opacity-10 bg-white rotate-12" />
                        <span className="font-bold leading-none select-none font-fredoka text-white/20"
                            style={{ fontSize: '7rem' }}>
                            {event.title.charAt(0)}
                        </span>
                      </div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between">
                    <Badge
                        className="!border-2 !border-black !rounded-full !h-auto !py-1.5 !px-3 !text-[10px] !font-black !uppercase !tracking-wider !whitespace-nowrap"
                        style={{ background: status.color, color: status.textColor, boxShadow: '2px 2px 0 #000' }}>
                        {status.label}
                    </Badge>
                    <div className="bg-white b-border-2 rounded-2xl px-3 py-2 text-center min-w-[46px]"
                        style={{ boxShadow: '2px 2px 0 #000' }}>
                        <p className="text-base font-black leading-none text-slate-900">{d.getDate()}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">
                            {d.toLocaleDateString('id-ID', { month: 'short' })}
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-3.5 left-3.5 right-3.5">
                    <span className="inline-flex items-center gap-1.5 bg-white/95 b-border-2 px-3 py-1.5 rounded-full text-[10px] font-black text-slate-700 max-w-[200px]"
                        style={{ boxShadow: '2px 2px 0 #000' }}>
                        <MapPinIcon className="flex-shrink-0 w-3 h-3" strokeWidth={3} />
                        <span className="truncate">{event.location}</span>
                    </span>
                </div>
            </div>

            <div className="flex flex-col flex-1 gap-4 p-5 sm:gap-5 sm:p-7">
                <h3 className="font-fredoka text-[1.5rem] sm:text-[1.7rem] font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {event.title}
                </h3>

                <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wide">
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <UsersIcon className="w-3.5 h-3.5" strokeWidth={3} />
                            {filled} / {event.quota} peserta
                        </span>
                        <span className={`font-black text-[11px] ${isFull ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-cyan-600'}`}>
                            {isFull ? 'Penuh!' : `${pct}%`}
                        </span>
                    </div>
                    {/* Progress bar — neobrutalist */}
                    <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-100 border-2 border-black">
                        <div className="absolute inset-y-0 left-0 rounded-full c-bar transition-none"
                            style={{
                                width: `${pct}%`,
                                borderRight: pct > 0 ? '3px solid rgba(0,0,0,0.35)' : 'none',
                                background: isFull ? '#f87171' : pct >= 80 ? '#fbbf24' : acc.bar,
                            }} />
                    </div>
                </div>

                <div className="flex gap-2 pt-2 mt-auto sm:gap-3 sm:pt-3">
                    <Link href={`/events/${event.id}`}
                        className="b-btn b-border flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest flex items-center justify-center gap-1.5"
                        style={{ background: acc.btn, boxShadow: '4px 4px 0 #000' }}>
                        Lihat Detail
                        <ArrowRightIcon className="w-3.5 h-3.5 hidden sm:block" strokeWidth={3} />
                    </Link>
                    {showAdminActions && (
                        <Link href={`/events/${event.id}/edit`}
                            className="b-btn b-border px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black bg-white text-slate-700 uppercase tracking-wider"
                            style={{ boxShadow: '4px 4px 0 #000' }}>
                            Edit
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function Ticker({ events }) {
    const items = [...events, ...events];
    if (events.length === 0) return null;
    return (
        <div className="py-3 overflow-hidden sm:py-4 ticker-wrap"
            style={{ background: '#FED245', borderTop: '4px solid #000', borderBottom: '4px solid #000' }}>
            <div className="ticker-inner">
                {items.map((e, i) => (
                    <span key={i} className="inline-flex items-center gap-3 px-4 text-xs font-black tracking-wider text-black uppercase sm:px-6 sm:text-sm">
                        <span></span>
                        <span>{e.title}</span>
                        <span className="mx-2 opacity-40">|</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function EventsIndex({ auth, events, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [search, setSearch]             = useState('');
    const isAuthenticated = auth && auth.user;
    const isAdmin         = isAuthenticated && auth.user.role === 'admin';

    const handleFilterChange = (s) => {
        setStatusFilter(s);
        router.get('/events', { status: s }, { preserveState: true });
    };

    const filteredEvents = search
        ? (events || []).filter(e =>
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.location.toLowerCase().includes(search.toLowerCase()))
        : (events || []);

    const filterButtons = [
        { key: '', label: 'Semua' },
        { key: 'PUBLISHED', label: 'Open' },
        { key: 'DRAFT', label: 'Draft' },
        { key: 'CLOSED', label: 'Closed' },
    ];

    const publishedCount = (events || []).filter(e => e.status === 'PUBLISHED').length;

    if (!isAuthenticated) return (
        <>
            <Head title="IT FEST 6.0 — Pendaftaran Lomba" />
            <style>{CSS}</style>
            <div className="min-h-screen overflow-x-hidden">

                <header className="sticky top-0 z-50 px-4 pt-4 pb-3 sm:px-6">
                    <nav className="flex items-center justify-between px-4 mx-auto bg-white sm:px-5 max-w-7xl b-border rounded-2xl sm:px-7"
                        style={{ height: '60px', boxShadow: '6px 6px 0 #000' }}>
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-9 h-9 overflow-hidden sm:w-10 sm:h-10 b-border rounded-xl b-btn"
                                style={{ background: '#082E4B', boxShadow: '3px 3px 0 #000' }}>
                                <img src="/itfest-logo.png" alt="IT FEST 6.0" className="object-contain w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <span className="font-fredoka text-[1.25rem] sm:text-[1.5rem] font-bold tracking-tight text-black">IT FEST 6.0</span>
                        </Link>
                        <div className="flex items-center gap-3 sm:gap-5">
                            <a href="/" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-slate-500 hover:text-slate-900 transition-colors">
                                ← Beranda
                            </a>
                            <Link
                                href="/login"
                                className="b-btn b-border inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-white text-[11px] sm:text-xs font-black uppercase tracking-widest"
                                style={{ background: '#082E4B' }}
                            >
                                Login
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="relative z-10 px-4 pb-12 mx-auto sm:px-6 max-w-7xl sm:pb-16">

                    <div className="c-heroIn mt-8 sm:mt-12 bg-white b-border b-shadow rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.04] select-none pointer-events-none overflow-hidden"
                            style={{ right: '-2rem', top: '-1rem' }}>
                            <p className="font-bold leading-none text-black font-fredoka text-[10rem] md:text-[20rem]">FEST</p>
                        </div>

                        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12" style={{ minHeight: 'auto' }}>
                        <div className="relative flex flex-col justify-center p-6 text-white border-b-4 border-black sm:p-8 lg:p-10 lg:col-span-7 lg:border-b-0 lg:border-r-4"
                            style={{ background: '#EB3C6B' }}>

                            {/* Floating SVG star — neobrutalist sticker */}
                            <div className="absolute hidden sm:block c-float" style={{ top: '2.5rem', right: '4rem', filter: 'drop-shadow(5px 5px 0 #000)' }} aria-hidden="true">
                                <svg width="68" height="68" viewBox="0 0 100 100">
                                    <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#FED245" stroke="#000" strokeWidth="4"/>
                                </svg>
                            </div>
                            {/* Floating SVG diamond */}
                            <div className="absolute hidden sm:block c-floatB" style={{ bottom: '3.5rem', right: '2.5rem', animationDelay: '2.5s', filter: 'drop-shadow(4px 4px 0 #000)' }} aria-hidden="true">
                                <svg width="56" height="56" viewBox="0 0 100 100">
                                    <rect x="22" y="22" width="56" height="56" rx="10" fill="#B5D948" stroke="#000" strokeWidth="4.5" transform="rotate(45 50 50)"/>
                                </svg>
                            </div>

                            <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto space-y-6 text-center lg:mx-0 lg:max-w-xl lg:items-start lg:text-left">
                                
                                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase"
                                    style={{
                                        background: 'rgba(255,255,255,0.18)',
                                        backdropFilter: 'blur(10px)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                    }}>
                                    Pendaftaran Lomba Dibuka!
                                </div>

                                <div className="flex flex-col w-full gap-1">
                                    <h1 className="font-fredoka font-bold text-white leading-[1.1]"
                                        style={{
                                            fontSize: 'clamp(2.5rem, 9vw, 4.5rem)',
                                            textShadow: '4px 4px 0 #000',
                                            WebkitTextStroke: '1px #000',
                                        }}>
                                        Daftar Lomba
                                    </h1>
                                    <h1 className="font-fredoka font-bold text-yellow-200 leading-[1.1]"
                                        style={{
                                            fontSize: 'clamp(2.5rem, 9vw, 4.5rem)',
                                            textShadow: '4px 4px 0 #000',
                                            WebkitTextStroke: '2px #000',
                                        }}>
                                        IT FEST 6.0
                                    </h1>
                                </div>

                                <p className="w-full max-w-md text-xs font-bold leading-relaxed sm:text-sm md:text-base text-white/90">
                                    Hackathon, IoT, Game Making & KTI —{' '}
                                    <span className="font-black text-yellow-200">perlombaan khusus untuk mahasiswa.</span>
                                </p>

                                <a href="#events"
                                    className="group inline-flex items-center gap-2.5 bg-white text-black font-black text-xs sm:text-sm uppercase b-border mt-2"
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '2rem',
                                        boxShadow: '4px 4px 0 #000',
                                        transition: 'all 0.12s ease',
                                        width: 'fit-content',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform='translate(2px,2px)'; e.currentTarget.style.boxShadow='0px 0px 0 #000'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='4px 4px 0 #000'; }}>
                                    LIHAT LOMBA
                                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                                </a>

                                <div className="flex flex-col items-center w-full gap-3 pt-2 sm:flex-row sm:gap-4 lg:justify-start">
                                    <div className="flex order-2 -space-x-2 sm:order-1">
                                        {['#FED245', '#31AECE', '#B5D948'].map((bg, i) => (
                                            <div key={i} className="w-8 h-8 bg-white rounded-full sm:w-9 sm:h-9 b-border-2"
                                                style={{ background: bg, boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }} />
                                        ))}
                                    </div>
                                    <span className="order-1 text-xs font-black text-white sm:text-sm sm:order-2">Khusus Mahasiswa!</span>
                                </div>

                                <div className="flex flex-wrap items-center justify-center w-full gap-2 pt-2 sm:gap-3 sm:pt-3 lg:justify-start">
                                    <div className="bg-white/20 backdrop-blur-sm b-border-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center flex-1 min-w-[90px] max-w-[120px] lg:max-w-none">
                                        <p className="font-bold text-white font-fredoka tabular-nums text-xl sm:text-[1.8rem]"
                                            style={{ lineHeight: 1 }}>
                                            {String((events||[]).length).padStart(2,'0')}
                                        </p>
                                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-white/70 mt-1">Total Lomba</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm b-border-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center flex-1 min-w-[90px] max-w-[120px] lg:max-w-none">
                                        <p className="font-bold text-white font-fredoka tabular-nums text-xl sm:text-[1.8rem]"
                                            style={{ lineHeight: 1 }}>
                                            {String(publishedCount).padStart(2,'0')}
                                        </p>
                                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-white/70 mt-1">Dibuka</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm b-border-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center flex-1 min-w-[90px] max-w-[120px] lg:max-w-none">
                                        <p className="font-bold text-white font-fredoka text-xl sm:text-[1.8rem]"
                                            style={{ lineHeight: 1 }}>
                                            2026
                                        </p>
                                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-white/70 mt-1">Tahun Ini</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                            <div className="flex flex-col items-center justify-center p-6 pb-10 sm:p-8 sm:pb-12 lg:p-10 lg:col-span-5 md:p-14 relative overflow-hidden" style={{ background: '#F8F9FB' }}>
                                <div className="absolute inset-0 bg-dots" />
                                <div className="relative z-10 w-full">
                                    <HeroCarousel events={events || []} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mb-16 sm:mt-10 sm:mb-20">
                        <Ticker events={(events||[]).filter(e => e.status === 'PUBLISHED')} />
                    </div>

                    <div id="events" className="flex flex-col justify-between gap-5 mb-8 md:flex-row md:items-end md:mb-12">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center gap-3 mb-2 md:justify-start sm:mb-3">
                                <svg width="24" height="24" viewBox="0 0 100 100" className="flex-shrink-0 hidden sm:block" aria-hidden="true">
                                    <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#FED245" stroke="#000" strokeWidth="5"/>
                                </svg>
                                <span className="text-3xl font-bold sm:text-4xl font-fredoka text-slate-900">Daftar Lomba</span>
                                <span className="px-3 py-1 text-xs font-black text-white sm:text-sm b-border-2 rounded-xl"
                                    style={{ background: '#EB3C6B', boxShadow: '3px 3px 0 #000' }}>
                                    {filteredEvents.length}
                                </span>
                            </div>
                            <p className="text-xs font-bold sm:text-sm text-slate-400">
                                {publishedCount} lomba tersedia—pilih kategorimu & daftar sebelum kuota penuh!
                            </p>
                        </div>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-5 h-5 -translate-y-1/2 left-3.5 top-1/2 text-slate-400 z-10 pointer-events-none" strokeWidth={2.5} />
                            <Input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari lomba atau lokasi..."
                                className="w-full md:w-72 !pl-10 !pr-5 !py-3 sm:!py-3.5 !h-auto bg-white !border-2 !border-black !rounded-xl sm:!rounded-2xl !text-sm !font-bold text-slate-700 !placeholder-slate-400 focus:!ring-2 focus:!ring-pink-500 focus:!border-pink-500"
                                style={{ boxShadow: '4px 4px 0 #000' }}
                            />
                        </div>
                    </div>

                    {filteredEvents.length > 0
                        ? <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 sm:gap-14">
                              {filteredEvents.map((event, idx) => (
                                  <EventCard key={event.id} event={event} idx={idx} />
                              ))}
                          </div>
                        : <Empty className="py-16 sm:py-28 bg-white b-border rounded-[2rem]" style={{ boxShadow: '6px 6px 0 #000' }}>
                              <EmptyHeader>
                                  <EmptyMedia>
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl sm:rounded-3xl b-border"
                                          style={{ background: '#FED245', boxShadow: '4px 4px 0 #000' }}>
                                          {search
                                              ? <MagnifyingGlassIcon className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={2.2} />
                                              : <TrophyIcon className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={2.2} />}
                                      </div>
                                  </EmptyMedia>
                                  <EmptyTitle className="font-fredoka text-xl sm:text-2xl font-bold text-slate-800">
                                      {search ? 'Pencarian Tidak Ditemukan' : 'Pendaftaran Segera Dibuka'}
                                  </EmptyTitle>
                                  <EmptyDescription className="text-xs sm:text-sm font-bold text-slate-400">
                                      {search ? 'Coba dengan kata kunci yang berbeda.' : 'Lomba IT FEST 6.0 sedang disiapkan—pantau terus untuk info pembukaan pendaftaran!'}
                                  </EmptyDescription>
                              </EmptyHeader>
                          </Empty>}
                </main>

                <footer className="mt-12 sm:mt-16" style={{ background: '#082E4B', borderTop: '3px solid #000' }}>
                    {/* Yellow accent strip */}
                    <div className="ticker-wrap" style={{ background: '#FED245', borderTop: '3px solid #000', borderBottom: '3px solid #000', padding: '6px 0' }}>
                        <div className="ticker-inner" style={{ animationDuration: '30s' }}>
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
                        <div className="footer-grid-it" style={{ paddingBottom: 48 }}>

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
                                {[{ I: MapPinIcon, t: 'Paramadina University, Cipayung, Jakarta' }, { I: PhoneIcon, t: 'Ayu — 0819-9285-5778' }, { I: EnvelopeIcon, t: 'itfestparamadina@gmail.com' }].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 12, color: 'rgba(255,255,255,.55)', fontSize: 13, fontWeight: 500, alignItems: 'flex-start', lineHeight: 1.5 }}>
                                        <item.I width={15} height={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} /><span>{item.t}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Social */}
                            <div>
                                <div className="font-fredoka" style={{ color: 'rgba(255,255,255,.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16 }}>Ikuti IT FEST</div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[
                                        { label: 'Instagram', href: 'https://www.instagram.com/itfest.paramadina', icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" /></svg> },
                                        { label: 'TikTok', href: 'https://www.tiktok.com/@itfestparamadina', icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg> },
                                    ].map((s, i) => (
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
            </div>
        </>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col justify-between gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                    <div>
                        <h2 className="text-2xl font-bold sm:text-3xl font-fredoka text-slate-900">Kelola Event</h2>
                        <p className="mt-1 text-xs font-bold sm:text-sm text-slate-400">{(events||[]).length} event terdaftar</p>
                    </div>
                    {isAdmin && (
                        <Link href="/events/create"
                            className="b-btn b-border inline-flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest w-full sm:w-auto mt-2 sm:mt-0"
                            style={{ background: '#EB3C6B', boxShadow: '4px 4px 0 #000' }}>
                            <PlusIcon className="w-4 h-4" strokeWidth={3} /> Buat Event
                        </Link>
                    )}
                </div>
            }>
            <Head title="IT FEST 6.0 — Kelola Lomba" />
            <style>{CSS}</style>
            <div style={{ background: '#FEFEFE' }}>
                <div className="fixed inset-0 bg-dots" />
                
                {/* Hero Section */}
                <div className="relative pt-8 pb-12 sm:pb-16 lg:pb-20">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2 lg:items-center">
                            <div className="flex flex-col justify-center order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 w-fit mb-4 sm:mb-5">
                                    <div className="bg-pink-500 b-border px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-black uppercase"
                                        style={{ boxShadow: '3px 3px 0 #000' }}>
                                        KAMPUS LIFE IS FUN!
                                    </div>
                                </div>

                                <div className="mb-4 sm:mb-6">
                                    <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl font-fredoka text-slate-900">
                                        Pengembangan<br />
                                        <span className="relative">
                                            Kompetensi
                                            <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-300" style={{ zIndex: -1 }} />
                                        </span>
                                        <br />
                                        Mahasiswa Informatika.
                                    </h1>
                                </div>

                                <p className="w-full max-w-md text-xs font-bold leading-relaxed sm:text-sm md:text-base text-slate-600">
                                    Kegiatan workshop, seminar, dan kompetisi teknologi{' '}
                                    <span className="font-black text-slate-900">untuk meningkatkan kemampuan akademik dan profesional.</span>
                                </p>

                                <a href="#events"
                                    className="group inline-flex items-center gap-2.5 bg-slate-900 text-white font-black text-xs sm:text-sm uppercase b-border mt-4 sm:mt-6"
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '2rem',
                                        boxShadow: '4px 4px 0 #000',
                                        transition: 'all 0.12s ease',
                                        width: 'fit-content',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform='translate(2px,2px)'; e.currentTarget.style.boxShadow='0px 0px 0 #000'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='4px 4px 0 #000'; }}>
                                    JELAJAHI EVENTS
                                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                                </a>

                                <div className="flex flex-col items-start w-full gap-3 pt-4 sm:gap-4 sm:pt-6">
                                    <div className="flex -space-x-2">
                                        {['#fecaca', '#bfdbfe', '#bbf7d0'].map((bg, i) => (
                                            <div key={i} className="w-8 h-8 bg-white rounded-full sm:w-9 sm:h-9 b-border-2"
                                                style={{ background: bg, boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-black text-slate-700 sm:text-sm">+2k peserta HIMTI!</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 w-full pt-4 sm:gap-3 sm:pt-6">
                                    <div className="bg-slate-100 b-border-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center flex-1 min-w-[90px]">
                                        <p className="font-bold text-slate-900 font-fredoka tabular-nums text-xl sm:text-[1.5rem]"
                                            style={{ lineHeight: 1 }}>
                                            {String((events||[]).length).padStart(2,'0')}
                                        </p>
                                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-slate-500 mt-1">Total Events</p>
                                    </div>
                                    <div className="bg-slate-100 b-border-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center flex-1 min-w-[90px]">
                                        <p className="font-bold text-slate-900 font-fredoka tabular-nums text-xl sm:text-[1.5rem]"
                                            style={{ lineHeight: 1 }}>
                                            {String(publishedCount).padStart(2,'0')}
                                        </p>
                                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-slate-500 mt-1">Dibuka</p>
                                    </div>
                                    <div className="bg-slate-100 b-border-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-center flex-1 min-w-[90px]">
                                        <p className="font-bold text-slate-900 font-fredoka text-xl sm:text-[1.5rem]"
                                            style={{ lineHeight: 1 }}>
                                            100%
                                        </p>
                                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-slate-500 mt-1">Gratis</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center order-1 p-6 pb-10 sm:p-8 sm:pb-12 lg:p-10 lg:order-2 rounded-3xl b-border relative overflow-hidden"
                                style={{ boxShadow: '8px 8px 0 #000', background: '#F8F9FB' }}>
                                <div className="absolute inset-0 bg-dots rounded-3xl" />
                                <div className="relative z-10 w-full">
                                    <HeroCarousel events={events || []} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticker */}
                <div className="mb-8 sm:mb-12">
                    <Ticker events={(events||[]).filter(e => e.status === 'PUBLISHED')} />
                </div>

                {/* Events Section */}
                <div className="py-8 sm:py-16" style={{ background: '#FEFEFE' }}>
                    <div className="px-4 mx-auto space-y-6 sm:space-y-10 max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-3 p-4 bg-white b-border rounded-2xl sm:flex-row"
                            style={{ boxShadow: '5px 5px 0 #000' }}>
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" strokeWidth={2.5} />
                                <Input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Cari event..."
                                    className="w-full !pl-10 !pr-4 !py-2.5 !h-auto !border-2 !border-black !rounded-xl !text-sm !font-bold !placeholder-slate-400 focus:!ring-2 focus:!ring-pink-500 !bg-slate-50" />
                            </div>
                            {isAdmin && (
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                    <FunnelIcon className="flex-shrink-0 hidden w-4 h-4 sm:block text-slate-400" strokeWidth={2.5} />
                                    {filterButtons.map(({ key, label }) => (
                                        <button key={key} onClick={() => handleFilterChange(key)}
                                            className={`b-btn b-border-2 flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${statusFilter === key ? 'text-white' : 'bg-white text-slate-600'}`}
                                            style={{
                                                background: statusFilter === key ? '#EB3C6B' : '',
                                                boxShadow: '3px 3px 0 #000',
                                            }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    <p className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-slate-400 text-center sm:text-left">
                        Menampilkan <span className="text-slate-900">{filteredEvents.length}</span> event
                    </p>

                    {filteredEvents.length > 0
                        ? <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 sm:gap-14">
                              {filteredEvents.map((event, idx) => (
                                  <EventCard key={event.id} event={event} idx={idx} showAdminActions={isAdmin} />
                              ))}
                          </div>
                        : <Empty className="bg-white b-border rounded-[1.5rem] sm:rounded-[2rem] py-16 sm:py-24 mx-2 sm:mx-0"
                                style={{ boxShadow: '5px 5px 0 #000' }}>
                              <EmptyHeader>
                                  <EmptyMedia>
                                      <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-100 b-border"
                                          style={{ boxShadow: '4px 4px 0 #000' }}>
                                          {search
                                              ? <MagnifyingGlassIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" strokeWidth={2.2} />
                                              : <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" strokeWidth={2.2} />}
                                      </div>
                                  </EmptyMedia>
                                  <EmptyTitle className="font-fredoka text-xl sm:text-2xl font-bold text-slate-800">
                                      {search ? 'Nggak Ketemu...' : 'Belum Ada Event'}
                                  </EmptyTitle>
                                  <EmptyDescription className="text-xs sm:text-sm font-bold text-slate-400">
                                      {search ? 'Silakan coba dengan kata kunci yang berbeda.' : 'Mulai buat kegiatan pertama Anda!'}
                                  </EmptyDescription>
                              </EmptyHeader>
                              {isAdmin && !search && (
                                  <Link href="/events/create"
                                      className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black tracking-widest text-white uppercase b-btn b-border rounded-xl sm:rounded-2xl"
                                      style={{ background: '#EB3C6B', boxShadow: '4px 4px 0 #000' }}>
                                      <PlusIcon className="w-4 h-4" strokeWidth={3} /> Buat Event
                                  </Link>
                              )}
                          </Empty>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
