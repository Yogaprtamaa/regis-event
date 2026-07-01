export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req) {
  const token = req.cookies.get("admin_session")?.value;
  const authenticated = await verifySessionToken(token);
  return NextResponse.json({ authenticated });
}
