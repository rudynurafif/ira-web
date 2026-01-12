"use client";

import { EWalletPaymentData } from "@/app/_shared/types/payment";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { dataEWallet } from "./Data/dataEWallet";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { getPaymentStatus } from "@/app/_api/Payment/Payment";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import Lottie from "lottie-react";
import successAnimation from "@/public/assets/Icons/SuccessAnimation.json";
import failedAnimation from "@/public/assets/Icons/FailedAnimation.json";

const EWallet = ({ data }: { data: EWalletPaymentData }) => {
  const [checkOutUrl, setCheckOutUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>("");
  const [activeInstructions, setActiveInstructions] = useState<any>({});
  const [selectedInstructionList, setSelectedInstructionList] = useState([]);
  const params = useSearchParams();
  const router = useRouter();

  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

   const type = params.get("type");
    const selected = params.get("selected_payment");

  const checkPaymentStatus = async () => {
    setIsLoadingStatus(true);

    try {
      const res_status = await getPaymentStatus();
      const isPaid = res_status?.data?.data;

      setPaymentStatus(isPaid);
      setShowResultModal(true);
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const closeModal = () => {
    setShowResultModal(false);
    if (paymentStatus === true) {
      router.push("/customer-area");
    }
  };

  useEffect(() => {
   
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
      router.push(url);
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
      <div className="bg-[#F7F9FD] flex flex-col border border-[#949AA3] w-full rounded-xl p-5 shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <p>E-Wallet</p>
          {selectedImage && (
            <div className="flex sm:justify-end">
              <Image
                src={selectedImage}
                alt={selected ?? "E-Wallet Logo"}
                width={100}
                height={100}
                className="w-31 h-fit my-3"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpenCheckoutUrl}
          className="bg-primary mt-6 hover:bg-dark-primary-2 cursor-pointer rounded-full sm:rounded-lg font-bold text-white w-full text-sm sm:text-xl py-4"
        >
          Bayar Disini
        </button>
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

      <div className="text-center">
        <button
          type="button"
          onClick={checkPaymentStatus}
          disabled={isLoadingStatus}
          className="bg-white hover:bg-red-50 border-2 border-primary text-primary disabled:cursor-not-allowed cursor-pointer sm:mt-10 mt-3 rounded-lg font-bold w-full max-sm:text-sm py-3"
        >
          {isLoadingStatus ? "Sedang mengecek.." : "Cek Status Pembayaran"}
        </button>
      </div>

      {showResultModal && paymentStatus !== null && (
        <ModalTemplate
          closeModal={closeModal}
          classNameModal="max-w-md p-6 text-center"
        >
          {paymentStatus ? (
            <>
              <h2 className="text-xl font-bold text-green-600 mb-2 mt-3">
                Pembayaran Berhasil! 🎉
              </h2>
              <div className="flex justify-center my-4">
                <Lottie
                  animationData={successAnimation}
                  className="w-40 h-40"
                />
              </div>
              <p className="text-gray-700">
                Terima kasih! Paket langganan Anda telah aktif.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-red-600 mb-2 mt-3">
                Pembayaran Belum Berhasil
              </h2>
              <div className="flex justify-center my-4">
                <Lottie animationData={failedAnimation} className="w-40 h-40" />
              </div>
              <p className="text-gray-700">
                Silakan lakukan pembayaran terlebih dahulu.
              </p>
            </>
          )}
          <button
            onClick={closeModal}
            className="mt-4 cursor-pointer px-6 py-2 bg-primary hover:bg-dark-primary-2 text-white rounded-lg"
          >
            Tutup
          </button>
        </ModalTemplate>
      )}
    </div>
  );
};

export default EWallet;
