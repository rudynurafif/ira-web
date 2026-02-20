"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaExternalLinkAlt, FaApple, FaShieldAlt } from "react-icons/fa";

export default function OpenExternalPage() {
  const searchParams = useSearchParams();
  const [targetUrl, setTargetUrl] = useState<string>("/");
  const [countdown, setCountdown] = useState(5);
  const [manualClick, setManualClick] = useState(false);

  useEffect(() => {
    const to = searchParams.get("to");
    // Pastikan URL absolut
    const finalUrl = to
      ? to.startsWith("http")
        ? to
        : `${window.location.origin}${to}`
      : window.location.origin;

    setTargetUrl(finalUrl);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // PAKSA REDIRECT menggunakan location.href (Paling kompatibel di WKWebView)
          if (!manualClick) {
            window.location.href = finalUrl;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, manualClick]);

  const handleOpenNow = () => {
    setManualClick(true);
    // Langsung arahkan browser sistem
    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaApple className="text-4xl text-blue-600" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">Buka di Safari</h1>
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          Demi keamanan akun Anda, halaman reset password harus dibuka di
          browser Safari, bukan di dalam WhatsApp.
        </p>

        <button
          onClick={handleOpenNow}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200"
        >
          <FaExternalLinkAlt className="text-lg" />
          Buka di Safari Sekarang
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <FaShieldAlt />
          <span>Redirect otomatis dalam {countdown}s</span>
        </div>
      </div>
    </div>
  );
}
