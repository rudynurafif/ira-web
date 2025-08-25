import React from "react";

import desc1 from "@/public/assets/Images/main-desc-why-1.svg";
import desc2 from "@/public/assets/Images/main-desc-why-2.svg";
import desc3 from "@/public/assets/Images/main-desc-why-3.svg";
import Image, { StaticImageData } from "next/image";
import RegisterNowCard from "../_components/homepage/RegisterNowCard";
import imageCubmu from "@/public/assets/Images/cubmu.svg";

interface descriptionListType {
  id: number;
  image: StaticImageData;
  color: string;
  description: string;
}

function WhyFWAPage() {
  const description: descriptionListType[] = [
    {
      id: 1,
      image: desc1,
      color: "rgba(79, 255, 181, 0.20)",
      description: "Mulai dari harga hemat, cocok buat semua kebutuhan.",
    },
    {
      id: 2,
      image: desc2,
      color: "rgba(234, 175, 255, 0.20)",
      description: "Streaming, kerja, main game? Semua lancar!",
    },
    {
      id: 3,
      image: desc3,
      color: "rgba(2, 239, 254, 0.20)",
      description: "Harian, mingguan, atau bulanan? Terserah kamu!",
    },
  ];

  return (
    <div className="container mx-auto px-5 text-black my-[153px]">
      <h1 className="text-[32px] font-bold text-center">
        Mengapa pilih Starlite FWA (Fixed Wireless Access) ?
      </h1>

      <div className="mt-[72px]">
        <div className="grid grid-cols-3 items-center">
          {description.map((item, index: number) => {
            return (
              <div key={"desc-" + index} className="col-span-1 text-center">
                <div
                  className="inline-block p-[47px] rounded-full mx-auto"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.description}
                      className="flex justify-center items-center w-[50px] h-[50px]"
                    />
                  </div>
                </div>
                <div className="w-3/4 mx-auto mt-6">
                  <p className="text-center mx-auto text-xl font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-[150px]">
        <RegisterNowCard />
      </div>

      <div className="mt-[221px]">
        <Image alt="cubmu" src={imageCubmu} className="w-full" />
      </div>
    </div>
  );
}

export default WhyFWAPage;
