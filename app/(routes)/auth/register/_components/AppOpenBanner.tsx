"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const ANDROID_STORE =
  "https://play.google.com/store/apps/details?id=com.weave.ira";
const IOS_STORE = "https://apps.apple.com/id/app/internet-rakyat/id6758337694"; // 🔴 Ganti dengan App Store ID iOS Anda

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  return "desktop";
}

function sanitizeCode(raw: string | null): string {
  return (raw || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

export default function AppOpenBanner() {
  const searchParams = useSearchParams();
  const code = sanitizeCode(searchParams.get("referral_code"));

  const [platform, setPlatform] = useState<Platform>("unknown");
  const [dismissed, setDismissed] = useState(false);

  // [IMPROVEMENT] Load dismissed state dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem("app_banner_dismissed");
    if (saved === "true") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Tampilkan banner hanya kalau: mobile + ada referral_code + belum di-dismiss
  if (dismissed) return null;
  if (platform === "desktop" || platform === "unknown") return null;
  if (!code) return null;

  const openInApp = () => {
    const storeUrl = platform === "android" ? ANDROID_STORE : IOS_STORE;
    const customSchemeUrl = `ira://register?referral_code=${encodeURIComponent(code)}`;

    let appOpened = false;
    const onVisibilityChange = () => {
      if (document.hidden) appOpened = true;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Coba buka app via custom scheme
    window.location.href = customSchemeUrl;

    // Kalau setelah 2 detik halaman masih visible → app tidak terbuka, redirect ke store
    setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (!appOpened && !document.hidden) {
        window.location.href = storeUrl;
      }
    }, 2000);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // [IMPROVEMENT] Simpan ke localStorage agar persist setelah refresh/navigasi
    // localStorage.setItem("app_banner_dismissed", "true");
  };

  return (
    <div className="w-full mb-3 bg-[#FFF7E6] rounded-lg border-b border-[#F5D58A] px-4 py-3 flex items-center gap-3 font-sans">
      {/* Info Text */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900">
          Daftar lebih mudah lewat aplikasi
        </div>
        <div className="text-xs text-gray-600 mt-0.5">
          Kode referral <b>{code}</b> sudah siap dipakai
        </div>
      </div>

      {/* Buka di App Button */}
      <button
        onClick={openInApp}
        className="bg-[#D7201D] hover:bg-[#b01a17] text-white border-none px-4 py-2 rounded-md font-semibold text-sm cursor-pointer whitespace-nowrap transition-colors active:scale-95"
      >
        Buka di App
      </button>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        aria-label="Tutup"
        className="bg-transparent border-none text-gray-500 hover:text-gray-700 text-xl cursor-pointer p-0 leading-none flex items-center justify-center w-6 h-6"
      >
        ✕
      </button>
    </div>
  );
}
