import React from "react";
import Image from "next/image";
import { FaChevronRight, FaStar } from "react-icons/fa";
import { IoArrowForward } from "react-icons/io5";
import { ActivePacketData } from "@/app/_shared/types/customer-area";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import confetti from "@/public/assets/Icons/confetti.svg";
import packageIcon from "@/public/assets/Icons/hargaPaket.svg";
import sandClock from "@/public/assets/Icons/jam-pasir.svg";
import rocket from "@/public/assets/Icons/rocket.svg";
import calendar from "@/public/assets/Icons/calendar-clock.svg";

const ActivePackageCard = ({
  packageName,
  packageDuration,
  price,
  speed,
  expiryDate,
  onExtend,
}: ActivePacketData) => {
  return (
    <div className="bg-linear-to-b from-white via-white to-[#CAE2EC] rounded-xl shadow-lg p-6 max-sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Logo */}
        <div className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center">
          <Image src={starIcon} alt="Starlite Icon" width={28} height={28} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-dark-primary">{packageName}</h3>
          <button
            onClick={onExtend}
            className="text-primary cursor-pointer flex items-center justify-center gap-1 text-sm underline hover:text-dark-primary transition"
          >
            Perpanjang Paket
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Message */}
      <div className="pt-4">
        <Image
          src={confetti}
          width={24}
          height={24}
          alt="confetti"
          className="mb-1"
        />
        <p className="text-sm font-bold text-gray-700">
          Selamat paket {packageName} baru kamu sudah aktif!
        </p>
        <p className="text-sm text-gray-700 mt-1">
          Nikmati <strong>{speed}</strong> penuh dan koneksi stabil selama{" "}
          <strong>{packageDuration}</strong> ke depan.
        </p>
      </div>

      <div className="border-t border-gray-200 my-6"></div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-10">
        {/* Harga Paket */}
        <div className="flex flex-col items-start gap-3">
          <Image src={packageIcon} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Harga Paket</p>
            <p className="text-lg">{price}</p>
          </div>
        </div>

        {/* Sisa Hari */}
        <div className="flex flex-col items-start gap-3">
          <Image src={sandClock} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Sisa Hari</p>
            <p className="text-lg">{packageDuration}</p>
          </div>
        </div>

        {/* Kecepatan Paket */}
        <div className="flex flex-col items-start gap-3">
          <Image src={rocket} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Kecepatan Paket</p>
            <p className="text-lg">{speed}</p>
          </div>
        </div>

        {/* Tanggal Jatuh Tempo */}
        <div className="flex flex-col items-start gap-3">
          <Image src={calendar} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Tanggal Jatuh Tempo</p>
            <p className="text-lg">{expiryDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePackageCard;
