import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PAGES = ["/dashboard", "/participants", "/events/create"];

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
    "/participants/:path*",
    "/events/create",
    "/events/:id/edit",
    "/api/events/:path*",
    "/api/participants/:path*",
  ],
};
