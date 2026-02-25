"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ModalTemplate from "../_components/modal/ModalTemplate";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function BrowserCheckPage() {
  const searchParams = useSearchParams();
  const osParam = searchParams.get("os");
  const targetPath = searchParams.get("target_path");
  const targetQuery = searchParams.get("target_query");

  const [modalOpen, setModalOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [os, setOs] = useState<"ios" | "android">("ios");
  const [finalUrl, setFinalUrl] = useState<string>("");

  useEffect(() => {
    setIsClient(true);

    if (osParam === "android") setOs("android");
    else {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) setOs("ios");
      else setOs("android");
    }

    if (targetPath) {
      const origin = window.location.origin;
      const reconstructedUrl = `${origin}${targetPath}${targetQuery || ""}`;
      setFinalUrl(reconstructedUrl);

      // CATATAN: Auto-redirect berdasarkan UA dihapus untuk mencegah loop
      // karena UA WhatsApp iOS sering identik dengan Safari.
      // User harus klik tombol "Lanjut di Sini" untuk melanjutkan.
    }
  }, [searchParams, targetPath, targetQuery, osParam]);

  const handleContinueHere = () => {
    if (!finalUrl) return;

    // Tambahkan flag bypass agar middleware tidak redirect lagi
    const urlWithBypass = new URL(finalUrl);
    urlWithBypass.searchParams.set("bypass_check", "true");

    setModalOpen(false);
    // Redirect ke halaman tujuan
    window.location.href = urlWithBypass.toString();
  };

  if (!isClient) return null;

  // Android Fallback
  if (os === "android") {
    if (finalUrl) {
      const urlObj = new URL(finalUrl);
      const intentUrl = `intent://${urlObj.host}${urlObj.pathname}${urlObj.search}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Membuka Chrome...</p>
        </div>
      </div>
    );
  }

  // UI KHUSUS iOS
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {modalOpen ? (
        <ModalTemplate
          closeModal={handleContinueHere}
          classNameModal="p-8 text-center w-full max-w-md shadow-2xl border-0"
        >
          {/* Icon Warning/Info */}
          <div className="flex justify-center">
            <IoMdInformationCircleOutline color="#155dfc" size={100} />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
            Buka di Browser Eksternal
          </h2>

          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Demi kelancaran, silakan buka link di browser eksternal
            (Chrome/Safari).
            <br />
            Silakan ikuti langkah berikut untuk membukanya di{" "}
            <strong>Chrome</strong> atau <strong>Safari</strong>.
          </p>

          {/* INSTRUKSI UTAMA: KLIK TITIK TIGA */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-left shadow-sm">
            <p className="font-bold text-blue-900 mb-4 text-base flex items-center gap-2">
              Petunjuk:
            </p>

            <ol className="space-y-4 text-sm text-blue-800 font-medium">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                  1
                </span>
                <span>
                  Klik ikon <strong>Titik Tiga (•••)</strong> di pojok{" "}
                  <strong>kanan atas</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                  2
                </span>
                <span>
                  Pilih menu <strong>Open in Browser</strong> atau{" "}
                  <strong>Buka di Browser</strong>.
                </span>
              </li>
            </ol>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500 mb-4">
              Jika Anda mengalami kesulitan, Anda bisa tetap membuka di sini
              (fitur mungkin terbatas).
            </p>

            <button
              onClick={handleContinueHere}
              className="w-full py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base rounded-xl transition-colors shadow-sm"
            >
              Lanjut di Sini
            </button>
          </div>
        </ModalTemplate>
      ) : (
        /* Loading State saat redirect bypass */
        <div className="min-h-screen w-full flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">Memuat halaman...</p>
          </div>
        </div>
      )}
    </div>
  );
}
