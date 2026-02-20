import { getCookie } from "cookies-next";
import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Tambahkan /forgot-password ke public paths
  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/register",
    "/forgot-password",
  ];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const token = req.cookies.get("token-ira")?.value;
  // const userAgent = req.headers.get("user-agent") || "";

  // Detect iOS WhatsApp in-app browser
  // const isIOS = /iPhone/i.test(userAgent);
  // const isWhatsApp = /wv|WhatsApp/i.test(userAgent);
  // const isIOSWhatsAppInApp = isIOS && isWhatsApp;

  // jika sudah login tapi ingin akses login atau register, arahkan ke customer area
  if (token && pathname.startsWith("/auth/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/customer-area";
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  }

  // jika belum login dan ingin mengakses url non-public, arahkan ke login
  if (!isPublic && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // KHUSUS FORGOT PASSWORD - Redirect iOS WhatsApp ke Safari
  // if (isIOSWhatsAppInApp && pathname === "/forgot-password") {
  //   const code = req.nextUrl.searchParams.get("code");

  //   const safariUrl = new URL("/open-external", req.url);
  //   safariUrl.searchParams.set(
  //     "to",
  //     `/forgot-password${code ? `?code=${code}` : ""}`,
  //   );

  //   return NextResponse.redirect(safariUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/activation",
    "/customer-area",
    "/auth/:path*",
    "/forgot-password",
  ],
};
