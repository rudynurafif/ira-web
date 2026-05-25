import React from "react";
import { motion } from "framer-motion";
import imageFailed from "@/public/assets/Images/voucher-modal.webp";
import Image from "next/image";

const ANDROID_STORE =
  "https://play.google.com/store/apps/details?id=com.weave.ira";
const IOS_STORE = "https://apps.apple.com/id/app/internet-rakyat/id6758337694";

interface AppOpenBannerRedeemProps {
  setShowConfirmModal: (val: boolean) => void;
}

function ContentClaimVoucherModal({
  setShowConfirmModal,
}: AppOpenBannerRedeemProps) {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
  };

  const executeOpenInApp = () => {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";

    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(platform);

    // ✅ Detect domain secara dinamis dari browser
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";
    const universalLinkPath = "/launch"; // ✅ Path sesuai AASA
    const universalLink = `${currentOrigin}${universalLinkPath}`;
    // console.log(universalLink);

    if (isAndroid) {
      const intentUrl = `intent://launch#Intent;scheme=ira;package=com.weave.ira;S.browser_fallback_url=${encodeURIComponent(ANDROID_STORE)};end`;
      window.location.href = intentUrl;
    } else if (isIOS) {
      let appOpened = false;
      const onVisibilityChange = () => {
        if (document.hidden) appOpened = true;
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      // ✅ Gunakan universal link dengan domain dinamis
      window.location.href = universalLink;

      setTimeout(() => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (!appOpened && !document.hidden) {
          window.location.href = IOS_STORE;
        }
      }, 1500);
    } else if (isMac) {
      window.location.href = IOS_STORE;
    } else {
      window.location.href = ANDROID_STORE;
    }
  };

  // ✅ Handler saat user konfirmasi di modal
  const handleConfirmOpenApp = () => {
    setShowConfirmModal(false);
    executeOpenInApp();
  };
  return (
    <div>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{
          type: "spring" as const,
          stiffness: 300,
          damping: 25,
          duration: 0.2,
        }}
      >
        <div className="w-full">
          <Image
            alt="image-status"
            src={imageFailed}
            className="w-full rounded-t-2xl"
          />
        </div>
        <div className="px-6 py-5">
          {/* ✅ Wording sesuai request */}
          <h1 className="text-primary text-center text-xl lg:text-2xl font-bold w-full  mx-auto">
            Klaim Voucher Bola Gembira 2026 Hanya di Aplikasi IRA
          </h1>
          <p className="mt-3 w-full mx-auto text-center text-gray-600 text-sm leading-relaxed">
            Voucher Bola Gembira 2026 hanya dapat diklaim melalui aplikasi IRA.
            Silakan buka aplikasi IRA dan klaim voucher Anda untuk mendapatkan
            akses nonton Bola Gembira 2026
          </p>
          {/* ✅ Tombol aksi */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleConfirmOpenApp}
              className="w-full cursor-pointer py-3 text-white font-bold bg-primary hover:bg-dark-primary-2 sm:rounded-xl rounded-full"
            >
              Buka Aplikasi IRA
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ContentClaimVoucherModal;
