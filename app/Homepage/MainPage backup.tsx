import Image from "next/image";
import { useEffect, useState } from "react";

import modem from "@/public/assets/Images/main-modem.svg";
import modem2 from "@/public/assets/Images/main-modem-2.svg";
import modemIra from "@/public/assets/Images/cpe-ira.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import wifiIcon from "@/public/assets/Icons/wifi.svg";
import { getImageBanner } from "../_api/Banner/Banner";
import { handleDownloadClick, toastErrorFromAPI } from "../_shared/utils";
import { useAppSelector } from "../store/store";
import { useRouter } from "next/navigation";
import googleButton from "@/public/assets/Images/googlePlayButton.png";
import appStoreButton from "@/public/assets/Images/appStoreButton.png";
import webButton from "@/public/assets/Images/web-ira-button.png";
import dealerButton from "@/public/assets/Images/dealer-ira-button.png";

function MainPage() {
  const [image, setImage] = useState<string[]>([]);
  const [imageMobile, setImageMobile] = useState<string[]>([]);
  const router = useRouter();

  const settingsSlider = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const { userInfo, isLoggedIn, shipmentStatus } = useAppSelector(
    (state) => state.auth,
  );

  async function getBannerImage() {
    try {
      const params = {
        flag: "desktop",
      };

      const res_banner = await getImageBanner(params);

      const temp_desktop = res_banner.data.data.map((item: any) => {
        return {
          image: item.web_apps_image,
          url: item.url,
        };
      });

      const temp_mobile = res_banner.data.data.map((item: any) => {
        return {
          image: item.responsive_web_apps_image,
          url: item.url,
        };
      });

      setImage(temp_desktop);
      setImageMobile(temp_mobile);
    } catch (err: any) {
      // toastErrorFromAPI(err);
      console.error(err.response.data.message);
    }
  }

  useEffect(() => {
    getBannerImage();
  }, []);

  return (
    <div className="relative md:bg-[url('/assets/Images/hero-ira-new.webp')] bg-[url('/assets/Images/hero-ira-new-mobile.webp')] bg-cover bg-right bg-no-repeat text-white">
      {/* Original */}
      <div className="hidden">
        <div className="absolute bottom-0 left-0 w-full h-96 bg-linear-to-b from-transparent to-white pointer-events-none"></div>
        <div className="container mx-auto px-5 py-25">
          <div className="text-center">
            {/* <Slider {...settingsSlider}>
            <div className="text-center">
              {image.map((img, index) => (
                <Image
                  key={index}
                  src={`${process.env.NEXT_PUBLIC_URL_OBS}${img}`}
                  width={100}
                  height={100}
                  alt={`banner-${index}`}
                  className="w-full"
                />
              ))}
            </div>
            <div className="text-center h-full">
              {imageMobile.map((img, index) => (
                <Image
                  key={index}
                  src={`${process.env.NEXT_PUBLIC_URL_OBS}${img}`}
                  width={100}
                  height={100}
                  alt={`banner-${index}`}
                  className="w-full"
                />
              ))}
            </div>
          </Slider> */}

            <Image
              src={wifiIcon}
              width={50}
              height={50}
              alt="wifi-icon"
              className="mx-auto"
            />
            <div className="bg-opacity-black-10 rounded-full px-5 py-2.5 2xl:text-xl sm:text-lg text-sm text-white font-semibold inline-block mt-2.5 shadow-sm shadow-white">
              Internet ngebut tanpa ribet pakai kabel
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="my-6 w-75 sm:w-75 md:w-100 xl:w-112.5 2xl:w-137.5">
              <Image src={modemIra} alt="modem2" className="w-full" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
              <span className="font-bold">IRA Internet Rakyat -</span> Internet
              ngebut tanpa ribet pakai kabel
            </h1>
            <Link
              href="/auth/register"
              className="inline-flex gap-2 justify-center items-center mt-10 py-1.5 max-sm:py-1 max-sm:px-0.5 gradient-box rounded-full custom-click cursor-pointer"
              id="button-berlangganan-sekarang"
            >
              <div className="w-[97%] xl:py-9 relative flex justify-center px-3.75 gap-1 items-center bg-subs-new rounded-full h-15.5 mt-px overflow-hidden custom-bg-animation">
                <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 fancy-background w-[93%] z-0 h-7.5 rounded-full"></div>

                <span className="text-white text-base sm:text-lg md:text-2xl xl:text-3xl font-bold text-nowrap whitespace-nowrap relative max-sm:px-2 px-8">
                  GRATIS 1 Bulan Pertama
                </span>
              </div>
            </Link>
          </div>
          {!userInfo && (
            <div className="text-center relative z-10 text-sm sm:text-xl space-y-2 mt-4 2xl:mt-6">
              <p className="text-[#828282] font-medium">Sudah punya akun?</p>
              <p className="text-primary">
                Yuk,{" "}
                <span
                  className="font-bold cursor-pointer underline underline-animation-register"
                  onClick={() => router.push("/auth/login")}
                >
                  login disini
                </span>{" "}
                dan lanjutkan prosesnya!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Versi Go Commercial */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full h-96 bg-linear-to-b from-transparent to-white pointer-events-none"></div>
        <div className="container mx-auto px-5 py-25">
          <div className="text-center flex flex-col gap-5 sm:my-6 my-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold">
              IRA Internet Rakyat
            </h1>

            <div className="w-full flex justify-center">
              <div
                className="
                  inline-flex 
                  justify-center 
                  items-center 
                  py-4.25 px-6 sm:px-10
                  rounded-full
                  bg-white 
                  text-primary 
                  font-bold
                  shadow-[inset_-6px_4px_6px_0px_rgba(0,0,0,0.50)]
                  text-lg sm:text-[32px] md:text-[48px] lg:text-[60px]
                  leading-tight
                  whitespace-nowrap
                "
                style={{
                  maxWidth: "861px",
                  width: "fit-content",
                }}
              >
                RESMI GO COMMERCIAL
              </div>
            </div>

            <h1
              className="text-center block sm:hidden font-bold text-white leading-[1.18] text-[26px]"
              style={{
                textShadow:
                  "0 4px 4px rgba(0, 0, 0, 0.25), 1px 20px 14px rgba(214, 33, 30, 0.50)",
              }}
            >
              Mulai Hari Ini, 19 Feb 2026
            </h1>
          </div>

          <div className="text-center">
            <Image
              src={wifiIcon}
              width={50}
              height={50}
              alt="wifi-icon"
              className="mx-auto"
            />
            <div
              className="bg-opacity-black-10 sm:inline-block hidden rounded-full px-5 py-2.5 2xl:text-xl sm:text-lg text-sm text-white font-semibold  mt-2.5 shadow-sm shadow-white"
              style={{
                textShadow:
                  "0 4px 4px rgba(0, 0, 0, 0.25), 1px 20px 14px rgba(214, 33, 30, 0.50)",
              }}
            >
              Internet ngebut tanpa ribet pakai kabel
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="my-6 w-50 sm:w-60 md:w-70 xl:w-80">
              <Image src={modemIra} alt="modem2" className="w-full" />
            </div>
          </div>
          <div className="text-center">
            <div
              className="bg-white/25 sm:hidden inline-block rounded-full px-5 py-2.5 2xl:text-xl sm:text-lg text-sm text-white font-semibold  mt-2.5 shadow-sm shadow-white"
              style={{
                textShadow:
                  "0 4px 4px rgba(0, 0, 0, 0.50), 1px 20px 14px rgba(214, 33, 30, 0.90)",
              }}
            >
              Internet ngebut tanpa ribet pakai kabel
            </div>
          </div>

          <div className="text-center">
            <h1
              className="text-center hidden sm:block font-bold text-white leading-[1.18] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
              style={{
                textShadow:
                  "0 4px 4px rgba(0, 0, 0, 0.25), 1px 20px 14px rgba(214, 33, 30, 0.50)",
              }}
            >
              Mulai Hari Ini, 19 Feb 2026
            </h1>
            <Link
              href="/auth/register"
              className="inline-flex gap-2 justify-center items-center mt-10 py-1.5 max-sm:py-1 max-sm:px-0.5 gradient-box rounded-full custom-click cursor-pointer"
              id="button-berlangganan-sekarang"
            >
              <div className="w-[97%] xl:py-9 relative flex justify-center px-3.75 gap-1 items-center bg-subs-new rounded-full h-15.5 mt-px overflow-hidden custom-bg-animation">
                <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 fancy-background w-[93%] z-0 h-7.5 rounded-full"></div>

                <span className="text-white text-base sm:text-lg md:text-2xl xl:text-3xl font-bold text-nowrap whitespace-nowrap relative max-sm:px-2 px-8">
                  GRATIS 1 Bulan Pertama
                </span>
              </div>
            </Link>
          </div>
          {!userInfo && (
            <div className="text-center relative z-10 text-sm sm:text-xl space-y-2 mt-4 2xl:mt-6">
              <p className="text-[#828282] font-medium">Sudah punya akun?</p>
              <p className="text-primary">
                Yuk,{" "}
                <span
                  className="font-bold cursor-pointer underline underline-animation-register"
                  onClick={() => router.push("/auth/login")}
                >
                  login disini
                </span>{" "}
                dan lanjutkan prosesnya!
              </p>
            </div>
          )}

          {/* Wrapper Utama untuk Tombol Download */}
          <div className="z-9999">
            {/* --- VERSI DESKTOP (Pojok Kiri Bawah) --- */}
            <div className="hidden md:absolute bottom-5 left-10 md:flex flex-col gap-3">
              <div className="flex justify-start items-center gap-3">
                {/* Google Button */}
                <Image
                  src={googleButton}
                  alt="google-play-store"
                  width={500}
                  height={500}
                  onClick={() => handleDownloadClick("google")}
                  className="h-10 w-auto hover:scale-105 transition-transform"
                />
                <Image
                  src={appStoreButton}
                  alt="app-store-button"
                  width={500}
                  height={500}
                  onClick={() => handleDownloadClick("apple")}
                  className="h-10 w-auto hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex gap-3">
                {/* Web Button */}
                <Image
                  src={webButton}
                  alt="web"
                  width={500}
                  height={500}
                  onClick={() => handleDownloadClick("web")}
                  className="h-8 w-auto hover:scale-105 transition-transform"
                />
                {/* Dealer Button */}
                <Image
                  src={dealerButton}
                  alt="dealer"
                  width={500}
                  height={500}
                  className="h-8 w-auto  hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
