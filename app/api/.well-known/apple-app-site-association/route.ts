// app/api/.well-known/apple-app-site-association/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: "NLKYF87QRJ.com.weave.ira", // ✅ Sudah benar dari teman Anda
            paths: ["/auth/register", "/auth/register/*", "/auth/register?*"],
          },
        ],
      },
      webcredentials: {
        apps: ["NLKYF87QRJ.com.weave.ira"],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  );
}
