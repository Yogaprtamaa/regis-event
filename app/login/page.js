"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RetroAdminStyles, { C } from "@/app/components/RetroAdminStyles";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Email atau password salah!");
      return;
    }

    // Juri selalu diarahin ke dashboard juri, gak peduli ?redirect= dari middleware
    // (juri kena bounce ke sini kalau nyoba buka /dashboard duluan).
    const redirect = searchParams.get("redirect");
    try {
      const meRes = await fetch("/api/me");
      const me = await meRes.json();
      const home = me.role === "JURI" ? "/juri" : "/dashboard";
      const target = redirect && (me.role !== "JURI" || redirect.startsWith("/juri")) ? redirect : home;
      router.push(target);
    } catch {
      router.push(redirect || "/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="adm-bg relative flex items-center justify-center p-4 overflow-hidden">
      <RetroAdminStyles />

      {/* Dekorasi mengambang */}
      <div
        aria-hidden="true"
        className="a-floatA absolute top-[12%] left-[10%] hidden md:flex items-center justify-center w-16 h-16 rounded-full border-[3px] border-black text-2xl"
        style={{ background: C.yellow, boxShadow: "4px 4px 0 #000" }}
      >
        ★
      </div>
      <div
        aria-hidden="true"
        className="a-floatB absolute bottom-[15%] right-[12%] hidden md:flex items-center justify-center w-14 h-14 rounded-2xl border-[3px] border-black text-xl"
        style={{ background: C.blue, boxShadow: "4px 4px 0 #000" }}
      >
        🎫
      </div>
      <div
        aria-hidden="true"
        className="a-spin absolute top-[20%] right-[18%] hidden lg:block w-10 h-10 border-[3px] border-black rounded-md"
        style={{ background: C.lime, boxShadow: "3px 3px 0 #000" }}
      />

      {/* Tiket backstage */}
      <div className="pop-in adm-card sh-navy max-w-md w-full overflow-hidden" style={{ "--r": "0deg" }}>
        {/* Strip header tiket */}
        <div
          className="relative px-8 pt-7 pb-6"
          style={{ background: C.coral, borderBottom: "3px solid #000" }}
        >
          <p className="fb text-[11px] font-extrabold uppercase tracking-[.2em] text-white/80">
            IT FEST 6.0 · Universitas Paramadina
          </p>
          <h1 className="fd text-4xl font-bold text-white mt-1" style={{ lineHeight: 0.95 }}>
            Backstage
          </h1>

          <span
            className="stamp-in adm-tag absolute top-5 right-6"
            style={{ background: C.yellow, "--d": "450ms" }}
          >
            Crew only
          </span>
        </div>

        {/* Garis sobekan tiket */}
        <div className="ticket-perf mx-0" />

        {/* Body form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <p className="fb text-sm font-semibold" style={{ color: C.muted }}>
            Tunjukkan pass kamu buat masuk ke meja kontrol.
          </p>

          <div className="pop-in" style={{ "--d": "150ms" }}>
            <label htmlFor="email" className="adm-label fb">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@himti.id"
              className="adm-input"
              autoFocus
            />
          </div>

          <div className="pop-in" style={{ "--d": "250ms" }}>
            <label htmlFor="password" className="adm-label fb">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="adm-input"
            />
          </div>

          {error && (
            <div
              className="stamp-in adm-card px-4 py-3"
              style={{ borderColor: C.coral, boxShadow: `4px 4px 0 ${C.coral}`, "--d": "0ms" }}
              role="alert"
            >
              <p className="fb text-sm font-extrabold" style={{ color: C.coral }}>
                {error}
              </p>
            </div>
          )}

          <div className="pop-in" style={{ "--d": "350ms" }}>
            <button
              type="submit"
              disabled={loading}
              className="adm-btn w-full text-lg py-3"
              style={{ background: C.lime }}
            >
              {loading ? "Ngecek pass..." : "Masuk backstage →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
