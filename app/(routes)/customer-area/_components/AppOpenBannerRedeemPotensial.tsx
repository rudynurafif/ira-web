import { getActiveCampaign } from "@/app/_api/Redeem/Redeem";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import VoucherRedeemDesktopV2 from "@/public/assets/Images/bg-voucher-redeem-potensial.webp";
import VoucherRedeemDesktopV2Mobile from "@/public/assets/Images/bg-voucher-redeem-potensial-mobile.png";
import Image from "next/image";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";

import ContentClaimVoucherModal from "./Modal/ContentClaimVoucherModal";
import ContentHasRedeemVoucher from "./Modal/ContentHasRedeemVoucher";
import { FaCheckCircle } from "react-icons/fa";

interface AppOpenBannerRedeemProps {
  dismissed: boolean;
  setDismissed: (val: boolean) => void;
  redeemCode: string;
  endDate: string;
  hasRedeemCode: boolean;
  userInfo: any;
}

export default function AppOpenBannerRedeemPotensial({
  dismissed,
  setDismissed,
  redeemCode,
  endDate,
  hasRedeemCode,
  userInfo,
}: AppOpenBannerRedeemProps) {
  const [showModalAlreadyClaimed, setShowModalAlreadyClaimed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ State untuk modal konfirmasi

  if (dismissed) return null;

  // ✅ Handler saat tombol banner diklik -> tampilkan modal konfirmasi
  const handleBannerClick = () => {
    if (hasRedeemCode) {
      setShowModalAlreadyClaimed(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="w-full">
      {/* Mobile Banner */}
      <div className="relative w-full md:hidden mb-5">
        <Image
          src={VoucherRedeemDesktopV2Mobile}
          alt="Voucher Redeem"
          className="w-full drop-shadow-lg rounded-t-[12px]"
        />

        <div className="relative bg-[#F1F1F1] h-fit  w-full p-2 rounded-b-[12px]">
          <div className=" p-1 rounded-[12px] -mt-[110px]">
            <div className="bg-white border border-[#B41B1980] rounded-[12px] p-3 text-center">
              {!hasRedeemCode ? (
                <div>
                  <h1 className="font-bold text-black">
                    Bola Gembira 2026 Makin Seru, Harga Lebih Murah di Aplikasi
                    IRA
                  </h1>

                  <span className="font-light text-xs pt-2">
                    Hanya dengan bayar internet Rp100,000 melalui aplikasi IRA
                    kamu bisa dapat:
                  </span>

                  <div className="flex max-[395px]:flex-wrap w-full justify-between gap-1 items-center pt-3">
                    <div className="w-full flex gap-2 p-2 items-center border border-[#D8E3F5] rounded-[6px]">
                      <div className="">
                        <FaCheckCircle className="text-[#16A34A]" />
                      </div>
                      <div className="!text-left text-[11px] font-medium">
                        Internet 3 bulan<span className="text-red-500">*</span>
                      </div>
                    </div>

                    <div className="w-full flex gap-2 p-2 items-center border border-[#D8E3F5] rounded-[6px]">
                      <div>
                        <FaCheckCircle className="text-[#16A34A]" />
                      </div>
                      <div className="!text-left text-[11px] font-medium">
                        Akses Bola Gembira
                      </div>
                    </div>
                  </div>

                  <span className="block !text-left pt-2 text-[10px] font-light">
                    <span className=" text-red-500">*</span> Internet akan aktif{" "}
                    {"(dilakukan pemasangan)"} ketika lokasi kamu sudah tercover
                    jaringan IRA
                  </span>
                </div>
              ) : (
                <div>
                  <h1 className="font-bold text-black">
                    Voucher Kamu Sudah Siap Digunakan!
                  </h1>

                  <p className="text-xs text-[#333] pt-3">
                    Voucher kamu sudah tersedia. Silakan lihat kode voucher
                    untuk mulai menikmati akses Bola Gembira 2026.
                  </p>
                </div>
              )}

              <button
                onClick={handleBannerClick} // ✅ Ubah ke handleBannerClick
                className="mt-5 w-full hover:scale-105 
             bg-[linear-gradient(180deg,#520201_0%,#D7201D_60.46%,#DC7371_100%)]
             shadow-[0_0_10px_0_#FFF]
             border-2 border-white 
             text-white font-bold rounded-full 
             py-3 px-5 text-[11px]   sm:text-sm 
             hover:shadow-[0_0_18px_rgba(255,255,255,0.5)] hover:border-white/60
             active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap z-10"
              >
                {hasRedeemCode ? "Lihat Voucher" : "Redeem Voucher Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Banner */}
      <div className="relative w-full max-md:hidden mb-5">
        <Image
          src={VoucherRedeemDesktopV2}
          alt="Voucher Redeem"
          className="w-full drop-shadow-lg rounded-t-[12px]"
        />

        <div className="relative bg-[#520201] h-fit  w-full p-3 rounded-b-[12px]">
          <div className="border border-white p-1 rounded-[12px] -mt-[120px]">
            <div className="bg-white rounded-[12px] p-3 text-center">
              {!hasRedeemCode ? (
                <div>
                  <h1 className="font-bold text-black">
                    Bola Gembira 2026 Makin Seru, Harga Lebih Murah di Aplikasi
                    IRA
                  </h1>

                  <span className="font-light text-xs pt-2">
                    Hanya dengan bayar internet Rp100,000 melalui aplikasi IRA
                    kamu bisa dapat:
                  </span>

                  <div className="grid grid-cols-2 gap-4 items-center pt-3">
                    <div className="flex gap-2 p-2 items-center border border-[#D8E3F5] rounded-[6px]">
                      <div>
                        <FaCheckCircle className="text-[#16A34A]" />
                      </div>
                      <div className="text-[14px] font-medium">
                        Internet 3 bulan<span className="text-red-500">*</span>
                      </div>
                    </div>

                    <div className="flex gap-2 p-2 items-center border border-[#D8E3F5] rounded-[6px]">
                      <div>
                        <FaCheckCircle className="text-[#16A34A]" />
                      </div>
                      <div className="text-[14px] font-medium">
                        Akses Bola Gembira
                      </div>
                    </div>
                  </div>

                  <span className=" pt-2 block !text-left text-[10px] font-light">
                    <span className=" text-red-500">*</span> Internet akan aktif{" "}
                    {"(dilakukan pemasangan)"} ketika lokasi kamu sudah tercover
                    jaringan IRA
                  </span>
                </div>
              ) : (
                <div>
                  <h1 className="font-bold text-black">
                    Voucher Kamu Sudah Siap Digunakan!
                  </h1>

                  <p className="text-xs text-[#333] pt-3">
                    Voucher kamu sudah tersedia. Silakan lihat kode voucher
                    untuk mulai menikmati akses Bola Gembira 2026.
                  </p>
                </div>
              )}

              <button
                onClick={handleBannerClick} // ✅ Ubah ke handleBannerClick
                className="mt-5 w-full hover:scale-102 
             bg-[linear-gradient(180deg,#520201_0%,#D7201D_60.46%,#DC7371_100%)]
             shadow-[0_0_10px_0_#FFF]
             border-2 border-white 
             text-white font-bold rounded-full 
             py-3 px-5 text-[11px]  sm:text-sm 
             hover:shadow-[0_0_18px_rgba(255,255,255,0.5)] hover:border-white/60
             active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap z-10"
              >
                {hasRedeemCode ? "Lihat Voucher" : "Redeem Voucher Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModalAlreadyClaimed && (
        <ModalTemplate
          closeModal={() => setShowModalAlreadyClaimed(false)}
          classNameModal="max-w-lg"
        >
          <ContentHasRedeemVoucher
            setShowModalAlreadyClaimed={setShowModalAlreadyClaimed}
            endDate={endDate}
            redeemCode={redeemCode}
          />
        </ModalTemplate>
      )}

      {/* ✅ Modal: Konfirmasi Buka Aplikasi (BARU) */}
      {showConfirmModal && (
        <ModalTemplate
          closeModal={() => setShowConfirmModal(false)}
          classNameModal="max-w-lg"
        >
          <ContentClaimVoucherModal
            userInfo={userInfo}
            setShowConfirmModal={setShowConfirmModal}
          />
        </ModalTemplate>
      )}
    </div>
  );
}
