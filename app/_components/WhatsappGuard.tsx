"use client";

import { useEffect, useState } from "react";

export default function WhatsAppGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false); // Baru: Track mounting
  const [isWhatsApp, setIsWhatsApp] = useState(false);
  const [os, setOs] = useState<"ios" | "android" | null>(null);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Pastikan ini jalan di client

    // Cek sessionStorage
    const dismissed = sessionStorage.getItem("wa_guard_dismissed");
    if (dismissed === "true") {
      setHasDismissed(true);
      return;
    }

    const ua = navigator.userAgent || navigator.vendor;

    // Deteksi WhatsApp
    // Catatan: 'wv' ada di Android WebView. 'WhatsApp' ada di string UA iOS/Android WA.
    const isWA = /wv|WhatsApp/i.test(ua);

    if (isWA) {
      setIsWhatsApp(true);
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setOs("ios");
      } else if (/Android/i.test(ua)) {
        setOs("android");
      }
    }
  }, []);

  // Jangan render apa-apa (atau render children langsung) sebelum mounted
  // Ini mencegah hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  // Jika bukan WhatsApp atau user sudah dismiss, tampilkan konten normal
  if (!isWhatsApp || hasDismissed) {
    return <>{children}</>;
  }

  const handleDismiss = () => {
    sessionStorage.setItem("wa_guard_dismissed", "true");
    setHasDismissed(true);
  };

  return (
    <>
      {/* Overlay Modal */}
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center">
        {/* ... (isi modal sama seperti sebelumnya) ... */}
        <div className="max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Buka di Browser Eksternal
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Anda mengakses dari <strong>WhatsApp</strong>. Fitur aktivasi, OTP,
            dan reset password <strong>tidak berfungsi</strong> di dalam
            aplikasi WhatsApp.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <p className="font-semibold text-blue-800 mb-2">
              👉 Cara Memperbaiki:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              {os === "ios" ? (
                <>
                  <li>
                    Klik ikon <strong>Share</strong> (panah ke atas).
                  </li>
                  <li>
                    Pilih <strong>Buka di Safari</strong>.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Klik titik tiga (<strong>⋮</strong>) di pojok kanan atas.
                  </li>
                  <li>
                    Pilih <strong>Buka di Browser</strong> atau{" "}
                    <strong>Chrome</strong>.
                  </li>
                </>
              )}
            </ol>
          </div>
          <button
            onClick={handleDismiss}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg"
          >
            Saya Sudah Membuka di Browser
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Klik tombol di atas setelah membuka di Chrome/Safari.
          </p>
        </div>
      </div>

      {/* Render children di belakang dengan opacity 0 agar layout tidak shift saat modal hilang */}
      <div className="opacity-0 pointer-events-none h-full w-full overflow-hidden">
        {children}
      </div>
    </>
  );
}
