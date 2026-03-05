"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Kirim error ke Sentry
    Sentry.captureException(error);
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
            Oops! Terjadi kesalahan pada aplikasi.
          </h2>
          <p style={{ marginBottom: "24px", color: "#666" }}>
            Tim kami telah diberitahu. Silakan coba lagi.
          </p>

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
        </div>
      </body>
    </html>
  );
}
