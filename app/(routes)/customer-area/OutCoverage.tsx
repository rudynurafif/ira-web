import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Image from "next/image";
import React from "react";
import outCoverage from "@/public/assets/Images/OutCoverage.png";
import { formattedDate } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";

const OutCoverage = ({ data }: { data?: SubscriptionHistoryAPI | null }) => {
  const router = useRouter();

  return (
    <div className="text-center py-6 px-4 bg-linear-to-b from-white via-white to-[#033683] rounded-xl shadow-lg">
      {/* Ikon Peringatan Besar */}
      <div className="flex justify-center mb-4">
        <Image
          src={outCoverage}
          width={140}
          height={140}
          alt="warning-icon"
          className="animate-pulse"
        />
      </div>

      {/* Judul Utama */}
      <p className="text-sm sm:text-base font-bold text-[#D6211E] mb-2">
        Layanan di Areamu Segera Hadir
      </p>

      {/* Deskripsi */}
      <p className="text-xs sm:text-sm text-gray-800 mb-6">
        Jangan khwatir! kami akan degera memberi tahu kamu melalui{" "}
        <span className="font-bold"> WhatsApp dan Aplikasi IRA</span> jika
        layanan kami tersedia di daerahmu.
      </p>

      {/* Tombol CTA */}
      <button
        onClick={() => router.push("/check-coverage")}
        className="inline-flex justify-center items-center mt-4 gradient-box-expired rounded-full custom-click cursor-pointer"
        id="button-beli-paket-sekarang"
      >
        <div className="w-full relative flex justify-center items-center bg-subs-expired rounded-full h-11 overflow-hidden custom-bg-animation drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {/* glossy highlight */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 fancy-background-expired w-[92%] h-6.5 rounded-full z-0" />

          <span className="relative z-10 text-white text-sm sm:text-base md:text-lg font-bold whitespace-nowrap px-6">
            Cek Jangkauan
          </span>
        </div>
      </button>
    </div>
  );
};

export default OutCoverage;
