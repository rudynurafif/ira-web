"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  useEffect(() => {
    // Logging (opsional): kirim ke monitoring seperti Sentry
    console.error("Route error:", error);
  }, [error]);

  const handleRetry = () => {
    if (from) router.replace(from);
    reset(); // retry render segment (best practice)
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold text-primary">Terjadi Kesalahan</h1>
        <p className="mt-2 text-gray-600">
          Maaf, terjadi kendala di sistem kami. Coba lagi ya.
        </p>

        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={handleRetry}
            className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg border border-primary hover:bg-dark-primary-2"
          >
            Coba Lagi
          </button>

          <button
            onClick={() => router.replace("/")}
            className="cursor-pointer px-4 py-2 bg-white text-primary border border-primary rounded-lg hover:bg-red-50"
          >
            Kembali ke Beranda
          </button>
        </div>

        {/* opsional untuk debugging internal */}
        {/* <p className="mt-4 text-xs text-gray-400">Ref: {error.digest}</p> */}
      </div>
    </div>
  );
}
