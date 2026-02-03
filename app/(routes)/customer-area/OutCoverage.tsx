import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Image from "next/image";
import React, { useState } from "react";
import outCoverage from "@/public/assets/Images/OutCoverage.png";
import { formattedDate, toastErrorFromAPI } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/store";
import { getCheckCoverage } from "@/app/_api/Location/Location";
import toast from "react-hot-toast";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import ModalCheckCoverage from "../check-coverage/_components/ModalCheckCoverage";

const OutCoverage = ({ data }: { data?: SubscriptionHistoryAPI | null }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isCoverage, setIsCoverage] = useState<boolean>(false);
  const [modalResult, setModalResult] = useState<boolean>(false);
  const [mitraPaket, setMitraPaket] = useState<string | null>(null);
  const [dataChooseMap, setDataChooseMap] = useState<any>(null);

  const { userInfo } = useAppSelector((state) => state.auth);

  const checkRadius = async () => {
    setIsLoading(true);
    try {
      const payload = {
        latitude: userInfo?.latitude,
        longitude: userInfo?.longitude,
      };

      const res = await getCheckCoverage(payload);
      setIsCoverage(res.data?.result.inside_coverage);
      setMitraPaket(res.data?.result.mitra_id || null);
      setModalResult(true);
    } catch (err: any) {
      toastErrorFromAPI(err);
      toast.error("Gagal mengecek ketersediaan");
    } finally {
      setIsLoading(false);
    }
  };

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
      <p className="text-xs sm:text-sm  mb-6">
        Jangan khawatir! kami akan segera memberi tahu kamu melalui{" "}
        <span className="font-bold">Aplikasi IRA</span>. Tunggu info dari kami!
      </p>

      {/* Tombol CTA */}
      <button
        onClick={checkRadius}
        className="inline-flex justify-center items-center my-4  rounded-full cursor-pointer"
        id="button-beli-paket-sekarang"
      >
        <div className="w-full relative flex justify-center items-center bg-subs-expired rounded-full h-11 overflow-hidden custom-bg-animation drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {/* glossy highlight */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 fancy-background-expired w-[95%] h-6.5 rounded-full z-0" />

          <span className="relative z-10 text-white text-sm sm:text-base md:text-lg font-bold whitespace-nowrap px-16">
            Cek Jangkauan
          </span>
        </div>
      </button>

      {/* Modal Result */}
      {modalResult && (
        <ModalTemplate
          closeModal={() => setModalResult(false)}
          classNameModal=""
        >
          <ModalCheckCoverage
            statusCoverage={isCoverage}
            mitraPaket={mitraPaket}
            address={dataChooseMap}
            closeModal={() => setModalResult(false)}
          />
        </ModalTemplate>
      )}
    </div>
  );
};

export default OutCoverage;
