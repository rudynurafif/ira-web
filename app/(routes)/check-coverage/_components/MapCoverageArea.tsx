import React from "react";

import Image from "next/image";
import MapImage from "@/public/assets/check-coverage/map-coverage.png";
import CircleBG from "@/public/assets/check-coverage/bg-ring.webp";

function MapCoverageArea() {
  return (
    <div className="relative px-5 md:px-10">
      {/* header */}
      <div className="bg-[#D6201D] rounded-[20px] border-[7px] border-white px-5 py-3 mx-auto w-fit my-14 relative z-20">
        <p className="text-white text-lg md:text-xl lg:text-3xl text-center">
          Coverage Area Pelanggan{" "}
          <span className="font-bold">Internet Rakyat</span>
        </p>
      </div>

      {/* map */}
      <div className="w-full border-[3px] md:border-[5px] border-[#E61919] p-2 rounded-2xl md:rounded-[58px] mb-20 relative z-20 bg-white">
        <Image alt="map-coverage" src={MapImage} className="w-full" />
      </div>

      {/* bg image */}
      <div className="absolute top-0 left-0 z-0 w-full">
        <Image alt="circle-left" src={CircleBG} className="w-full" />
      </div>
    </div>
  );
}

export default MapCoverageArea;
