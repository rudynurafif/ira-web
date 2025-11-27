"use client";
import React from "react";
import iconWeave from "../../public/assets/icon/weave-logo.png";
import iconIra from "../../public/assets/icon/starlite-logo.png";
import Image from "next/image";
import arrowClick from "../../public/assets/icon/arrow-click.svg";

function Landing() {
  const tablePrice = [
    {
      id: 1,
      title: "Internet Up to",
      content: "500",
    },
    {
      id: 2,
      title: "Kuota",
      content: "Unlimited",
    },
    {
      id: 3,
      title: "Pemasangan",
      content: "GRATIS!",
    },
  ];
  return (
    <div className="bg-[url('/assets/landing/landing-image.png')] min-h-[675px]  bg-no-repeat bg-center bg-cover w-full h-full">
      <div className="flex gap-4 lg:gap-8  items-center pt-10 pl-20">
        <div>
          <Image
            src={iconIra}
            alt="icon-ira"
            width={500}
            height={500}
            className="w-[67px] h-fit"
          />
        </div>
        <div>
          <Image
            src={iconWeave}
            alt="icon-weave"
            width={500}
            height={500}
            className="w-[126px] h-fit"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 w-full pr-[5%] min-[1440px]:pr-[15%]">
        <div>
          <div className="flex gap-2 items-center text-bluebold bg-[#F5F5F5] rounded-[24px] border border-orange shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)] p-3 w-fit">
            <div className="font-medium ">
              Pasang tinggal{" "}
              <label htmlFor="KLIK" className="font-bold">
                KLIK
              </label>
            </div>

            <div>
              <Image src={arrowClick} alt="arrow click" />
            </div>
          </div>

          <div className="pt-5 ">
            <span className="block text-bluebold font-bold leading-[115%] text-[24px]">
              Streaming, gaming, download cepat—
            </span>

            <div className="flex text-bluebold items-start gap-x-2 pt-3">
              <div className="text-xs leading-[115%] font-medium">Up to</div>
              <span className="block font-bold text-[52px] leading-[70%]">
                500 Mbps siap
              </span>
            </div>
            <span className="block text-bluebold font-bold text-[52px]">
              mendukung Anda!
            </span>
          </div>

          <div className="mt-2 grid grid-cols-3 overflow-hidden gap-y-4 gap-x-[2px] rounded-[15px] border-2 border-[#F5F5F5]  bg-white  ">
            {tablePrice.map((data, index) => {
              return (
                <div
                  key={index}
                  className="pb-3  shadow-[inset_3px_-3.5px_2px_0px_rgba(0,0,0,0.25)]"
                >
                  <div
                    className={`bg-gradient-orange w-full text-center p-2 text-[#F5F5F5]  `}
                  >
                    <div>{data.title}</div>
                  </div>

                  <div
                    className={`text-center pt-2 text-bluebold font-bold leading-[120%] text-[25px] ${
                      data.id === 1 ? "flex justify-center gap-1" : ""
                    }`}
                  >
                    <div>{data.content}</div>
                    {data.id === 1 && (
                      <div className="flex items-end leading-[120%] font-bold text-[10px] text-bluebold">
                        Mbps
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
