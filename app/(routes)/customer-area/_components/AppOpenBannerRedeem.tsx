import { getActiveCampaign } from "@/app/_api/Redeem/Redeem";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import VoucherRedeemv2 from "@/public/assets/Images/voucher-redeem-v2.png";
import VoucherRedeemDesktop from "@/public/assets/Images/voucher-redeem-desktop.webp";
import VoucherRedeemDesktopV2 from "@/public/assets/Images/voucher-redeem-desktop-v2.webp";
import Image from "next/image";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { motion } from "framer-motion";
import imageFailed from "@/public/assets/Images/voucher-modal.webp";
import checkIcon from "@/public/assets/Icons/check-icon.svg";
import moment from "moment";
import "moment/locale/id";

const ANDROID_STORE =
  "https://play.google.com/store/apps/details?id=com.weave.ira";
const IOS_STORE = "https://apps.apple.com/id/app/internet-rakyat/id6758337694";

export default function AppOpenBannerRedeem() {
  const [dismissed, setDismissed] = useState(true);
  const [showModalAlreadyClaimed, setShowModalAlreadyClaimed] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string>("");
  const [endDate, setEndDate] = useState("");
  const [hasRedeemCode, setHasRedeemCode] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ State untuk modal konfirmasi

  async function showActiveCampaignRedeem() {
    try {
      const res_redeem = await getActiveCampaign();
      if (res_redeem?.data?.statusCode === 200) {
        if (res_redeem?.data?.code === "0") {
          setDismissed(false);
        } else if (res_redeem?.data?.code === "1") {
          setDismissed(true);
        } else if (res_redeem?.data?.code === "01") {
          setDismissed(false);
          setHasRedeemCode(true);
          setEndDate(res_redeem?.data?.end_date || "");
          setRedeemCode(res_redeem?.data?.redeem_code || "-");
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Api Get Active Campaign Error",
      );
    }
  }

  useEffect(() => {
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";
    const universalLinkPath = "/launch"; // ✅ Path sesuai AASA
    const universalLink = `${currentOrigin}${universalLinkPath}`;
    console.log(universalLink);
    showActiveCampaignRedeem();
  }, []);

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

  // ✅ Handler saat tombol banner diklik -> tampilkan modal konfirmasi
  const handleBannerClick = () => {
    if (hasRedeemCode) {
      setShowModalAlreadyClaimed(true);
      return;
    }
    setShowConfirmModal(true);
  };

  // ✅ Handler saat user konfirmasi di modal
  const handleConfirmOpenApp = () => {
    setShowConfirmModal(false);
    executeOpenInApp();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
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
            <div className="px-6 py-5">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <Image src={checkIcon} alt="check icon" />
              </div>

              {/* Title */}
              <h1 className="text-center text-xl lg:text-2xl font-bold w-full mx-auto text-gray-900">
                Voucher Internet Rakyat x Folaplus World Cup 2026 Berhasil
                Diklaim
              </h1>

              {/* Description */}
              <p className="mt-4 w-full mx-auto text-center text-gray-600 text-sm leading-relaxed">
                Selamat! Anda berhasil mendapatkan voucher Internet Rakyat x
                Folaplus World Cup 2026. Silakan gunakan voucher sebelum{" "}
                <strong className="text-gray-900">
                  {endDate ? moment(endDate).format("DD MMMM YYYY") : "-"}
                </strong>
              </p>

              {/* Voucher Ticket SVG */}
              <div className="mt-3 ">
                <div className="w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="294"
                    height="60"
                    viewBox="0 0 294 60"
                    fill="none"
                    className="w-full h-auto"
                  >
                    {/* Background Path */}
                    <path
                      d="M289 58.4H5C2.79086 58.4 1 56.6091 1 54.4V42.9C1 40.6 7.92308 40.6 7.92308 33.7C7.92308 28.18 3.30769 25.2682 1 24.5V11C1 8.79086 2.79086 7 5 7H21.7692H289C291.209 7 293 8.79086 293 11V24.5C293 26.8 286.077 26.8001 286.077 33.7C286.077 39.2201 290.692 42.1319 293 42.9V54.4C293 56.6091 291.209 58.4 289 58.4Z"
                      fill="#EDF8F6"
                    />
                    {/* Border/Stroke Path */}
                    <path
                      d="M21.7692 7V16.2M21.7692 20.8V37.9M21.7692 41.5V58.4M293 42.9V54.4C293 56.6091 291.209 58.4 289 58.4H5C2.79086 58.4 1 56.6091 1 54.4V42.9C1 40.6 7.92308 40.6 7.92308 33.7C7.92308 28.18 3.30769 25.2682 1 24.5V11C1 8.79086 2.79086 7 5 7H289C291.209 7 293 8.79086 293 11V24.5C293 26.8 286.077 26.8001 286.077 33.7C286.077 39.2201 290.692 42.1319 293 42.9Z"
                      stroke="#4CB9A3"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Voucher Code Text */}
                    <text
                      x="50%"
                      y="57%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill="#2E695D"
                      fontSize="16"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {redeemCode || "-"}
                    </text>
                  </svg>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 space-y-3">
                {/* Salin Kode Voucher Button */}
                <button
                  onClick={async () => {
                    if (redeemCode) {
                      try {
                        await navigator.clipboard.writeText(redeemCode);
                        toast.success("Kode voucher berhasil disalin!");
                      } catch {
                        toast.error("Gagal menyalin kode voucher");
                      }
                    }
                  }}
                  className="w-full bg-[#D7201D] hover:bg-[#b01a17] active:scale-[0.98] text-white py-3.5 rounded-full font-semibold text-base cursor-pointer transition-all"
                >
                  Salin Kode Voucher
                </button>

                {/* Kembali Button */}
                <button
                  onClick={() => setShowModalAlreadyClaimed(false)}
                  className="w-full bg-white border border-[#520201] text-[#D7201D] hover:bg-gray-50 active:scale-[0.98] py-3.5 rounded-full font-semibold text-base cursor-pointer transition-all"
                >
                  Kembali
                </button>
              </div>
            </div>
          </motion.div>
        </ModalTemplate>
      )}

      {/* ✅ Modal: Konfirmasi Buka Aplikasi (BARU) */}
      {showConfirmModal && (
        <ModalTemplate
          closeModal={() => setShowConfirmModal(false)}
          classNameModal="max-w-lg"
        >
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
            {/* ✅ Visual indicator - optional, bisa disesuaikan */}
            {/* <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div> */}

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
                Klaim Voucher World Cup Hanya di Aplikasi IRA
              </h1>
              <p className="mt-3 w-full mx-auto text-center text-gray-600 text-sm leading-relaxed">
                Voucher World Cup 2026 hanya dapat diklaim melalui aplikasi IRA.
                Silakan buka aplikasi IRA dan klaim voucher Anda untuk
                mendapatkan akses nonton World Cup 2026 secara gratis.
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
        </ModalTemplate>
      )}
    </div>
  );
}
