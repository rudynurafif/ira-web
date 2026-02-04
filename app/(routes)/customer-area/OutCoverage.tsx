import Image from "next/image";
import { useState } from "react";
import outCoverage from "@/public/assets/Images/OutCoverage.png";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/store/store";

const OutCoverage = ({ onCheckCoverage }: { onCheckCoverage: () => void }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
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
        <p className="text-xs sm:text-sm  mb-6">
          Jangan khawatir! kami akan segera memberi tahu kamu melalui{" "}
          <span className="font-bold">Aplikasi IRA</span>. Tunggu info dari
          kami!
        </p>

        {/* Tombol CTA */}
        <button
          onClick={onCheckCoverage}
          disabled={isLoading}
          className="inline-flex disabled:cursor-not-allowed! justify-center items-center my-4 rounded-full cursor-pointer"
          id="button-beli-paket-sekarang"
        >
          <div className="w-full relative flex justify-center items-center bg-subs-expired rounded-full h-11 overflow-hidden custom-bg-animation drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            {/* glossy highlight */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 fancy-background-expired w-[95%] h-6.5 rounded-full z-0" />

            <span className="relative flex gap-2 items-center z-10 text-white text-sm sm:text-base md:text-lg font-bold whitespace-nowrap px-16">
              {isLoading && <div className="loading w-5 h-5"></div>}
              {isLoading ? "Mengecek..." : "Cek Jangkauan"}
            </span>
          </div>
        </button>
      </div>
    </>
  );
};

export default OutCoverage;
