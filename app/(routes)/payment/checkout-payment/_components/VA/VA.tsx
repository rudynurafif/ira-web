"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoCopyOutline } from "react-icons/io5";
import moment from "moment";
import "moment/locale/id"; // Import locale Indonesia
import Image from "next/image";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

import { useSearchParams } from "next/navigation";
import { dataVa } from "./Data/dataVa";
import { VAPaymentData } from "@/app/_shared/types/payment";
import { formatDate, formatPaymentNumber } from "@/app/_shared/utils";

function VA({ data }: { data: VAPaymentData }) {
  const [selectedImage, setSelectedImage] = useState<any>("");
  const params = useSearchParams();
  const [selectedInstructionList, setSelectedInstructionList] = useState([]);
  const [activeInstructions, setActiveInstructions] = useState<any>({});
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const type = params.get("type");
    const selected = params.get("selected_payment");

    if (type && selected) {

      const matchedType = dataVa.find(
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

  const toggleInstruction = (title: any) => {
    setActiveInstructions((prev: any) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div>
      <div className="mt-4 bg-[#F7F9FD] border border-[#949AA3] w-full rounded-xl p-5 shadow-lg">
        <div className="flex flex-col justify-between w-full">
          <span className="block max-[580px]:text-sm">
            Nomor Virtual Account
          </span>
          <span className="font-bold text-dark-primary-2 text-[20px] sm:text-[23px] block pt-2">
            {formatPaymentNumber(data.va)}
          </span>

          <div className="max-sm:flex-col sm:flex sm:justify-between sm:items-center">
            <button
              type="button"
              disabled={isCopied}
              onClick={() => {
                navigator.clipboard
                  .writeText(data.va)
                  .then(() => {
                    setIsCopied(true);
                    toast.success("Nomor Virtual Account Berhasil Disalin!");

                    // Reset setelah 3 detik
                    setTimeout(() => {
                      setIsCopied(false);
                    }, 3000);
                  })
                  .catch((err) => {
                    toast.error("Gagal menyalin. Coba lagi.");
                    console.error("Error copying text: ", err);
                  });
              }}
              className={`bg-dark-primary-2 text-sm rounded-lg px-6 py-3 mt-1 flex text-white justify-center items-center gap-1 ${
                isCopied
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-dark-primary cursor-pointer"
              } transition`}
            >
              <div>
                <IoCopyOutline size={15} />
              </div>
              <div className="font-bold">
                {isCopied ? "Tersalin!" : "Salin"}
              </div>
            </button>

            <div className="sm:text-right">
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

              <span className="block pt-2 font-medium max-[580px]:text-sm">
                PT. INTEGRASI JARINGAN EKOSISTEM
              </span>
            </div>
          </div>

          <div className="flex justify-between gap-2 w-full pt-3">
            <div>Bayar Sebelum</div>
            <div className="sm:text-right font-medium">
              {formatDate(data.expire_at)}
            </div>
          </div>
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
                className="flex justify-between items-center gap-1 pt-4 cursor-pointer"
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
      </div>
    </div>
  );
}

export default VA;
