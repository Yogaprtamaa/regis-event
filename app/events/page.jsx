"use client";

import { useEffect, useState } from "react";
import EventsIndex from "./Index";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();

        const mapped = Array.isArray(data)
          ? data.map((event) => ({
              id: event.id,
              title: event.nama_event,
              description: event.deskripsi,
              date: event.tanggal,
              time: `${event.jam_mulai} - ${event.jam_berakhir}`,
              location: event.lokasi,
              quota: event.kapasitas,
              status: event.status || "PUBLISHED",
              poster: event.poster || null,
              isPaidEvent: event.isPaidEvent ?? false,
              _count: {
                participants: event.participants?.length || 0,
              },
            }))
          : [];

        setEvents(mapped);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FEFEFE" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
          .font-fredoka { font-family: 'Fredoka', sans-serif; }
          .b-border { border: 3px solid #1a1a1a; }
          .bg-dots { background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px); background-size: 24px 24px; opacity: 0.04; pointer-events: none; }
          @keyframes bounce1 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        `}</style>
        <div className="fixed inset-0 bg-dots" />
        <div className="relative z-10 text-center">
          <div
            className="w-20 h-20 bg-white b-border rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ boxShadow: "6px 6px 0 #1a1a1a" }}
          >
            <div className="flex gap-1.5">
              {[
                { d: 0, c: "#EB3C6B" },
                { d: 0.15, c: "#FED245" },
                { d: 0.3, c: "#31AECE" },
              ].map((dot, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: dot.c,
                    animation: "bounce1 1.2s infinite ease-in-out",
                    animationDelay: `${dot.d}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <p className="font-fredoka text-xl font-bold text-slate-900">
            Memuat Lomba<span style={{ color: "#EB3C6B" }}>...</span>
          </p>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
            IT FEST 6.0 — Mohon tunggu sebentar
          </p>
        </div>
      </div>
    );
  }

  return <EventsIndex auth={{ user: null }} events={events} filters={{}} />;
}
