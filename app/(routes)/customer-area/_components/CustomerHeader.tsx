import Image from "next/image";
import React from "react";
import bannerMobile from "@/public/assets/Images/banner-customer-mobile.svg";
import banner from "@/public/assets/Images/banner-customer.svg";

const CustomerHeader = () => {
  return (
    <div className="relative isolate">
      {/* Banner */}
      <div className="relative h-[200px] w-full overflow-hidden ">
        {/* Banner Mobile */}
        <Image
          src={bannerMobile}
          alt="Banner"
          fill
          priority
          className="block lg:hidden object-cover"
        />

        {/* Banner Desktop */}
        <Image
          src={banner}
          alt="Banner"
          fill
          priority
          className="hidden lg:block object-cover"
        />

        {/* Judul tengah */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-[40px] max-sm:text-[20px] font-extrabold ">
            Area Pelanggan
          </h1>
        </div>
      </div>

      {/* Spacer agar konten di bawah tidak ketiban avatar */}
      <div className="h-12 md:h-10" />
    </div>
  );
};

export default CustomerHeader;
