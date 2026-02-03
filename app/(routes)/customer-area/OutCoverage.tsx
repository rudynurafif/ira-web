import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import outCoverage from "@/public/assets/Images/OutCoverage.png";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import {
  getCheckCoverage,
  getCheckCoverageLogin,
} from "@/app/_api/Location/Location";
import toast from "react-hot-toast";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import imageFailed from "@/public/assets/check-coverage/check-failed.png";
import RegistrationSummary from "./_components/Modal/RegistrationSummary";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { getUser } from "@/app/store/slice/authSlice";

const OutCoverage = ({ data }: { data?: SubscriptionHistoryAPI | null }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

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

      const res = await getCheckCoverageLogin(payload);
      const insideCoverage = res.data?.result.inside_coverage;

      setIsCoverage(insideCoverage);
      setMitraPaket(res.data?.result.mitra_id || null);
      setModalResult(true);

      if (insideCoverage) {
        try {
          const profileRes = await getProfileInfo({});
          const customerData = profileRes.data?.data?.customer ?? {};
          dispatch(getUser(customerData));

          toast.success("Area Anda sudah tercakup! Silakan daftar paket.");
        } catch (err) {
          console.error("Failed to refetch profile:", err);
        }
      }
    } catch (err: any) {
      toastErrorFromAPI(err);
      toast.error("Gagal mengecek ketersediaan");
    } finally {
      setIsLoading(false);
    }
  };

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
          onClick={checkRadius}
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

      {/* Modal Result */}
      {modalResult && (
        <ModalTemplate
          closeModal={() => setModalResult(false)}
          classNameModal={isCoverage ? "p-8" : ""}
          width={isCoverage ? "max-w-[736px]" : "max-w-2xl"}
        >
          {isCoverage ? (
            <RegistrationSummary onBack={() => setModalResult(false)} />
          ) : (
            <div className="rounded-xl overflow-hidden">
              <div className="w-full">
                <Image
                  alt="image-status"
                  src={imageFailed}
                  className="w-full"
                />
              </div>
              <div className="my-8 text-start px-5">
                <h1 className="text-primary text-center text-2xl font-bold w-full sm:w-3/4 mx-auto">
                  Layanan di Areamu Segera Hadir
                </h1>
                <p className="mt-3 w-full mx-auto text-center">
                  Jangan khwatir! Kami akan segera memberi tahu kamu melalui
                  Aplikasi IRA jika layanan kami tersedia di daerahmu.
                </p>
                <button
                  onClick={() => setModalResult(false)}
                  className="w-full cursor-pointer py-4 text-white font-bold bg-primary hover:bg-dark-primary-2 rounded-xl mt-6"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </ModalTemplate>
      )}
    </>
  );
};

export default OutCoverage;
