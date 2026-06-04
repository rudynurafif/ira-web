import Image from "next/image";
import React, { useState, useEffect } from "react";
import googlePlay from "@/public/assets/Images/GooglePlayBlack2.png";
import appStore from "@/public/assets/Images/AppStoreBlack2.png";
import { useSearchParams } from "next/navigation";
import RegisApp from "@/public/assets/Icons/regis-app.png";

type Platform = "android" | "ios" | "mac" | "windows" | "desktop" | "unknown";

const ANDROID_STORE =
  "https://play.google.com/store/apps/details?id=com.weave.ira";
const IOS_STORE = "https://apps.apple.com/id/app/internet-rakyat/id6758337694";

const CUSTOM_SCHEME = "ira://"; // Custom scheme

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  if (/Windows/i.test(ua)) return "windows";
  return "desktop";
}

function sanitizeCode(raw: string | null): string {
  return (raw || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

function ContentOpenAppModal({
  setOpenModalOpenApp,
}: {
  setOpenModalOpenApp: any;
}) {
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<Platform>("unknown");
  const code = sanitizeCode(searchParams.get("referral_code"));

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const tryOpenApp = (storeUrl: string) => {
    // Kalau desktop (Mac/Windows/Other), langsung buka store di tab baru
    if (
      platform === "mac" ||
      platform === "windows" ||
      platform === "desktop"
    ) {
      window.open(storeUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const registerPath = `/auth/register${code ? `?referral_code=${encodeURIComponent(code)}` : ""}`;

    const isIOS = platform === "ios";

    // UNTUK ANDROID: Gunakan Intent URL
    if (platform === "android") {
      const intentUrl = `intent://auth/register${code ? `?referral_code=${encodeURIComponent(code)}` : ""}#Intent;scheme=ira;package=com.weave.ira;S.browser_fallback_url=${encodeURIComponent(storeUrl)};end`;
      window.location.href = intentUrl;
      return;
    }

    if (isIOS) {
      // UNTUK iOS: Gunakan Custom Scheme (ira://)
      // Jika app terinstall → langsung buka app
      // Jika app tidak terinstall → browser akan menampilkan error, lalu fallback ke App Store
      let appOpened = false;
      const startTime = Date.now();

      const handleVisibilityChange = () => {
        if (document.hidden) {
          appOpened = true;
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Buka app via custom scheme
      const schemeUrl = `${CUSTOM_SCHEME}auth/register${code ? `?referral_code=${encodeURIComponent(code)}` : ""}`;
      window.location.href = schemeUrl;

      // Fallback: Setelah 1.5 detik, jika app tidak terbuka, redirect ke App Store
      setTimeout(() => {
        const elapsed = Date.now() - startTime;
        // Jika halaman tidak hidden DAN elapsed time kecil (artinya browser gagal redirect ke app),
        // maka fallback ke App Store
        if (!appOpened && !document.hidden && elapsed < 2000) {
          window.location.href = storeUrl;
        }
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }, 1500);
      return;
    }
  };

  const handleOpenApp = () => {
    // Tentukan store URL berdasarkan platform
    let storeUrl = ANDROID_STORE; // Default
    if (platform === "ios" || platform === "mac") {
      storeUrl = IOS_STORE;
    }

    // Coba buka app, jika gagal akan redirect ke store
    tryOpenApp(storeUrl);
  };

  const handleGoToRegister = () => {
    setOpenModalOpenApp(false);
    const registerSource = searchParams.get("referral_code");
    if (registerSource) {
      window.location.href = `/auth/register?referral_code=${registerSource}`;
    }
  };

  const handleGooglePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (platform === "android") {
      tryOpenApp(ANDROID_STORE);
    } else {
      window.open(ANDROID_STORE, "_blank", "noopener,noreferrer");
    }
  };

  const handleAppStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (platform === "ios" || platform === "mac") {
      tryOpenApp(IOS_STORE);
    } else {
      window.open(IOS_STORE, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mt-5">
      <div className="flex justify-center">
        <Image src={RegisApp} alt="register" className="w-[80%]" />
      </div>

      {/* Bagian Badge App Store & Google Play */}
      {/* <div className="flex justify-center items-center gap-4 mb-6">
        <a
          href={ANDROID_STORE}
          onClick={handleGooglePlayClick}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <Image
            src={googlePlay}
            width={135}
            height={40}
            alt="Get it on Google Play"
          />
        </a>

        <a
          href={IOS_STORE}
          onClick={handleAppStoreClick}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <Image
            src={appStore}
            width={135}
            height={40}
            alt="Download on the App Store"
          />
        </a>
      </div> */}

      <div className="bg-white rounded-[58px] px-5 py-10 mb-4 -mt-[20%] relative  border-5 border-[#E71919]">
        <h1 className="font-bold text-black text-center text-lg sm:text-xl ">
          Daftar Lebih Mudah Lewat Aplikasi Internet Rakyat {`(IRA)`}
        </h1>
        <p className="text-center sm:text-sm text-xs pt-5 text-[#333]">
          Untuk proses registrasi dapat dilakukan dengan lebih cepat dan
          praktis, kami merekomendasikan pendaftaran melalui aplikasi Internet
          Rakyat. Jika Anda memilih menggunakan website, Anda tetap bisa
          melanjutkan registrasi di halaman ini.
        </p>

        <div className="pt-7">
          <button
            type="button"
            onClick={handleOpenApp}
            className="w-full bg-[linear-gradient(136deg,#9C1816_2.93%,#D7201D_83.81%)] rounded-full max-sm:text-xs hover:bg-dark-primary-2 text-white font-bold py-3 px-6  transition-colors"
          >
            Daftar Lewat Aplikasi
          </button>

          <button
            type="button"
            onClick={handleGoToRegister}
            className="w-full border-2 max-sm:text-sm rounded-full border-[#D7201D] hover:bg-dark-primary-2 text-primary hover:text-white font-bold py-3 px-6  transition-colors mt-3"
          >
            Lanjutkan Pendaftaran di Website
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentOpenAppModal;
