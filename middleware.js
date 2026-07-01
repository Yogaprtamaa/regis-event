import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const PROTECTED_PAGES = ["/participants", "/events/create"];

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

  if (!isPage && !isApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_session")?.value;
  const authenticated = await verifySessionToken(token);

  if (authenticated) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/dashboard";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/participants/:path*",
    "/events/create",
    "/events/:id/edit",
    "/api/events/:path*",
    "/api/participants/:path*",
  ],
};
