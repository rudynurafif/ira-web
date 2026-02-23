import Image from "next/image";
import React, { useState } from "react";

import googlePlay from "@/public/assets/Images/GooglePlayBlack.png";
import appStore from "@/public/assets/Images/AppStoreBlack.png";
import appImage from "@/public/assets/Images/app-image.png";
import toast from "react-hot-toast";

const DownloadApp = () => {
  const [isToastCooldown, setIsToastCooldown] = useState<boolean>(false);

  const handleDownloadInvoice = (type: string): void => {
    if (isToastCooldown) return;

    try {
      setIsToastCooldown(true);

      if (type === "google") {
        window.open(
          "https://play.google.com/store/apps/details?id=com.weave.ira",
          "_blank",
        );
      } else if (type === "apple") {
        toast("Coming Soon!");
      }
    } catch (error) {
      console.error("Error handling download:", error);
      toast("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setTimeout(() => setIsToastCooldown(false), 1000);
    }
  };

  return (
    <div className="container mx-auto px-5 py-16 max-sm:py-8">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        {/* Image - Order 1 on mobile, Order 2 on desktop */}
        <div className="w-full lg:w-1/3 flex justify-center order-1 lg:order-2">
          <Image
            src={appImage}
            alt="faq"
            width={400}
            height={300}
            className="w-full max-w-md h-auto"
          />
        </div>

        {/* Text Content - Order 2 on mobile, Order 1 on desktop */}
        <div className="max-w-5xl w-full lg:w-2/3 order-2 lg:order-1">
          <p className="text-[32px] font-bold max-sm:text-2xl max-sm:text-center">
            Nikmati Layanan Lebih Mudah dengan Aplikasi IRA
          </p>
          <p className="text-xl mt-4 max-sm:text-sm max-sm:text-center">
            Dapatkan kontrol penuh atas layanan internet Anda hanya dengan
            beberapa klik. Dengan aplikasi IRA, Anda dapat dengan mudah membeli
            paket, memonitor status modem, cek signal, dan melakukan banyak hal
            lainnya. Unduh aplikasi IRA di Google Play dan nikmati kemudahan
            mengelola layanan internet Anda di mana saja dan kapan saja.
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
              onClick={() => handleDownloadInvoice("google")}
            />
            {/* <Image
              alt="AppStore"
              src={appStore}
              width={180}
              height={60}
              className="max-sm:w-48 max-sm:h-auto cursor-pointer hover:scale-105"
              onClick={() => handleDownloadInvoice("apple")}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
