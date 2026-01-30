import { packageList } from "@/app/_shared/data/data";
import { convertToCurrency } from "@/app/_shared/utils";
import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function CardPackage() {
  const [centerIndex, setCenterIndex] = useState<number>(0);

  useEffect(() => {
    if (packageList.length > 3) {
      setCenterIndex(0);
    } else {
      setCenterIndex(1);
    }
  }, []);

  const settingsSlider = {
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
    afterChange: (current: number) => {
      // console.log(current);
      setCenterIndex(current);
    },
  };

  return (
    <div className="">
      <Slider {...settingsSlider}>
        {packageList.map((item: any, index: number) => {
          if (index !== centerIndex) {
            return (
              <div key={"package-" + index} className="px-3 mt-2">
                <div className="bg-[rgba(255,255,255,0.2)] rounded-xl p-5 text-black">
                  <p className="">{item.name}</p>
                  <p className="flex gap-1 items-center">
                    <span className="text-3xl font-extrabold">
                      {convertToCurrency(item.price)}
                    </span>
                    / berlaku {item.period} Hari
                  </p>
                  <ul className="list-none list-inside my-5">
                    {item.benefit.map((benefit: any, index: number) => {
                      return (
                        <li
                          key={"benefit-" + index}
                          className="flex gap-2 items-start mb-1"
                        >
                          <FaCircleCheck
                            size={20}
                            color="#308FFF"
                            className="mt-[2px]"
                          />
                          <p>{benefit}</p>
                        </li>
                      );
                    })}
                  </ul>

                  <button className="w-full bg-primary text-white py-2 rounded-lg cursor-pointer">
                    Pilih Paket
                  </button>
                </div>
              </div>
            );
          } else {
            return (
              <div key={"package-" + index} className="px-3">
                <div className="bg-[rgba(255,255,255,0.2)] rounded-xl p-2 text-black">
                  <div className="bg-white rounded-xl p-5 text-black">
                    <p className="">{item.name}</p>
                    <p className="flex gap-1 items-center">
                      <span className="text-3xl font-extrabold">
                        {convertToCurrency(item.price)}
                      </span>
                      / berlaku {item.period} Hari
                    </p>
                    <ul className="list-none list-inside my-5">
                      {item.benefit.map((benefit: any, index: number) => {
                        return (
                          <li
                            key={"benefit-" + index}
                            className="flex gap-2 items-start mb-1"
                          >
                            <FaCircleCheck
                              size={20}
                              color="#308FFF"
                              className="mt-[2px]"
                            />
                            <p>{benefit}</p>
                          </li>
                        );
                      })}
                    </ul>

                    <button className="w-full bg-dark-primary text-white py-2 rounded-lg cursor-pointer">
                      Pilih Paket
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </Slider>
    </div>
  );
}

export default CardPackage;
