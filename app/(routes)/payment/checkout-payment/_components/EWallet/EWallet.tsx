"use client";

import { EWalletPaymentData } from "@/app/_shared/types/payment";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { dataEWallet } from "./Data/dataEWallet";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const EWallet = ({ data }: { data: EWalletPaymentData }) => {
  const [checkOutUrl, setCheckOutUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>("");
  const [activeInstructions, setActiveInstructions] = useState<any>({});
  const [selectedInstructionList, setSelectedInstructionList] = useState([]);
  const params = useSearchParams();
  const router = useRouter()

  useEffect(() => {
    const type = params.get("type"); 
    const selected = params.get("selected_payment");
    if (type && selected) {
      const matchedType = dataEWallet.find(
        (item) => item.route.toLowerCase() === type
      );
      if (matchedType) {
        const matchedLogo: any = matchedType.logo.find(
          (logo) => logo.name === selected
        );
        if (matchedLogo) {
          setSelectedImage(matchedLogo.image);
          setSelectedInstructionList(matchedLogo.instructions || []);
        }
      }
    }
  }, [params]);

  const handleOpenCheckoutUrl = () => {
    const url =
      data.desktop_web_checkout_url ??
      data.mobile_web_checkout_url ??
      data.qr_checkout_string ??
      data.mobile_deeplink_checkout_url ??
      undefined;

    setCheckOutUrl(url ?? null);

    if (url) {
      router.push(url)
      // window.location.href = url;
    }
  };

  const toggleInstruction = (title: any) => {
    setActiveInstructions((prev: any) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="mt-10">
      <div className="bg-[#F7F9FD] flex justify-between items-center border border-[#949AA3] w-full rounded-xl p-5 shadow-lg mb-6">
        <p>E-Wallet</p>
        {selectedImage && (
          <div className="flex sm:justify-end">
            <Image
              src={selectedImage}
              alt=""
              width={500}
              height={500}
              className="w-[124px] h-fit my-3"
            />
          </div>
        )}
      </div>

      <div className="">
        {selectedInstructionList.map((item: any, index: number) => (
          <div key={index}>
            {/* Header */}
            <div
              onClick={() => {
                toggleInstruction(item.title);
              }}
              className="flex justify-between text-sm sm:text-base items-center gap-1 pt-4 cursor-pointer"
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
              <div className="bg-[#C5C5C5] w-full h-px mt-3"></div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleOpenCheckoutUrl}
        className="bg-primary mt-6 hover:bg-dark-primary-2 cursor-pointer rounded-full sm:rounded-lg font-bold text-white w-full text-sm sm:text-xl py-4"
      >
        Bayar Disini
      </button>
    </div>
  );
};

export default EWallet;
