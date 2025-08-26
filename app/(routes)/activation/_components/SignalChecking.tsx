"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import checkSignalHome from "@/public/assets/Images/check-signal-home.svg";
import Swal from "sweetalert2";

/** ======================
 *  Types & Config
 * ====================== */
type Level = 0 | 1 | 2 | 3 | 4 | 5;

type SignalCheckingProps = {
  /** auto = tampilkan animasi scanning lalu show result.
   *  result = langsung tampilkan hasil (pakai prop level). */
  mode?: "auto" | "result";
  /** level hasil (0..4). Jika mode=auto dan level tidak diberikan → random. */
  level?: Level;
  /** durasi scanning (ms) bila mode=auto */
  autoDurationMs?: number;
  /** handler tombol */
  onRetry?: () => void;
  onNext?: (finalLevel: Level) => void;
  /** teks tombol primary */
  primaryLabel?: string;
  /** teks tombol retry */
  retryLabel?: string;
};

const levelColor: Record<Level, string> = {
  0: "bg-gray-300",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-green-500",
  5: "bg-emerald-600",
};

const barHeight = (b: number) =>
  (["0%", "24%", "48%", "72%", "88%", "100%"] as const)[b];

const levelTitle: Record<Level, string> = {
  0: "Tidak Terdeteksi",
  1: "Buruk",
  2: "Kurang",
  3: "Cukup",
  4: "Baik",
  5: "Sempurna",
};

const levelAdvice: Record<Level, string> = {
  0: "Sinyal tidak terdeteksi. Pindahkan modem ke area terbuka atau dekat jendela, lalu coba lagi.",
  1: "Sinyal buruk. Silakan pindahkan modem ke lokasi yang lebih tinggi atau dekat jendela untuk meningkatkan koneksi, lalu lakukan Cek Ulang.",
  2: "Sinyal kurang. Geser ke area yang lebih terbuka untuk kualitas lebih baik.",
  3: "Koneksi internet bisa lebih baik. Silakan pindahkan modem ke lokasi yang lebih tinggi atau dekat jendela untuk meningkatkan koneksi, lalu lakukan Cek Ulang.",
  4: "Sinyal baik. Tidak perlu perubahan posisi.",
  5: "Posisi modem sudah optimal untuk koneksi yang stabil.",
};

/** ======================
 *  Main Component
 * ====================== */
const SignalChecking: React.FC<SignalCheckingProps> = ({
  mode = "auto",
  level,
  autoDurationMs = 2200,
  onRetry,
  onNext,
  primaryLabel = "Selesai",
  retryLabel = "Cek Ulang",
}) => {
  const [isScanning, setIsScanning] = useState(mode === "auto");
  const [resultLevel, setResultLevel] = useState<Level>(level ?? 0);

  useEffect(() => {
    if (!isScanning) return;
    const id = setTimeout(() => {
      const final: Level =
        typeof level === "number"
          ? (level as Level)
          : ((Math.floor(Math.random() * 5) + 1) as Level);
      setResultLevel(final);
      setIsScanning(false);
    }, autoDurationMs);
    return () => clearTimeout(id);
  }, [isScanning, autoDurationMs, level]);

  const handleRetry = () => {
    setResultLevel(0);
    setIsScanning(true);
    onRetry?.();
  };

  const [showPopup, setShowPopup] = useState(false);

  const closePopup = () => {
    console.log("selesai");
    setShowPopup(false);
    onNext?.(resultLevel);
  };

  const retryFromPopup = () => {
    setShowPopup(false);
    handleRetry();
  };

  useEffect(() => {
    if (!showPopup) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePopup();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPopup]);

  const handleNext = () => {
    setShowPopup(true);
  };

  return (
    <div className="min-h-[80vh] w-full grid place-items-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8">
        {/* Header */}
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="col-start-2 text-[32px] font-bold text-dark-primary">
            Cek Kekuatan Sinyal
          </div>
          <span className="col-start-3 justify-self-end text-sm text-gray-500">
            {isScanning ? "Memindai..." : "Hasil"}
          </span>
        </div>

        {/* Ilustrasi Rumah + Bars */}
        <div className="flex flex-col items-center gap-6 py-4">
          <Image src={checkSignalHome} alt="check signal home" width={350} />

          {/* Signal bars */}
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="scan"
                className="flex items-end gap-2 h-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-6 rounded-md bg-gray-300"
                    animate={{ height: ["20%", "80%", "35%", "70%", "20%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4,
                      ease: "easeInOut",
                      delay: i * 0.12,
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                className="flex items-end gap-2 h-20"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                  },
                }}
              >
                {[1, 2, 3, 4, 5].map((bar) => (
                  <motion.div
                    key={bar}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="w-6 rounded-md"
                    style={{ height: barHeight(bar) }}
                  >
                    <div
                      className={[
                        "h-full w-full rounded-md",
                        bar <= resultLevel
                          ? levelColor[resultLevel]
                          : "bg-gray-200",
                        resultLevel === 5 && bar === 5
                          ? "ring-2 ring-emerald-300"
                          : "",
                      ].join(" ")}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {showPopup && (
              <motion.div
                className="fixed inset-0 z-50 grid place-items-center bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePopup}
              >
                <motion.div
                  className="w-[480px] rounded-2xl bg-white p-6 relative"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={closePopup}
                    className="absolute text-3xl cursor-pointer right-3 top-3 text-gray-500 hover:text-gray-700"
                    aria-label="Tutup"
                  >
                    ×
                  </button>

                  <h3 className="text-center text-dark-primary font-bold text-lg">
                    CPE Anda berhasil teraktivasi!
                  </h3>
                  <p className="mt-2 text-center font-medium text-sm text-black">
                    Apakah penempatan modem Anda sudah optimal?
                    <br />
                    Cek kekuatan sinyal modem di sini!
                  </p>

                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={retryFromPopup}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-button hover:bg-dark-primary-2 px-6 py-3 text-white text-sm font-semibold"
                    >
                      Cek Ulang
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title + Advice */}
          <div className="text-center space-y-1">
            <div className="font-tertiary text-black text-xl font-bold">
              {isScanning
                ? "Mohon tunggu beberapa detik..."
                : levelTitle[resultLevel]}
            </div>
            <div className="font-tertiary text-sm text-black font-medium">
              {isScanning
                ? "Pastikan modem diletakkan di tempat terbuka agar hasil lebih akurat."
                : levelAdvice[resultLevel]}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isScanning}
            className="h-10 rounded-full border border-gray-300 bg-white px-4 text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            {retryLabel}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isScanning}
            className="h-10 rounded-full bg-button px-5 text-sm text-white hover:bg-dark-primary-2 disabled:opacity-50"
          >
            {primaryLabel}
          </button>
        </div>

        {/* Footer kecil */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Tips: Jauhkan modem dari dinding tebal, lemari logam, atau perangkat
          yang memancarkan interferensi (microwave, Bluetooth kuat).
        </div>
      </div>
    </div>
  );
};

export default SignalChecking;
