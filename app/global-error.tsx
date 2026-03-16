"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [currentRoute, setCurrentRoute] = useState<string>("Unknown Route");

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
          <h2 style={{ fontSize: "24px", marginBottom: "8px", color: "#333" }}>
            Oops! Terjadi kesalahan.
          </h2>
          
          <p style={{ color: "#d7201d", marginBottom: "16px", fontWeight: "bold", padding: "0 16px", wordBreak: "break-word" }}>
            Pesan Kesalahan: {error?.message || "Terjadi kesalahan tidak dikenal."}
          </p>

          <div
            style={{
              background: "#fff4f4",
              border: "1px solid #ffd4d4",
              padding: "12px 20px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "15px",
              color: "#555",
              maxWidth: "500px",
              width: "90%",
              margin: "0 auto 20px auto",
              textAlign: "center"
            }}
          >
            <p style={{ margin: 0, fontWeight: "500", color: "#4a5568", lineHeight: "1.5" }}>
              💡 Demi kelancaran dan keamanan, silakan buka <strong style={{ color: "#d7201d" }}>internetrakyat.id</strong> di web browser <strong>Google Chrome</strong>.
            </p>
          </div>

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
            URL Target: <strong>{currentRoute}</strong>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Muat Ulang Halaman (Reload)
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
            Kembali ke Beranda
          </button>
        </div>
      </body>
    </html>
  );
}
