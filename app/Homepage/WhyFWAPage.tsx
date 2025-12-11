import React from "react";

import desc1 from "@/public/assets/Images/main-desc-why-1.svg";
import desc2 from "@/public/assets/Images/main-desc-why-2.svg";
import desc3 from "@/public/assets/Images/main-desc-why-3.svg";
import Image, { StaticImageData } from "next/image";
import RegisterNowCard from "../_components/homepage/RegisterNowCard";
import { useAppSelector } from "../store/store";

interface descriptionListType {
  id: number;
  image: StaticImageData;
  description: string;
}

function WhyFWAPage() {
  const description: descriptionListType[] = [
    {
      id: 1,
      image: desc1,
      description: "Mulai dari harga hemat, cocok buat semua kebutuhan.",
    },
    {
      id: 2,
      image: desc2,
      description: "Streaming, kerja, main game? Semua lancar!",
    },
    {
      id: 3,
      image: desc3,
      description: "Harian, mingguan, atau bulanan? Terserah kamu!",
    },
  ];

  const { userInfo, isLoggedIn, shipmentStatus } = useAppSelector(
    (state) => state.auth
  );

  return (
    <div className="container mx-auto px-5 text-black py-18 max-sm:py-9">
      <h1 className="text-[32px] max-sm:text-[24px] font-bold text-center">
        Mengapa pilih Internet Rakyat <span className="inline">(IRA) ?</span>
      </h1>

      <div className="mt-[72px] max-sm:mt-12">
        <div className="grid grid-cols-3 max-sm:flex max-sm:flex-col max-sm:gap-6">
          {description.map((item, index: number) => {
            return (
              <div
                key={"desc-" + index}
                className="col-span-1 text-center max-sm:flex items-center justify-between"
              >
                <div className="inline-block rounded-full mx-auto ">
                  <div className="w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.description}
                      className="flex justify-center items-center w-[150px] h-[150px] max-sm:w-[60px] max-sm:h-[60px]"
                    />
                  </div>
                </div>
                <div className="w-3/4 mx-auto sm:mt-6">
                  <p className="text-center max-sm:text-start mx-auto text-xl max-sm:text-sm font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!userInfo && (
        <div className="mt-[150px] max-sm:mt-[50px]">
          <RegisterNowCard />
        </div>
      )}
    </div>
  );
}

export default WhyFWAPage;
