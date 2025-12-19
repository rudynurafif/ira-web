"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center p-4">
      <div>
        <h1 className="text-3xl font-bold text-red-600">
          Terjadi kesalahan pada sistem kami.
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Coba Lagi
          </button>

          <Link
            href="/"
            className="px-4 py-2 border border-primary text-primary rounded-md"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
