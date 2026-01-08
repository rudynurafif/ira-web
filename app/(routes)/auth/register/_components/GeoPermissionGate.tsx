// GeoPermissionGate.tsx
"use client";
import React from "react";
import toast from "react-hot-toast";
import { useGeoPermission } from "@/app/hooks/useGeoPermission";

type Props = {
  onGotLocation: (lat: number, lng: number) => void;
  className?: string;
};

export default function GeoPermissionGate({ onGotLocation, className }: Props) {
  const { status, requestLocation, refresh } = useGeoPermission();

  const handleClick = async () => {
    try {
      const pos = await requestLocation(); // akan prompt jika status=prompt
      const { latitude, longitude } = pos.coords;
      onGotLocation(latitude, longitude);
      toast.success("Lokasi berhasil didapatkan ✔");
    } catch (e: any) {
      // Jika user klik "Block", status akan jadi denied
      toast.error(e?.message || "Gagal mendapatkan lokasi");
      refresh();
    }
  };

  if (status === "granted") return null;

  // UI ringkas untuk tiga state
  return (
    <div
      className={`rounded-xl mt-4
        
          ${className || ""}`}
    >
      {status === "prompt" && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-old-primary">
              Aktifkan lokasi agar alamat otomatis & cek coverage lebih akurat
            </p>
            <p className="text-sm text-gray-600">
              Klik tombol di bawah untuk menampilkan permintaan izin lokasi.
            </p>
          </div>
          <button
            onClick={handleClick}
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold"
          >
            Izinkan Lokasi
          </button>
        </div>
      )}

      {status === "denied" && (
        <div className="space-y-2">
          <p className="font-semibold text-red-700">
            Akses lokasi diblokir untuk situs ini.
          </p>
          <ol className="text-sm text-red-800 list-decimal pl-4 space-y-1">
            <li>
              Buka ikon <strong>kunci (🔒) atau ⓘ</strong> di address bar →{" "}
              <strong>Site settings</strong> / <strong>Izin</strong>.
            </li>
            <li>
              Ubah <strong>Location</strong> menjadi <strong>Allow</strong>.
            </li>
            <li>
              Kembali ke halaman ini (atau refresh), kami akan mendeteksi
              perubahan otomatis.
            </li>
          </ol>

          {/* Tips untuk platform umum */}
          <details className="mt-2 text-xs text-gray-700">
            <summary className="cursor-pointer underline">
              Petunjuk perangkat umum
            </summary>
            <div className="mt-2 space-y-1">
              <p>
                <strong>Chrome Android</strong>: Ketuk ikon kunci →{" "}
                <em>Perizinan</em> → <em>Lokasi</em> → <em>Izinkan</em>.
              </p>
              <p>
                <strong>Safari iOS</strong>: Settings → Safari → Location →{" "}
                <em>While Using</em>; atau Settings → [Nama App] → Location.
              </p>
              <p>
                <strong>Desktop Chrome</strong>: Klik ikon kunci → Site settings
                → Location → Allow.
              </p>
            </div>
          </details>
        </div>
      )}

      {status === "unsupported" && (
        <p className="text-sm text-gray-700">
          Geolocation tidak tersedia. Pastikan menggunakan HTTPS dan browser
          modern.
        </p>
      )}
    </div>
  );
}
