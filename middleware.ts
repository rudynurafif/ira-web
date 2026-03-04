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
    try {
      const protocol = req.headers.get("x-forwarded-proto") || "https";
      let host = req.headers.get("host") || req.nextUrl.host;

      host = host.replace(/:3000$/, "");

      const targetUrl = `${protocol}://${host}${pathname}${req.nextUrl.search}`;
      const urlObj = new URL(targetUrl);

      const pathWithSlash = urlObj.pathname.startsWith("/")
        ? urlObj.pathname
        : `/${urlObj.pathname}`;
      const hostPathSearch = urlObj.host + pathWithSlash + urlObj.search;

      const fallbackUrl = encodeURIComponent(targetUrl);
      const intentUrl = `intent://${hostPathSearch}#Intent;scheme=https;S.browser_fallback_url=${fallbackUrl};end`;

      return NextResponse.redirect(intentUrl);
    } catch (error) {
      console.error("Middleware redirect error:", error);
      return NextResponse.next();
    }
  }

  // --- iOS DIBIARKAN LANGSUNG MASUK (No Redirect) ---
  // Lanjut ke logika autentikasi biasa

  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/register",
    "/check-coverage",
    "/forgot-password",
    "/panduan-cara-bayar",
    "/privacy-and-policy",
    "/refund-policy",
    "/terms-and-condition",
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
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2|eot|otf)$).*)",
  ],
};
