"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ModalTemplate from "../_components/modal/ModalTemplate";

export default function OpenExternalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destination = searchParams.get("destination");
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setIsIOS(true);
    }
  }, []);

  const handleOpenSafari = () => {
    if (destination) {
      // Membuka link di Safari (akan keluar dari WA)
      window.location.href = destination;
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ModalTemplate closeModal={() => {}} classNameModal="p-6 text-center">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-blue-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Buka di Safari</h2>
        <p className="text-gray-600 mb-6">
          Untuk keamanan dan fungsionalitas penuh, silakan buka halaman ini di
          browser Safari.
        </p>

        <button
          onClick={handleOpenSafari}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
        >
          Buka di Safari Sekarang
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Klik tombol di atas, lalu pilih Buka pada popup yang muncul.
        </p>
      </ModalTemplate>
    </div>
  );
}
