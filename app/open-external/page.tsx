"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function OpenExternal() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("to") || "/";
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted) return;
    setAttempted(true);

    // Full URL untuk redirect
    const targetUrl = `${window.location.origin}${redirectPath}`;

    // Coba buka di Safari menggunakan window.open dengan _system
    // Ini akan force open di system browser [[54]]
    try {
      const newWindow = window.open(targetUrl, "_system");

      // Fallback jika window.open diblokir
      setTimeout(() => {
        if (!newWindow || newWindow.closed) {
          window.location.href = targetUrl;
        }
      }, 500);
    } catch (e) {
      // Fallback ultimate
      window.location.href = targetUrl;
    }
  }, [redirectPath, attempted]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Membuka di Safari...</h2>
        <p className="text-gray-600 mb-4">
          Halaman reset password akan dibuka di browser Safari untuk keamanan
          yang lebih baik.
        </p>
        <p className="text-sm text-gray-500">
          Jika tidak terbuka otomatis,{" "}
          <a
            href={`${window.location.origin}${redirectPath}`}
            className="text-blue-600 underline"
          >
            klik di sini
          </a>
        </p>
      </div>
    </div>
  );
}
