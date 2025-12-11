import React from "react";
import IconScan from "@/public/assets/Icons/icon-scan-camera.svg";
import IconInput from "@/public/assets/Icons/icon-input-manual.svg";
import Image from "next/image";

import { addUrlParam } from "@/app/_shared/utils";

function ModemActivationsOptions() {
  return (
    <div className="container mx-auto">
      <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-center text-old-primary">
        Aktivasi Modem
      </h2>

      <div className="flex justify-center items-center gap-2 pt-10">
        <button
          type="button"
          className="group cursor-pointer"
          onClick={() => {
            // setActiveSection("scan");
            addUrlParam("section", "scan");
          }}
        >
          <div className="rounded-[20px] border group-hover:border-2 border-black w-fit mx-auto p-4 ">
            <Image
              src={IconScan}
              alt="icon Scan"
              className="w-[50px] h-[50px] transition-all duration-300 ease-in-out group-hover:scale-110"
            />
          </div>
          <span className="block max-sm:text-sm pt-2 text-center group-hover:font-bold transition-all duration-300">
            Scan Barcode
          </span>
        </button>
        <div className="pb-[25px]">atau</div>
        <button
          type="button"
          className="group cursor-pointer"
          onClick={() => {
            // setActiveSection("input");
            addUrlParam("section", "input");
          }}
        >
          <div className="rounded-[20px] border group-hover:border-2 border-black w-fit mx-auto p-4 ">
            <Image
              src={IconInput}
              alt="icon Scan"
              className="w-[50px] h-[50px] transition-all duration-300 ease-in-out group-hover:scale-110"
            />
          </div>
          <span className="block max-sm:text-sm pt-2 text-center group-hover:font-bold transition-all duration-300">
            Input Manual
          </span>
        </button>
      </div>
    </div>
  );
}

export default ModemActivationsOptions;
