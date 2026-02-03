import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Image from "next/image";
import React from "react";
import inActiveIcon from "@/public/assets/Images/inActiveImage.png";
import { formattedDate } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";

const InactiveCard = ({ data }: { data?: SubscriptionHistoryAPI | null }) => {
  const router = useRouter();

  return (
    <div className="text-center py-6 px-4 bg-linear-to-b from-white via-white to-[#666666] rounded-xl shadow-lg">
      {/* Ikon Peringatan Besar */}
      <div className="flex justify-center mb-4">
        <Image
          src={inActiveIcon} // Gunakan exclamationIcon atau inActiveIcon, sesuaikan visual
          width={140}
          height={140}
          alt="warning-icon"
          className="animate-pulse"
        />
      </div>

      {/* Judul Utama */}
      <p className="text-sm sm:text-base font-bold text-[#D6211E] mb-2">
        Internet nonaktif — Perangkat Sudah Diambil
      </p>

      {/* Deskripsi */}
      <p className="text-xs sm:text-sm mb-6">
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
        className="inline-flex justify-center items-center my-4 gradient-box-expired rounded-full cursor-pointer"
        id="button-beli-paket-sekarang"
      >
        <div className="w-full relative flex justify-center items-center bg-subs-expired rounded-full h-11 overflow-hidden custom-bg-animation drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {/* glossy highlight */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 fancy-background-expired w-[92%] h-6.5 rounded-full z-0" />

          <span className="relative z-10 text-white text-sm sm:text-base md:text-lg font-bold whitespace-nowrap px-16">
            Daftar Ulang
          </span>
        </div>
      </button>
    </div>
  );
};

export default InactiveCard;
