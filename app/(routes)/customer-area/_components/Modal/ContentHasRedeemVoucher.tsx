import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import moment from "moment";
import "moment/locale/id";
import checkIcon from "@/public/assets/Icons/check-icon.svg";
import toast from "react-hot-toast";

interface AppOpenBannerRedeemProps {
  setShowModalAlreadyClaimed: (val: boolean) => void;
  endDate: string;
  redeemCode: string;
}

function ContentHasRedeemVoucher({
  setShowModalAlreadyClaimed,
  endDate,
  redeemCode,
}: AppOpenBannerRedeemProps) {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
  };
  return (
    <div>
      {" "}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{
          type: "spring" as const,
          stiffness: 300,
          damping: 25,
          duration: 0.2,
        }}
      >
        <div className="px-6 py-5">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <Image src={checkIcon} alt="check icon" />
          </div>

          {/* Title */}
          <h1 className="text-center text-xl lg:text-2xl font-bold w-full mx-auto text-gray-900">
            {/* Voucher Internet Rakyat x Folaplus Bola Gembira 2026 Berhasil
            Diklaim */}
            Voucher Bola Gembira Berhasil Diklaim
          </h1>

          {/* Description */}
          <p className="mt-4 w-full mx-auto text-center text-gray-600 text-sm leading-relaxed">
            {/* Selamat! Anda berhasil mendapatkan voucher Internet Rakyat x
            Folaplus Bola Gembira 2026. Silakan gunakan voucher sebelum{" "} */}
            Selamat! Anda berhasil mendapatkan voucher Bola Gembira. Silakan
            gunakan voucher sebelum{" "}
            <strong className="text-gray-900">
              {endDate ? moment(endDate).format("DD MMMM YYYY") : "-"}
            </strong>
          </p>

          {/* Voucher Ticket SVG */}
          <div className="mt-3 ">
            <div className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="294"
                height="60"
                viewBox="0 0 294 60"
                fill="none"
                className="w-full h-auto"
              >
                {/* Background Path */}
                <path
                  d="M289 58.4H5C2.79086 58.4 1 56.6091 1 54.4V42.9C1 40.6 7.92308 40.6 7.92308 33.7C7.92308 28.18 3.30769 25.2682 1 24.5V11C1 8.79086 2.79086 7 5 7H21.7692H289C291.209 7 293 8.79086 293 11V24.5C293 26.8 286.077 26.8001 286.077 33.7C286.077 39.2201 290.692 42.1319 293 42.9V54.4C293 56.6091 291.209 58.4 289 58.4Z"
                  fill="#EDF8F6"
                />
                {/* Border/Stroke Path */}
                <path
                  d="M21.7692 7V16.2M21.7692 20.8V37.9M21.7692 41.5V58.4M293 42.9V54.4C293 56.6091 291.209 58.4 289 58.4H5C2.79086 58.4 1 56.6091 1 54.4V42.9C1 40.6 7.92308 40.6 7.92308 33.7C7.92308 28.18 3.30769 25.2682 1 24.5V11C1 8.79086 2.79086 7 5 7H289C291.209 7 293 8.79086 293 11V24.5C293 26.8 286.077 26.8001 286.077 33.7C286.077 39.2201 290.692 42.1319 293 42.9Z"
                  stroke="#4CB9A3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Voucher Code Text */}
                <text
                  x="50%"
                  y="57%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#2E695D"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {redeemCode || "-"}
                </text>
              </svg>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            {/* Salin Kode Voucher Button */}
            <button
              onClick={async () => {
                if (redeemCode) {
                  try {
                    await navigator.clipboard.writeText(redeemCode);
                    toast.success("Kode voucher berhasil disalin!");
                  } catch {
                    toast.error("Gagal menyalin kode voucher");
                  }
                }
              }}
              className="w-full bg-[#D7201D] hover:bg-[#b01a17] active:scale-[0.98] text-white py-3.5 rounded-full font-semibold text-base cursor-pointer transition-all"
            >
              Salin Kode Voucher
            </button>

            {/* Kembali Button */}
            <button
              onClick={() => setShowModalAlreadyClaimed(false)}
              className="w-full bg-white border border-[#520201] text-[#D7201D] hover:bg-gray-50 active:scale-[0.98] py-3.5 rounded-full font-semibold text-base cursor-pointer transition-all"
            >
              Kembali
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ContentHasRedeemVoucher;
