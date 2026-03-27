import React from "react";
import Image from "next/image";
import bgFlagship from "@/public/assets/Images/Flagship-Product/bg-flagship-product.webp";
import IraWhiteIcon from "@/public/assets/Icons/IraWhiteIcon.svg";
import IraIcon from "@/public/assets/Icons/IraIcon.svg";

import wifiIcon from "@/public/assets/Images/Flagship-Product/Best-Wifi.svg";
import boxIcon from "@/public/assets/Images/Flagship-Product/Omni-antenna.svg";
import coreIcon from "@/public/assets/Images/Flagship-Product/OpenWRT.svg";
import zeroPlasticIcon from "@/public/assets/Images/Flagship-Product/Zero-Plastic.svg";

function FlagshipProduct() {
  const features = [
    {
      icon: wifiIcon,
      text: "Best WIFI performance, WIFI 5 2+2 (AC1200)",
    },
    {
      icon: boxIcon,
      text: "Omni antenna design to reach max 3.5dBi gain.",
    },
    {
      icon: coreIcon,
      text: "OpenWRT support utilizing industry contribution.",
    },
    {
      icon: zeroPlasticIcon,
      text: "Green design zero plastic in packaging.",
    },
  ];

  return (
    <div className="relative w-full bg-[#E63946] text-white overflow-hidden font-sans">
      {/* Background Image yang sudah include router */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgFlagship}
          alt="Flagship Product Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Overlay gradient untuk memperjelas text */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-[#E63946]/80 via-[#E63946]/60 to-transparent z-0"></div> */}

      <div className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
          {/* Left Side: Spacer untuk area router di background */}
          <div className="w-full sm:w-1/2"></div>

          {/* Right Side: Content */}
          <div className="w-full sm:w-1/2 flex flex-col items-start">
            {/* Mobile Card Wrapper */}
            <div className="sm:bg-transparent bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-full sm:p-0 sm:shadow-none sm:rounded-none sm:backdrop-blur-none">
              <h2 className="text-3xl sm:text-5xl font-bold text-[#E63946] sm:text-white leading-tight mb-4 sm:mb-8">
                Perangkat Unggulan
              </h2>

              {/* Logo Section */}
              {/* <div className="flex items-center gap-4 mb-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm"> */}
              <div className="pb-4">
                <Image
                  src={IraWhiteIcon}
                  alt="IRA Logo"
                  className="max-sm:hidden w-[150px] h-auto"
                />
                <Image
                  src={IraIcon}
                  alt="IRA Logo"
                  className="sm:hidden w-[150px] h-auto"
                />
              </div>
              {/* </div> */}

              {/* Features List */}
              <div className="space-y-6 w-full max-w-md">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="relative flex-shrink-0  flex items-center justify-center">
                      <Image
                        width={500}
                        height={500}
                        src={feature.icon}
                        alt="icon"
                        className=" w-[35px] h-fit"
                      />
                    </div>
                    <p className="text-sm sm:text-base font-light text-gray-700 sm:text-white opacity-90">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    if (typeof (window as any).fbq === "function") {
                      (window as any).fbq("track", "Lead");
                    }
                    if (typeof (window as any).ttq === "object") {
                      (window as any).ttq.track("Lead", {
                        content_name:
                          "Tombol Daftar Sekarang Di Section Perangkat Unggulan",
                      });
                    }
                  }
                }}
                className="
                        mt-10 
                        px-8 
                        py-3 
                        rounded-[800px] 
                        border-[3px] 
                        border-[#D7201D] 
                        bg-[#F8F9FA] 
                        text-[#D7201D] 
                        font-semibold 
                        shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] 
                        hover:bg-[#D7201D] 
                        hover:text-white 
                        hover:shadow-xl 
                        transition-all 
                        duration-300 
                        transform 
                        hover:-translate-y-1"
              >
                Daftar Sekarang
              </button>

              {/* Bottom Arrow Indicator */}
              <div className="mt-8 flex justify-center w-full">
                <div className="w-2 h-2 bg-black/20 rotate-45 transform"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlagshipProduct;
