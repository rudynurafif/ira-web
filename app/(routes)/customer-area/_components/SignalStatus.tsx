"use client";

import goodSignal from "@/public/assets/Icons/good-signal.svg";
import poorSignal from "@/public/assets/Icons/poor-signal.svg";
import badSignal from "@/public/assets/Icons/bad-signal.svg";
import disconnected from "@/public/assets/Icons/disconnected-signal.svg";
import Image from "next/image";

interface SignalStatusProps {
  rsrp: number | null;
  rsrq: number | null;
  sinr: number | null;
  cellId: string | null;
  level: "verygood" | "good" | "poor" | "bad" | "disconnected";
  onCheckSignal: () => void;
  isLoading: boolean;
  message: string;
}

const SignalStatus: React.FC<SignalStatusProps> = ({
  rsrp,
  rsrq,
  sinr,
  cellId,
  level,
  onCheckSignal,
  isLoading,
  message,
}) => {
  const config = {
    verygood: {
      icon: goodSignal,
      statusText: "Sangat Baik",
      internetText: "Connected",
    },
    good: {
      icon: goodSignal,
      statusText: "Baik",
      internetText: "Connected",
    },
    poor: {
      icon: poorSignal,
      statusText: "Cukup",
      internetText: "Connected",
    },
    bad: {
      icon: badSignal,
      statusText: "Buruk",
      internetText: "Connected",
    },
    disconnected: {
      icon: disconnected,
      statusText: "Tidak Terdeteksi",
      internetText: "Disconnected",
    },
  };

  const isScanning = isLoading;
  const showOutOfCoverage =
    !isLoading && (level === "disconnected" || message !== "Success");

  const displayConfig = isScanning
    ? {
        icon: goodSignal,
        statusText: "Mengecek Sinyal...",
        internetText: "Sedang memindai...",
      }
    : config[level];

  const { icon, statusText, internetText } = displayConfig;

  return (
    <div className="flex flex-col gap-6 bg-white rounded-lg shadow-lg p-6 max-sm:p-4 border border-gray-200">
      {showOutOfCoverage ? (
        <div className="text-center py-4">
          <div className="text-red-500 font-bold text-lg">⚠️ Ups!</div>
          <p className="mt-2 text-gray-700">
            <span className="font-bold">
              Kamu berada di luar jangkauan cell.
            </span>
            <br />
            Pastikan perangkat menyala dan berada di area tercover.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center">
              <Image
                src={icon}
                alt={`${level} signal icon`}
                width={28}
                height={28}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">
                Status Sinyal:{" "}
                <span className="font-bold">
                  {isLoading ? "Mengecek..." : statusText}
                </span>
              </p>
              <p>
                Status Internet:{" "}
                {isLoading ? "Sedang memindai..." : internetText}
              </p>
            </div>
          </div>

          {cellId && (
            <div className="text-center text-sm">
              <div className="text-secondary">
                Cell ID: <span className="">{cellId}</span>
              </div>
            </div>
          )}
        </>
      )}

      <button
        onClick={onCheckSignal}
        disabled={isLoading}
        className={`py-2 w-full disabled:cursor-not-allowed cursor-pointer rounded-lg font-medium text-white transition ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary hover:bg-dark-primary-2"
        }`}
      >
        {isLoading ? "Memuat..." : "Cek Sinyal"}
      </button>
    </div>
  );
};

export default SignalStatus;
