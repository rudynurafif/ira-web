import Image from "next/image";
import React, { useState } from "react";

import googlePlay from "@/public/assets/Images/GooglePlayBlack.png";
import appStore from "@/public/assets/Images/AppStoreBlack.png";
import appImage from "@/public/assets/Images/app-image.png";
import desktopBannerSspace from "@/public/assets/Images/banner-download-versi-sspace.png";
import desktopBannerDownload from "@/public/assets/Images/bg-section-2.png";
import mobileBannerSspace from "@/public/assets/Images/banner-download-versi-sspace-mobile.png";
import { handleDownloadClick } from "../_shared/utils";

const DownloadApp = () => {
  const handleClickBanner = () => {
    if (typeof window === "undefined") return;

    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "CustomizeProduct");
    }
    if (typeof (window as any).ttq === "object") {
      (window as any).ttq.track("Download");
    }

    const ua = navigator.userAgent.toLowerCase();
    const isApple = /mac|iphone|ipad|ipod/.test(ua);
    handleDownloadClick(isApple ? "apple" : "google");
  };

  return (
    <>
      {/* Versi Lama Layout Download App (Commented) */}
      {/* <div className="container mx-auto px-5 py-16 max-sm:py-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="w-full lg:w-1/3 flex justify-center order-1 lg:order-2">
            <Image
              src={appImage}
              alt="faq"
              width={400}
              height={300}
              className="w-full max-w-md h-auto"
            />
          </div>

          <div className="max-w-5xl w-full lg:w-2/3 order-2 lg:order-1">
            <p className="text-[32px] font-bold max-sm:text-2xl max-sm:text-center">
              Nikmati Layanan Lebih Mudah dengan Aplikasi IRA
            </p>
            <p className="text-xl mt-4 max-sm:text-sm max-sm:text-center">
              Dapatkan kontrol penuh atas layanan internet Anda hanya dengan
              beberapa klik. Dengan aplikasi IRA, Anda dapat dengan mudah
              membeli paket, memonitor status modem, cek signal, dan melakukan
              banyak hal lainnya. Unduh aplikasi IRA di Google Play Store atau
              Apple App Store dan nikmati kemudahan mengelola layanan internet
              Anda di mana saja dan kapan saja.
            </p>

            <p className="text-2xl font-bold mt-12 max-sm:text-xl max-sm:text-center max-sm:mt-8">
              Temukan dan unduh aplikasi IRA sekarang
            </p>
            <div className="flex mt-6 gap-6 max-sm:justify-center justify-start max-sm:flex-col max-sm:items-center">
              <Image
                alt="GooglePlay"
                src={googlePlay}
                width={180}
                height={60}
                className="max-sm:w-48 max-sm:h-auto cursor-pointer hover:scale-105"
                onClick={() => handleDownloadClick("google")}
              />
              <Image
                alt="AppStore"
                src={appStore}
                width={180}
                height={60}
                className="max-sm:w-48 max-sm:h-auto cursor-pointer hover:scale-105"
                onClick={() => handleDownloadClick("apple")}
              />
            </div>
          </div>
        </div>
      </div> */}

      {/* Versi Banner Full Width (Active) */}
      <section
        className="w-full cursor-pointer overflow-hidden"
        onClick={handleClickBanner}
      >
        <div className="w-full">
          {/* Desktop Banner */}
          <div className="hidden sm:block">
            <Image
              src={desktopBannerDownload}
              alt="Download Aplikasi IRA Desktop"
              width={1920}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          {/* Mobile Banner */}
          <div className="sm:hidden">
            <Image
              src={mobileBannerSspace}
              alt="Download Aplikasi IRA Mobile"
              width={786}
              height={978}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default DownloadApp;
