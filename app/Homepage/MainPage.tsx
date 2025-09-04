import Image from "next/image";
import React from "react";

import modem from "@/public/assets/Images/main-modem.svg";
import modem2 from "@/public/assets/Images/main-modem-2.svg";
import starlite from "@/public/assets/Icons/icon-starlite-white.svg";
import CardPackage from "../_components/homepage/CardPackage";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { FaWifi } from "react-icons/fa";

function MainPage() {
  const settingsSlider = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <div className="bg-[url('/assets/Images/HERO.webp')] bg-cover bg-center bg-no-repeat text-white">
      <div className="container mx-auto px-5 py-30">
        <div className="text-center">
          <FaWifi size={50} color="white" className="mx-auto" />
          <div className="bg-opacity-black-10 rounded-full px-5 py-2.5 text-lg max-sm:text-sm text-white font-bold inline-block mt-2.5 shadow-sm shadow-white">
            Internet ngebut tanpa ribet pakai kabel.
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="w-1/3 max-sm:w-4/5">
            {/* <Slider {...settingsSlider}>
              <div className="text-center">
                <Image src={modem} alt="modem" className="w-full" />
              </div>
              <div className="text-center h-full">
                <Image
                  src={modem2}
                  alt="modem2"
                  className="w-full flex items-center"
                />
              </div>
            </Slider> */}
            <Image
              src={modem2}
              alt="modem2"
              className="w-full flex items-center"
            />
          </div>
        </div>
        <div className="text-center mt-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
            <span className="font-bold">Starlite Fixed Wireless Access -</span>{" "}
            Internet ngebut tanpa ribet pakai kabel.
          </h1>
          <div className="flex gap-4 items-start justify-center mt-5">
            <p>Supported by:</p>
            <Image src={starlite} alt="starlite" />
          </div>
          {/* <p className="text-4xl font-bold mt-8">
            Nikmati internet ngebut tanpa ribet pakai kabel.
          </p>
          <p className="text-xl mt-5">
            FREE TRIAL🎉 Yuk, coba gratis layanan FWA tanpa ribet, tanpa
            komitmen panjang!
          </p> */}
          {/* <button className="w-1/2 py-7 bg-primary rounded-full mt-10">
            Coba GRATIS selama 7 hari
          </button> */}
          <Link
            href="/auth/register"
            className="inline-flex gap-2 justify-center items-center mt-10 py-2 px-0.5 gradient-box rounded-[58px] custom-click cursor-pointer"
            id="button-berlangganan-sekarang"
          >
            <div className="w-[97%] relative flex justify-center px-[15px] gap-1 items-center bg-subs-new rounded-[58px] h-[62px] mt-[1px] overflow-hidden custom-bg-animation">
              <div className=" absolute top-[6px] left-1/2 transform -translate-x-1/2 fancy-background w-[93%]  z-0 h-[30px] rounded-[58px]"></div>

              <span className="text-white text-base sm:text-lg md:text-2xl xl:text-3xl  font-bold text-nowrap whitespace-nowrap relative max-sm:px-2 px-8">
                Coba GRATIS selama 7 hari
              </span>
            </div>
          </Link>
        </div>
        {/* <div className="mt-10">
          <CardPackage />
        </div> */}
      </div>
    </div>
  );
}

export default MainPage;
