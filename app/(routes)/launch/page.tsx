"use client";

import { useEffect } from "react";

export default function LaunchPage() {
  useEffect(() => {
    // Redirect ke App Store setelah delay singkat
    const timer = setTimeout(() => {
      window.location.href =
        "https://apps.apple.com/id/app/internet-rakyat/id6758337694";
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Membuka aplikasi...</h1>
        <p className="text-gray-600">
          Jika tidak terbuka otomatis,{" "}
          <a
            href="https://apps.apple.com/id/app/internet-rakyat/id6758337694"
            className="text-blue-600 underline"
          >
            klik di sini
          </a>
        </p>
      </div>
    </div>
  );
}
