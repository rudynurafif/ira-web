import { getCookie } from "cookies-next";
import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = ["/", "/auth/login", "/auth/register"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // const token = getCookie("token");
  const token = req.cookies.get("token")?.value;

  console.log("token", token);

  if (token && pathname.startsWith("/auth/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/customer-area"; // atau "/" tergantung kebijakan
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
