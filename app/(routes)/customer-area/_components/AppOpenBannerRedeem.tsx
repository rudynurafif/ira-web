import { getActiveCampaign } from "@/app/_api/Redeem/Redeem";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import VoucherRedeemv2 from "@/public/assets/Images/voucher-redeem-v2.png";
import VoucherRedeemDesktop from "@/public/assets/Images/voucher-redeem-desktop.webp";
import VoucherRedeemDesktopV2 from "@/public/assets/Images/voucher-redeem-desktop-v2.webp";
import Image from "next/image";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";

import ContentClaimVoucherModal from "./Modal/ContentClaimVoucherModal";
import ContentHasRedeemVoucher from "./Modal/ContentHasRedeemVoucher";

interface AppOpenBannerRedeemProps {
  dismissed: boolean;
  setDismissed: (val: boolean) => void;
  redeemCode: string;
  endDate: string;
  hasRedeemCode: boolean;
  userInfo: any;
}

export default function AppOpenBannerRedeem({
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

  // ✅ Fungsi inti untuk membuka aplikasi (dengan penanganan macOS)
  // const executeOpenInApp = () => {
  //   const ua = navigator.userAgent || "";
  //   const platform = navigator.platform || "";

  //   const isAndroid = /Android/i.test(ua);
  //   const isIOS = /iPhone|iPad|iPod/i.test(ua);
  //   const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(platform); // ✅ Deteksi macOS

  //   if (isAndroid) {
  //     const intentUrl = `intent://launch#Intent;scheme=ira;package=com.weave.ira;S.browser_fallback_url=${encodeURIComponent(ANDROID_STORE)};end`;
  //     window.location.href = intentUrl;
  //   } else if (isIOS) {
  //     let appOpened = false;
  //     const onVisibilityChange = () => {
  //       if (document.hidden) appOpened = true;
  //     };
  //     document.addEventListener("visibilitychange", onVisibilityChange);

  //     window.location.href = "ira://launch";

  //     setTimeout(() => {
  //       document.removeEventListener("visibilitychange", onVisibilityChange);
  //       if (!appOpened && !document.hidden) {
  //         window.location.href = IOS_STORE;
  //       }
  //     }, 1500);
  //   } else if (isMac) {
  //     // ✅ macOS: langsung arahkan ke App Store iOS
  //     window.location.href = IOS_STORE;
  //   } else {
  //     // ✅ Desktop lain (Windows/Linux): tetap ke Play Store atau bisa disesuaikan
  //     window.location.href = ANDROID_STORE;
  //   }
  // };

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
          src={VoucherRedeemv2}
          alt="Voucher Redeem"
          className="w-full drop-shadow-lg"
        />
        <button
          onClick={handleBannerClick} // ✅ Ubah ke handleBannerClick
          className="absolute bottom-2 left-3.5 sm:bottom-5 sm:left-5 
                     fancy-redeem
                     shadow-[0_0_10px_0_#FFF]
                     border-2 border-white 
                     text-white font-bold rounded-full 
                     max-[369px]:py-1.5 max-[369px]:px-3 py-2 px-4 text-[11px] min-[496px]:py-3 min-[496px]:px-7 sm:text-sm 
                     hover:shadow-[0_0_18px_rgba(255,255,255,0.5)] hover:border-white/60
                     active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap z-10"
        >
          {hasRedeemCode ? "Lihat Voucher" : "Redeem Voucher"}
        </button>
      </div>

      {/* Desktop Banner */}
      <div className="relative w-full max-md:hidden mb-5">
        <Image
          src={VoucherRedeemDesktopV2}
          alt="Voucher Redeem"
          className="w-full drop-shadow-lg"
        />
        <button
          onClick={handleBannerClick} // ✅ Ubah ke handleBannerClick
          className="hover:scale-105 absolute bottom-3 left-1/2 -translate-x-1/2 sm:bottom-2 lg:bottom-4
             fancy-redeem
             shadow-[0_0_10px_0_#FFF]
             border-2 border-white 
             text-white font-bold rounded-full 
             py-2 px-5 text-[11px] sm:py-1 sm:px-7 md:py-1.2 lg:py-2  sm:text-sm 
             hover:shadow-[0_0_18px_rgba(255,255,255,0.5)] hover:border-white/60
             active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap z-10"
        >
          {hasRedeemCode ? "Lihat Voucher" : "Redeem Voucher"}
        </button>
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
