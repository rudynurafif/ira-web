import React from "react";

import desc1 from "@/public/assets/Images/main-desc-why-1.svg";
import desc2 from "@/public/assets/Images/main-desc-why-2.svg";
import desc3 from "@/public/assets/Images/main-desc-why-3.svg";
import Image, { StaticImageData } from "next/image";
import RegisterNowCard from "../_components/homepage/RegisterNowCard";
import { useAppSelector } from "../store/store";

import googleButton from "@/public/assets/Images/googlePlayButton.png";
import webButton from "@/public/assets/Images/web-ira-button.png";
import dealerButton from "@/public/assets/Images/dealer-ira-button.png";

interface descriptionListType {
  id: number;
  image: StaticImageData;
  description: string;
}

function WhyFWAPage() {
  const description: descriptionListType[] = [
    {
      id: 1,
      image: desc1,
      description: "Cuma Rp100.000 & kecepatan up to 100 Mbps tanpa kuota",
    },
    {
      id: 2,
      image: desc2,
      description: "Streaming, belajar, kerja, main game? Semua lancar!",
    },
    {
      id: 3,
      image: desc3,
      description: "Gratis biaya instalasi & sewa modem",
    },
  ];

  const { userInfo, isLoggedIn, shipmentStatus } = useAppSelector(
    (state) => state.auth,
  );

  const handleClick = (type: string): void => {
    try {
      if (type === "google") {
        window.open(
          "https://play.google.com/store/apps/details?id=com.weave.ira",
          "_blank",
        );
      } else {
        window.open("https://internetrakyat.id/", "_blank");
      }
    } catch (error) {
      console.error("Error handling download:", error);
    }
  };

  return (
    <div className="container mx-auto px-5 text-black py-18 max-sm:py-9">
      {/* Versi GO Commercial */}
      <div className="md:hidden flex flex-col items-center gap-4 w-full pb-20 -mt-20">
        {/* Teks Atas */}
        <p className="text-gray-800 font-bold text-2xl text-center z-9999">
          Temukan Aplikasi IRA di
        </p>

        {/* Tombol Google Play (Lebar menyesuaikan konten/tengah) */}
        <div className="w-full flex justify-center z-9999">
          <Image
            src={googleButton}
            alt="google-play"
            width={200}
            height={60}
            className="w-[180px] h-auto object-contain"
            onClick={() => handleClick("google")}
          />
        </div>

        {/* Teks Tengah */}
        <p className="text-gray-800 font-bold text-sm sm:text-base text-center z-9999">
          atau Kunjungi Kami di
        </p>

        {/* Tombol Bawah (Website & Dealer) - Lebar Penuh/Stack Vertikal atau Side-by-Side */}
        {/* Sesuai gambar, mereka berdampingan tapi cukup besar. Kita buat responsif: */}
        <div className="flex flex-row gap-4 w-full justify-center z-9999">
          <Image
            src={webButton}
            alt="website-ira"
            width={134}
            height={60}
            className="h-[30px] w-auto hover:scale-105 transition-transform"
            onClick={() => handleClick("web")}
          />
          <Image
            src={dealerButton}
            alt="dealer-resmi"
            width={134}
            height={60}
            className="h-[30px] w-auto hover:scale-105 transition-transform"
          />
        </div>
      </div>

      <h1 className="text-[32px] max-sm:text-[24px] font-bold text-center">
        Mengapa pilih Internet Rakyat <span className="inline">(IRA) ?</span>
      </h1>

      <div className="mt-[72px] max-sm:mt-12">
        <div className="grid grid-cols-3 max-sm:flex max-sm:flex-col max-sm:gap-6">
          {description.map((item, index: number) => {
            return (
              <div
                key={"desc-" + index}
                className="col-span-1 text-center max-sm:flex items-center justify-between"
              >
                <div className="inline-block rounded-full mx-auto ">
                  <div className="w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.description}
                      className="flex justify-center items-center w-[150px] h-[150px] max-sm:w-[60px] max-sm:h-[60px]"
                    />
                  </div>
                </div>
                <div className="w-3/4 mx-auto sm:mt-6">
                  <p className="text-center max-sm:text-start mx-auto text-xl max-sm:text-sm font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!userInfo && (
        <div className="mt-[150px] max-sm:mt-[50px]">
          <RegisterNowCard />
        </div>
      )}
    </div>
  );
}

export default WhyFWAPage;
