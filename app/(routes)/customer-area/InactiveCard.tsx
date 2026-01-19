import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Image from "next/image";
import React from "react";
import inActiveIcon from "@/public/assets/Images/inActiveImage.png";
import { formattedDate } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";

const InactiveCard = ({ data }: { data?: SubscriptionHistoryAPI | null }) => {
  const router = useRouter();

  return (
    <div className="text-center py-6 px-4 bg-gradient-to-b from-white via-white to-[#D6211E] rounded-xl shadow-lg">
      {/* Ikon Peringatan Besar */}
      <div className="flex justify-center mb-4">
        <Image
          src={inActiveIcon} // Gunakan exclamationIcon atau inActiveIcon, sesuaikan visual
          width={120}
          height={120}
          alt="warning-icon"
          className="animate-pulse"
        />
      </div>

      {/* Judul Utama */}
      <p className="text-sm sm:text-base font-bold text-[#D6211E] mb-2">
        Internet nonaktif—Perangkat Sudah Diambil
      </p>

      {/* Deskripsi */}
      <p className="text-xs sm:text-sm text-gray-800 mb-6">
        <span className="font-bold">
          Perangkat (CPE) Anda telah berhasil diambil.{" "}
        </span>
        Jika Anda ingin melanjutkan berlangganan dan menikmati koneksi Internet
        Rakyat kembali, silakan{" "}
        <span className="font-bold"> pesan CPE baru </span> melalui tombol di
        bawah ini.
      </p>

      {/* Tombol CTA */}
      <button
        onClick={() => router.push("/reregistration")}
        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-md"
      >
        Daftar Ulang
      </button>
    </div>
  );
};

export default InactiveCard;
