"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoCopyOutline } from "react-icons/io5";
import moment from "moment";
import "moment/locale/id"; // Import locale Indonesia
import Image from "next/image";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import checkoutOutlet from "@/public/assets/checkout-payment/checkout-outlet.png";

import { useSearchParams } from "next/navigation";
import { dataOutlet } from "./Data/dataOutlet";

function Outlet() {
  const [selectedImage, setSelectedImage] = useState<any>("");
  const [selectedInstructionList, setSelectedInstructionList] = useState([]);

  const params = useSearchParams();
  const [activeInstructions, setActiveInstructions] = useState<any>({});

  // outletAlfa

  useEffect(() => {
    const type = params.get("type");
    const selected = params.get("selected_payment");

    if (type && selected) {
      const matchedType = dataOutlet.find((item) => item.route.toLowerCase() === type);
      if (matchedType) {
        const matchedLogo: any = matchedType.logo.find(
          (logo) => logo.name.toLowerCase() === selected
        );
        if (matchedLogo) {
          setSelectedImage(matchedLogo);
          setSelectedInstructionList(matchedLogo.instructions || []);
        }
      }
    }
  }, [params]);

  const toggleInstruction = (title: any) => {
    setActiveInstructions((prev: any) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div>
      <div className="mt-4 bg-[#F7F9FD]  border border-[#949AA3] w-full rounded-[12px] p-5">
        <span className="block text-center text-blue ">
          Tunjukkan Kode QR ke Kasir
        </span>

        <div className="flex justify-center pt-2">
          <Image
            src={checkoutOutlet}
            alt="outlet"
            width={500}
            height={500}
            className=" w-[250px] sm:w-[268px] h-fit"
          />
        </div>
      </div>

      <div>
        <div className="">
          {selectedInstructionList.map((item: any, index: number) => (
            <div key={index}>
              {/* Header */}
              <div
                onClick={() => {
                  toggleInstruction(item.title);
                }}
                className="flex justify-between items-center gap-1 cursor-pointer pt-4"
              >
                <span className="font-bold block">{item.title}</span>

                {activeInstructions[item.title] ? (
                  <IoIosArrowUp size={25} className="text-black" />
                ) : (
                  <IoIosArrowDown size={25} className="text-black" />
                )}
              </div>

              {/* Content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  activeInstructions[item.title]
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                } pt-2`}
              >
                <ol className="list-decimal pl-7 max-sm:text-sm">
                  {item.list.map((step: any, idx: number) => (
                    <li
                      key={idx}
                      dangerouslySetInnerHTML={{ __html: step }}
                      className="mb-2"
                    />
                  ))}
                </ol>
              </div>

              {index !== selectedInstructionList.length - 1 && (
                <div className="bg-[#C5C5C5] w-full h-[1px] mt-3"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Outlet;
