import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CUSTOMER_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/dashboard", "/customers", "/qr", "/campaigns", "/settings", "/rewards"];
const PROTECTED = [...CUSTOMER_ROUTES, ...ADMIN_ROUTES];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Root → dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const adminToken =
    req.cookies.get("gamify-admin.session_token")?.value ??
    req.cookies.get("better-auth.session_token")?.value;
  const customerToken = req.cookies.get("gamify_customer_session")?.value;

  if (!adminToken && !customerToken) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // Customer trying to hit admin-only route
  const isAdminOnly = ADMIN_ROUTES.some((p) => pathname.startsWith(p));
  if (isAdminOnly && !adminToken) {
     if (pathname !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/rewards/:path*",
    "/games/:path*",
    "/customers/:path*",
    "/qr/:path*",
    "/campaigns/:path*",
    "/settings/:path*",
    "/customer/:path*",
  ],
};
