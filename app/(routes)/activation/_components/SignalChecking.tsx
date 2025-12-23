"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import checkSignalHome from "@/public/assets/Images/check-signal-home.webp";
import Swal from "sweetalert2";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { useRouter } from "next/navigation";
import { getSignal } from "@/app/_api/CoreNetwork/CoreNetwork";
import { getSignalLevel } from "@/app/_shared/utils";
import { useSSE } from "@/app/_context/SSEContext";

export type Level = 0 | 1 | 2 | 3 | 4;

type SignalCheckingProps = {
  mode?: "auto" | "result";
  level?: Level;
  autoDurationMs?: number;
  onRetry?: () => void;
  onNext?: (finalLevel: Level) => void;
  primaryLabel?: string;
  retryLabel?: string;
};

const levelColor: Record<Level, string> = {
  0: "bg-gray-300",
  1: "bg-red-500",
  2: "bg-yellow-500",
  3: "bg-green-500",
  4: "bg-emerald-600",
  // 5: "bg-emerald-600",
};

const barHeight = (b: number) =>
  (["25%", "50%", "75%", "100%"] as const)[b - 1];

const levelTitle: Record<Level, string> = {
  0: "Tidak Terdeteksi",
  1: "Buruk",
  2: "Kurang",
  3: "Cukup",
  4: "Baik",
  // 5: "Sempurna",
};

const levelAdvice: Record<Level, string> = {
  0: "Sinyal tidak terdeteksi. Pindahkan modem ke area terbuka atau dekat jendela, lalu coba lagi.",
  1: "Sinyal buruk. Silakan pindahkan modem ke lokasi yang lebih tinggi atau dekat jendela untuk meningkatkan koneksi, lalu lakukan Cek Ulang.",
  2: "Koneksi internet bisa lebih baik. Silakan pindahkan modem ke lokasi yang lebih tinggi atau dekat jendela untuk meningkatkan koneksi, lalu lakukan Cek Ulang.",
  3: "Sinyal baik. Tidak perlu perubahan posisi.",
  4: "Posisi modem sudah optimal untuk koneksi yang stabil",
  // 5: "Posisi modem sudah optimal untuk koneksi yang stabil.",
};

const mapSignalLevelToBar = (
  level: "good" | "poor" | "bad" | "disconnected"
): Level => {
  switch (level) {
    case "good":
      return 4;
    case "poor":
      return 3;
    case "bad":
      return 1;
    case "disconnected":
      return 0;
    default:
      return 0;
  }
};

const SignalChecking: React.FC<SignalCheckingProps> = ({
  mode = "auto",
  level,
  autoDurationMs = 1500,
  onRetry,
  onNext,
  primaryLabel = "Konfirmasi",
  retryLabel = "Cek Ulang",
}) => {
  const [isScanning, setIsScanning] = useState(mode === "auto");
  const [resultLevel, setResultLevel] = useState<Level>(level ?? 0);
  const [showPopup, setShowPopup] = useState(false);
  const [signalData, setSignalData] = useState<{
    rsrp: number | null;
    rsrq: number | null;
    sinr: number | null;
    level: "good" | "poor" | "bad" | "disconnected";
  }>({
    rsrp: null,
    rsrq: null,
    sinr: null,
    level: "disconnected",
  });
  const [isLoadingSignal, setIsLoadingSignal] = useState(true);
  const [sn, setSn] = useState<string | null>(null);
  const [cellId, setCellId] = useState<string | null>(null);

  const router = useRouter();
  const { lastEvent } = useSSE();

  useEffect(() => {
    setSn(localStorage.getItem("ira-cpe-serial-number"));
    setCellId(localStorage.getItem("ira-cpe-cell-id"));
  }, []);

  const triggerGetSignal = useCallback(() => {
    setIsScanning(true);
    getSignal({ sn });
  }, [sn]);

  useEffect(() => {
    triggerGetSignal();
  }, [triggerGetSignal]);

  useEffect(() => {
    if (!lastEvent) return;

    // Pastikan event-nya get_signal
    if (lastEvent.type !== "get_signal") return;

    const payload = lastEvent.data;
    if (!payload) return;

    const { rsrp, rsrq, sinr, cell_id } = payload;

    localStorage.setItem(
      "ira-cpe-cell-id",
      cell_id ?? "Cell ID from type = get_signal not found"
    );

    // Mapping level (pakai util yang sudah ada)
    const signalQuality = getSignalLevel(rsrp, rsrq, sinr);
    const barLevel = mapSignalLevelToBar(signalQuality);

    setSignalData({
      rsrp,
      rsrq,
      sinr,
      level: signalQuality,
    });

    setResultLevel(barLevel);
    setIsScanning(false);
  }, [lastEvent]);

  const handleRetry = () => {
    triggerGetSignal();
    onRetry?.();
  };

  const closePopup = useCallback(() => {
    // console.log("selesai");
    setShowPopup(false);
    onNext?.(resultLevel);
    router.replace("/customer-area");
  }, [onNext, resultLevel, router]);

  const retryFromPopup = () => {
    setShowPopup(false);
    handleRetry();
  };

  useEffect(() => {
    if (!showPopup) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePopup();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePopup, showPopup]);

  const handleNext = () => {
    setShowPopup(true);
  };

  return (
    <div className="min-h-[80vh] w-full grid place-items-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8">
        {/* Header */}
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="col-start-2 text-center text-[32px] font-bold text-old-primary">
            Cek Kekuatan Sinyal
          </div>
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
                {[1, 2, 3, 4].map((bar) => (
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
                      ].join(" ")}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {showPopup && (
              <ModalTemplate
                key="activation-modal"
                closeModal={closePopup}
                classNameModal="p-6 max-w-lg w-full mx-4 text-center"
              >
                <h3 className="text-old-primary mt-6 font-bold text-lg">
                  CPE Anda berhasil teraktivasi!
                </h3>
                <p className="mt-5 font-medium text-sm text-black">
                  Apakah penempatan modem Anda sudah optimal?
                  <br />
                  Cek kekuatan sinyal modem di sini!
                </p>

                <div className="mt-5 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={retryFromPopup}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-button hover:bg-dark-primary-2 px-6 py-3 text-white text-sm font-semibold cursor-pointer"
                  >
                    Cek Ulang
                  </button>
                  <button
                    type="button"
                    onClick={closePopup}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-green-primary px-6 py-3 text-white text-sm font-semibold cursor-pointer"
                  >
                    Selesai
                  </button>
                </div>
              </ModalTemplate>
            )}
          </AnimatePresence>

          {/* Title + Advice */}
          <div className="text-center space-y-1">
            <div className="font-tertiary text-black text-xl font-bold">
              {isScanning
                ? "Mohon tunggu beberapa saat..."
                : levelTitle[resultLevel]}
            </div>
            <div className="font-tertiary text-sm text-black font-medium">
              {isScanning
                ? "Pastikan modem diletakkan di tempat terbuka agar hasil lebih akurat."
                : levelAdvice[resultLevel]}
            </div>
          </div>

          {!isScanning && (
            <div className="flex flex-col gap-6">
              {/* <div className="text-xs text-gray-500 mt-2">
                RSRP: {signalData.rsrp} dBm · RSRQ: {signalData.rsrq} dB · SINR:{" "}
                {signalData.sinr} dB
              </div> */}
              <div className="text-xs text-gray-500 mt-2">
                Cell ID: {cellId}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isScanning}
            className="h-10 font-semibold rounded-full border border-gray-300 bg-white px-4 text-sm hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            {retryLabel}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isScanning}
            className="h-10 font-bold rounded-full bg-button px-5 text-sm text-white hover:bg-dark-primary-2 disabled:opacity-50 cursor-pointer"
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
