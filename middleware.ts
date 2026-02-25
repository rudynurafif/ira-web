import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  const isAndroid = /Android/i.test(userAgent);

  // Deteksi WhatsApp Eksplisit untuk Android
  const hasWAIndicator = /WA4A|wv|WhatsApp/i.test(userAgent);
  const isWhatsAppAndroid = isAndroid && hasWAIndicator;

  // --- HANYA HANDLE ANDROID ---
  if (isWhatsAppAndroid) {
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    let host = req.headers.get("host") || "";

    if (protocol === "https" && host.includes(":3000")) {
      host = host.replace(":3000", "");
    }
    if (!host) host = req.nextUrl.host.replace(":3000", "");

    const targetUrl = `${protocol}://${host}${pathname}${req.nextUrl.search}`;

    const urlObj = new URL(targetUrl);
    const hostPathSearch = urlObj.host + urlObj.pathname + urlObj.search;
    const intentUrl = `intent://${hostPathSearch}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(targetUrl)};end`;

    return NextResponse.redirect(intentUrl);
  }

  // --- iOS DIBIARKAN LANGSUNG MASUK (No Redirect) ---
  // Lanjut ke logika autentikasi biasa

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

  if (token && pathname.startsWith("/auth/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/customer-area";
    url.searchParams.delete("callbackUrl");
    return NextResponse.redirect(url);
  }

  if (!isPublic && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/activation", "/customer-area", "/auth/:path*"],
};
