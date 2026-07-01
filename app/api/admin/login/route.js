export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { password } = body;

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { message: "ADMIN_PASSWORD belum dikonfigurasi di server" },
      { status: 500 },
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ message: "Password salah" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
