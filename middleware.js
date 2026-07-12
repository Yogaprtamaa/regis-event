import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PAGES = ["/dashboard", "/dashboard/lomba", "/participants", "/events/create", "/juri"];

function isProtectedEditPage(pathname) {
  return /^\/events\/[^/]+\/edit$/.test(pathname);
}

function isProtectedApi(pathname, method) {
  if (pathname === "/api/events" && method === "POST") return true;
  if (/^\/api\/events\/[^/]+$/.test(pathname) && ["PUT", "DELETE"].includes(method))
    return true;
  if (/^\/api\/events\/[^/]+\/export$/.test(pathname) && method === "GET") return true;
  if (pathname === "/api/participants" && method === "GET") return true;
  if (
    /^\/api\/participants\/[^/]+$/.test(pathname) &&
    ["PUT", "DELETE"].includes(method)
  )
    return true;

  // ── Alur penjurian lomba ──
  if (pathname === "/api/me") return true;
  if (pathname === "/api/submissions" && method === "GET") return true;
  if (/^\/api\/submissions\/[^/]+$/.test(pathname) && method === "PATCH") return true;
  if (pathname === "/api/criteria") return true; // GET (baca) + POST (buat), keduanya butuh login
  if (/^\/api\/criteria\/[^/]+$/.test(pathname) && ["PUT", "DELETE"].includes(method))
    return true;
  if (pathname === "/api/juri") return true;
  if (/^\/api\/juri\/[^/]+$/.test(pathname) && method === "DELETE") return true;
  if (pathname === "/api/scores") return true;
  if (pathname === "/api/finalists") return true;
  if (/^\/api\/finalists\/[^/]+$/.test(pathname) && method === "PATCH") return true;

  return false;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const isPage = PROTECTED_PAGES.includes(pathname) || isProtectedEditPage(pathname);
  const isApi = isProtectedApi(pathname, method);

  const { res, user } = await updateSession(req);

  if (!isPage && !isApi) {
    return res;
  }

  if (user) {
    // Peserta login boleh, tapi gak boleh masuk area panitia/juri.
    // Role dibaca dari JWT (app_metadata) — gak perlu query DB di edge.
    // /api/me dikecualiin karena peserta butuh buat pantau status sendiri.
    const isPeserta = user.app_metadata?.role === "peserta";
    if (isPeserta && pathname !== "/api/me") {
      if (isApi) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/submit-karya";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return res;
  }

  if (isApi) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/lomba",
    "/participants/:path*",
    "/events/create",
    "/events/:id/edit",
    "/juri",
    "/api/events/:path*",
    "/api/participants/:path*",
    "/api/me",
    "/api/submissions",
    "/api/submissions/:id",
    "/api/criteria",
    "/api/criteria/:id",
    "/api/juri",
    "/api/juri/:id",
    "/api/scores",
    "/api/finalists",
    "/api/finalists/:kategori",
  ],
};
