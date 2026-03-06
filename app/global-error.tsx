"use client";

import * as Sentry from "@sentry/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [currentRoute, setCurrentRoute] = useState<string>("Unknown Route");

  // Hook ini mungkin gagal jika error terjadi sebelum routing inisialisasi
  try {
    const searchParams = useSearchParams();
    // Kita hanya bisa mengambil pathname secara tidak langsung atau mengasumsikan dari window
    // Karena useSearchParams hanya memberi akses ke query params
  } catch (e) {
    // Abaikan jika hook gagal
  }

  useEffect(() => {
    // Kirim error ke Sentry
    Sentry.captureException(error);

    if (typeof window !== "undefined") {
      setCurrentRoute(window.location.pathname + window.location.search);
    }
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "#333" }}>
            Oops! Terjadi kesalahan.
          </h2>
          <div
            style={{
              background: "#f0f0f0",
              padding: "8px 16px",
              borderRadius: "6px",
              marginBottom: "24px",
              fontSize: "14px",
              color: "#555",
              fontFamily: "monospace",

              maxWidth: "100%",
              boxSizing: "border-box",
              wordBreak: "break-all",
              overflowWrap: "break-word",
              width: "fit-content",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            URL: <strong>{currentRoute}</strong>
          </div>

          {/* ✅ 3. Tombol untuk user mencoba lagi */}
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Coba Lagi
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#d7201d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "16px",
            }}
          >
            Kembali
          </button>
        </div>
      </body>
    </html>
  );
}
