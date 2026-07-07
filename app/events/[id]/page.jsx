'use client';

import { useParams } from 'next/navigation';
import Show from "../Show";
import { useState, useEffect } from 'react';
import Loading from "@/app/loading";

export default function ShowEventPage() {
  const params = useParams();
  const eventId = params.id;  // UUID string, no parseInt
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error('Event tidak ditemukan');
        const foundEvent = await res.json();
        setEvent(foundEvent || null);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  if (loading) return <Loading />;

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FEFEFE' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
          .font-fredoka { font-family: 'Fredoka', sans-serif; }
          .b-border { border: 3px solid #1a1a1a; }
          .b-btn { transition: all 0.12s ease; }
          .b-btn:hover { transform: translate(2px,2px); box-shadow: 0px 0px 0px #1a1a1a !important; }
          .bg-dots { background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px); background-size: 24px 24px; opacity: 0.04; pointer-events: none; }
        `}</style>
        <div className="fixed inset-0 bg-dots" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white b-border rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ boxShadow: '6px 6px 0 #1a1a1a' }}>
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="font-fredoka text-2xl font-bold text-slate-900">Event Tidak Ditemukan</h1>
          <p className="text-sm font-bold text-slate-400 mt-2 mb-6">Event yang kamu cari tidak tersedia atau sudah dihapus.</p>
          <a href="/events" className="b-btn b-border inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider" style={{ boxShadow: '4px 4px 0 #1a1a1a' }}>
            ← Kembali ke Events
          </a>
        </div>
      </div>
    );
  }

  // Count participants for this event
  const participantCount = event.participants?.length || 0;
  const remainingQuota = (event.kapasitas || 0) - participantCount;
  const canRegister = remainingQuota > 0;

  const eventWithCount = {
    ...event,
    _count: {
      participants: participantCount,
    },
  };

  return (
    <Show
      auth={{ user: null }}
      event={eventWithCount}
      remainingQuota={remainingQuota}
      canRegister={canRegister}
      eventId={eventId}
    />
  );
}
