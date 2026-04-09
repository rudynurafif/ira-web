import Image from "next/image";
import React, { useState } from "react";

import googlePlay from "@/public/assets/Images/GooglePlayBlack2.png";
import appStore from "@/public/assets/Images/AppStoreBlack2.png";
import desktopBannerDownload from "@/public/assets/Images/bg-section-2-new.png";
import mobileBannerSspace from "@/public/assets/Images/bg-section-2-mobile-new.png";
import iraLogoSquareRed from "@/public/assets/Images/logo-ira-red-square.png";
import { handleDownloadClick } from "../_shared/utils";

const DownloadApp = () => {
  const handleClickBanner = () => {
    if (typeof window === "undefined") return;

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
      <section className="w-full overflow-hidden">
        <div className="w-full">
          {/* Desktop Banner */}
          <div className="hidden md:block relative w-full">
            <Image
              src={desktopBannerDownload}
              alt="Download Aplikasi IRA Desktop"
              width={1920}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />

            {/* Download Box Overlay — Desktop Only */}
            <div className="absolute inset-0 flex items-end justify-center md:pb-[3%] lg:pb-[6%] ">
              <div className="flex items-stretch bg-white rounded-2xl overflow-hidden shadow-2xl border-5 border-primary">
                {/* Logo IRA Square */}
                <div className="flex items-center justify-center p-3 md:p-4 lg:p-4 xl:p-5 2xl:p-6">
                  <div className="flex flex-col items-center justify-center bg-primary rounded-2xl px-6 py-2 border-r border-gray-200 h-full shadow-[0_8px_20px_rgba(193,20,0,0.5)]">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-24 xl:h-24 2xl:w-36 2xl:h-36">
                      <Image
                        src={iraLogoSquareRed}
                        alt="Logo IRA"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-white font-black text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs 2xl:text-lg mt-1">
                      internet rakyat
                    </span>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col justify-between p-3 md:p-4 lg:p-4 xl:p-5 2xl:p-6 bg-white gap-2 md:gap-2 lg:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadClick("google");
                    }}
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    <Image
                      alt="Get it on Google Play"
                      src={googlePlay}
                      width={220}
                      height={65}
                      className="w-28 md:w-32 lg:w-36 xl:w-44 2xl:w-62 h-auto rounded"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadClick("apple");
                    }}
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    <Image
                      alt="Download on the App Store"
                      src={appStore}
                      width={220}
                      height={65}
                      className="w-28 md:w-32 lg:w-36 xl:w-44 2xl:w-62 h-auto rounded"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Banner */}
          <div className="md:hidden relative w-full">
            <Image
              src={mobileBannerSspace}
              alt="Download Aplikasi IRA Mobile"
              width={786}
              height={978}
              className="w-full h-auto object-cover"
              priority
            />

            {/* Mobile Overlay — Text + Download Box */}
            <div className="absolute inset-0 flex flex-col items-center pt-[8%] px-6">
              {/* Teks */}
              <div className="text-center text-white">
                <p className="text-2xl sm:text-4xl font-normal leading-snug">
                  Segera Download Aplikasi
                </p>
                <p className="text-3xl sm:text-5xl font-extrabold leading-tight">
                  Internet Rakyat
                </p>
                <p className="text-base sm:text-lg font-normal mt-1 opacity-90">
                  Buat update jadwal aktivasi modem di wilayahmu
                </p>
              </div>

              {/* Download Box */}
              <div className="max-[399]:mt-1 mt-8 sm:mt-16 flex items-stretch bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-primary">
                {/* Logo IRA Square — 1:1 */}
                <div className="flex items-center justify-center p-2 sm:p-3">
                  <div className="flex flex-col items-center justify-center bg-primary rounded-xl p-3 sm:p-4 aspect-square w-24 sm:w-40 shadow-[0_6px_16px_rgba(193,20,0,0.5)]">
                    <div className="relative flex-1 w-full">
                      <Image
                        src={iraLogoSquareRed}
                        alt="Logo IRA"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-white text-center font-black text-[9px] sm:text-[12px] mt-1 leading-none">
                      internet rakyat
                    </span>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col justify-center p-2 sm:p-3 gap-2 bg-white">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadClick("google");
                    }}
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    <Image
                      alt="Get it on Google Play"
                      src={googlePlay}
                      width={220}
                      height={65}
                      className="w-32 sm:w-60 h-auto rounded"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadClick("apple");
                    }}
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    <Image
                      alt="Download on the App Store"
                      src={appStore}
                      width={220}
                      height={65}
                      className="w-32 sm:w-60 h-auto rounded"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DownloadApp;
