"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Error500() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const handleRetry = () => {
    if (from) {
      router.push(from);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">Terjadi Kesalahan</h1>
        <p className="mt-2 text-gray-600">
          Maaf, terjadi kesalahan pada server kami. Silakan coba lagi nanti.
        </p>
        <div className="flex flex-col gap-6">
          <button
            onClick={handleRetry}
            className="mt-4 cursor-pointer px-4 py-2 bg-primary text-white rounded-lg border border-primary hover:bg-dark-primary-2"
          >
            Coba Lagi
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="cursor-pointer px-4 py-2 bg-white text-primary border border-primary rounded-lg hover:bg-red-50"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
