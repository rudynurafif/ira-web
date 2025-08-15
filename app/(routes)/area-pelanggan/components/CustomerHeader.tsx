import Image from "next/image";
import React from "react";

type Props = {
  bannerSrc: string;
};

const CustomerHeader = ({ bannerSrc }: Props) => {
  return (
    <div className="relative isolate">
      {/* Banner */}
      <div className="relative h-[200px] w-full overflow-hidden bg-black">
        {/* Gambar banner */}
        <Image
          src={bannerSrc}
          alt="Banner"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Overlay supaya judul kontras */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#081a3d]/70 via-transparent to-[#081a3d]/30" />

        {/* Judul tengah */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-[40px] font-extrabold tracking-wide">
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
