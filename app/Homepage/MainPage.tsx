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
import { getImageBanner } from "../Banner/Banner";
import { toastErrorFromAPI } from "../_shared/utils";
import { useAppSelector } from "../store/store";
import { useRouter } from "next/navigation";

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
    (state) => state.auth
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
      console.log(err.response.data.message);
    }
  }

  // useEffect(() => {
  //   getBannerImage();
  // }, []);

  return (
    <div className="relative bg-[url('/assets/Images/HERO-IRA.webp')] bg-cover bg-center bg-no-repeat text-white">
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
            Internet ngebut tanpa ribet pakai kabel.
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="my-6 w-[300px] sm:w-[300px] md:w-[400px] xl:w-[450px] 2xl:w-[550px]">
            <Image src={modemIra} alt="modem2" className="w-full" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
            <span className="font-bold">IRA Internet Rakyat -</span> Internet
            ngebut tanpa ribet pakai kabel.
          </h1>
          {/* <div className="flex gap-4 items-start justify-center mt-5">
            <p>Supported by:</p>
            <Image src={starlite} width={120} alt="starlite" />
          </div> */}
          {/* <p className="text-4xl font-bold mt-8">
            Nikmati internet ngebut tanpa ribet pakai kabel.
          </p>
          <p className="text-xl mt-5">
            FREE TRIAL🎉 Yuk, coba gratis layanan IRA tanpa ribet, tanpa
            komitmen panjang!
          </p> */}
          {/* <button className="w-1/2 py-7 bg-primary rounded-full mt-10">
            Coba GRATIS selama 7 hari
          </button> */}
          <Link
            href="/auth/register"
            className="inline-flex gap-2 justify-center items-center mt-10 py-1.5 max-sm:py-1 max-sm:px-0.5 gradient-box rounded-full custom-click cursor-pointer"
            id="button-berlangganan-sekarang"
          >
            <div className="w-[97%] xl:py-9 relative flex justify-center px-[15px] gap-1 items-center bg-subs-new rounded-full h-[62px] mt-px overflow-hidden custom-bg-animation">
              <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 fancy-background w-[93%] z-0 h-[30px] rounded-full"></div>

              <span className="text-white text-base sm:text-lg md:text-2xl xl:text-3xl font-bold text-nowrap whitespace-nowrap relative max-sm:px-2 px-8">
                Coba GRATIS selama 30 hari
              </span>
            </div>
          </Link>
        </div>
        {/* <div className="mt-10">
          <CardPackage />
        </div> */}
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
  );
}

export default MainPage;
