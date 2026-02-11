import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Image from "next/image";
import React, { useState } from "react";
import inActiveIcon from "@/public/assets/Images/inActiveImage.png";
import { formattedDate } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import RegistrationSummary from "./_components/Modal/RegistrationSummary";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";

const InCoverage = ({ data }: { data?: SubscriptionHistoryAPI | null }) => {
  const router = useRouter();
  const [modalResult, setModalResult] = useState<boolean>(false);

  return (
    <>
      <div className="text-center py-6 px-4 bg-linear-to-b from-white via-white to-[#D6211E] rounded-xl shadow-lg">
        {/* Ikon Peringatan Besar */}
        <div className="flex justify-center mb-4">
          <Image
            src={inActiveIcon}
            width={140}
            height={140}
            alt="warning-icon"
            className="animate-pulse"
          />
        </div>

        {/* Judul Utama */}
        <p className="text-sm sm:text-base font-bold text-[#D6211E] mb-2">
          Layanan IRA Sudah Tersedia di Areamu!
        </p>

        {/* Deskripsi */}
        <p className="text-xs sm:text-sm text-gray-800 mb-6">
          Mulai berlangganan dan nikmati internet cepat dari IRA. Kami siap
          bantu kapan saja.
        </p>

        {/* Tombol CTA */}
        <button
          onClick={() => setModalResult(true)}
          className="inline-flex justify-center items-center mt-4 gradient-box-expired rounded-full custom-click cursor-pointer"
          id="button-beli-paket-sekarang"
        >
          <div className="w-full relative flex justify-center items-center bg-subs-expired rounded-full h-11 overflow-hidden custom-bg-animation drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            {/* glossy highlight */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 fancy-background-expired w-[92%] h-6.5 rounded-full z-0" />

            <span className="relative z-10 text-white text-sm sm:text-base md:text-lg font-bold whitespace-nowrap px-6">
              Mulai Berlangganan
            </span>
          </div>
        </button>
      </div>
      {modalResult && (
        <ModalTemplate
          closeModal={() => setModalResult(false)}
          classNameModal={"p-8"}
          width={"max-w-[1200px]"}
        >
          <RegistrationSummary onBack={() => setModalResult(false)} />
        </ModalTemplate>
      )}
    </>
  );
};

export default InCoverage;
