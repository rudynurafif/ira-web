import Image from "next/image";
import { useEffect, useState } from "react";

import modemIra from "@/public/assets/Images/cpe-ira.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import wifiIcon from "@/public/assets/Icons/wifi.svg";
import { getImageBanner } from "../_api/Banner/Banner";
import { useAppSelector } from "../store/store";
import { useRouter } from "next/navigation";
import googleButton from "@/public/assets/Images/googlePlayButton.png";
import appStoreButton from "@/public/assets/Images/appStoreButton.png";
import webButton from "@/public/assets/Images/web-ira-button.png";
import dealerButton from "@/public/assets/Images/dealer-ira-button.png";

interface BannerItem {
  image: string;
  url?: string;
}

function MainPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannersMobile, setBannersMobile] = useState<BannerItem[]>([]);
  const router = useRouter();

  const settingsSlider = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    dots: true,
  };

  const { userInfo } = useAppSelector((state) => state.auth);

  async function getBannerImage() {
    try {
      const params = { flag: "desktop" };
      const res_banner = await getImageBanner(params);

      const temp_desktop = res_banner.data.data.map((item: any) => ({
        image: item.web_apps_image,
        url: item.url,
      }));

      const temp_mobile = res_banner.data.data.map((item: any) => ({
        image: item.responsive_web_apps_image,
        url: item.url,
      }));

      setBanners(temp_desktop);
      setBannersMobile(temp_mobile);
    } catch (err: any) {
      console.error(err.response?.data?.message || err.message);
    }
  }

  const handleClick = (type: string): void => {
    try {
      if (type === "google") {
        window.open(
          "https://play.google.com/store/apps/details?id=com.weave.ira",
          "_blank",
        );
      } else if (type === "apple") {
        window.open(
          "https://apps.apple.com/id/app/internet-rakyat/id6758337694",
          "_blank",
        );
      }
    } catch (error) {
      console.error("Error handling download:", error);
    }
  };

  useEffect(() => {
    getBannerImage();
  }, []);

  return (
    <div className="relative">
      <Slider {...settingsSlider}>
        {/* ================= SLIDE 1: GO COMMERCIAL (STYLING LAMA DIPERTAHANKAN 100%) ================= */}
        <div className="relative md:bg-[url('/assets/Images/hero-ira-new.webp')] bg-[url('/assets/Images/hero-ira-new-mobile.webp')] bg-cover bg-right bg-no-repeat text-white outline-none min-h-screen flex items-center">
          {/* Konten Slide 1 (Copy Paste Persis dari Request) */}
          <div className="relative w-full">
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
                  <div className="w-[97%] xl:py-9 relative flex justify-center px-[15px] gap-1 items-center bg-subs-new rounded-full h-[62px] mt-px overflow-hidden custom-bg-animation">
                    <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 fancy-background w-[93%] z-0 h-[30px] rounded-full"></div>

                    <span className="text-white text-base sm:text-lg md:text-2xl xl:text-3xl font-bold text-nowrap whitespace-nowrap relative max-sm:px-2 px-8">
                      GRATIS 1 Bulan Pertama
                    </span>
                  </div>
                </Link>
              </div>
              {!userInfo && (
                <div className="text-center relative z-10 text-sm sm:text-xl space-y-2 mt-4 2xl:mt-6">
                  <p className="text-[#828282] font-medium">
                    Sudah punya akun?
                  </p>
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
                  <div className="flex justify-center items-center gap-3">
                    {/* Google Button */}
                    <Image
                      src={googleButton}
                      alt="google-play-store"
                      width={500}
                      height={500}
                      onClick={() => handleClick("google")}
                      className="h-[40px] w-auto hover:scale-105 transition-transform"
                    />
                    <Image
                      src={appStoreButton}
                      alt="app-store-button"
                      width={500}
                      height={500}
                      onClick={() => handleClick("apple")}
                      className="h-[40px] w-auto hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex gap-3">
                    {/* Web Button */}
                    <Image
                      src={webButton}
                      alt="web"
                      width={500}
                      height={500}
                      onClick={() => handleClick("web")}
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

        {/* ================= SLIDE 2+: DARI API (FULL WIDTH STYLE) ================= */}
        {banners.map((item, index) => {
          const desktopUrl = item.image
            ? `${process.env.NEXT_PUBLIC_URL_OBS}${item.image}`
            : "";
          const mobileUrl = bannersMobile[index]?.image
            ? `${process.env.NEXT_PUBLIC_URL_OBS}${bannersMobile[index].image}`
            : "";

          return (
            <div
              key={`api-slide-${index}`}
              className="relative w-full h-screen min-h-[600px] bg-white text-black outline-none flex items-center justify-center overflow-hidden"
            >
              {/* Desktop Full Width BG */}
              <div className="hidden sm:block w-full h-full absolute inset-0">
                {desktopUrl ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${desktopUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Mobile Full Width BG */}
              <div className="block sm:hidden w-full h-full absolute inset-0">
                {mobileUrl ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${mobileUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Overlay Content (Tombol Detail Promo) */}
              {item.url && (
                <div className="absolute bottom-10 left-0 right-0 text-center z-10">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 bg-white/90 backdrop-blur-sm text-primary font-bold rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-105"
                  >
                    Lihat Detail Promo
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </Slider>
    </div>
  );
}

export default MainPage;
