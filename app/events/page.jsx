"use client";

import { useEffect, useState } from "react";
import EventsIndex from "./Index";
import Loading from "@/app/loading";

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

  if (loading) return <Loading />;

  return <EventsIndex auth={{ user: null }} events={events} filters={{}} />;
}
