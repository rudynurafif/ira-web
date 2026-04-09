"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoCopyOutline } from "react-icons/io5";
import moment from "moment";
import "moment/locale/id"; // Import locale Indonesia
import Image from "next/image";
import SecureImage from "@/app/_components/SecureImage";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

import { useRouter, useSearchParams } from "next/navigation";
import { dataVa } from "./Data/dataVa";
import { UnifiedPaymentData } from "@/app/_shared/types/payment";
import {
  formatDate,
  formatPaymentNumber,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { getPaymentStatus } from "@/app/_api/Payment/Payment";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import Lottie from "lottie-react";
import successAnimation from "@/public/assets/Icons/SuccessAnimation.json";
import failedAnimation from "@/public/assets/Icons/FailedAnimation.json";
import { useAppSelector } from "@/app/store/store";
import { getPaymentStatusMicrosite } from "@/app/_api/Payment/Payment-Microsite";

function VA({ data }: { data: UnifiedPaymentData }) {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<any>("");
  const params = useSearchParams();
  const [selectedInstructionList, setSelectedInstructionList] = useState([]);
  const [activeInstructions, setActiveInstructions] = useState<any>({});
  const [isCopied, setIsCopied] = useState(false);

  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);

  const salesId = params.get("sales_id");

  const checkPaymentStatus = async () => {
    setIsLoadingStatus(true);

    try {
      const customerCode = sessionStorage.getItem("customer_code");
      const params = {
        customer_code: customerCode,
        ...(salesId && { mitra_user_id: salesId }),
      };
      const res_status = isLoggedIn
        ? await getPaymentStatus(params)
        : await getPaymentStatusMicrosite(params);
      const isPaid = res_status?.data?.data;

      // Non-login + success → halaman khusus (bukan modal)
      if (!isLoggedIn && isPaid === true) {
        const selectedPkg = JSON.parse(
          sessionStorage.getItem("selectedPackage") || "{}",
        );
        const selectedMethod = JSON.parse(
          sessionStorage.getItem("selectedPaymentMethod") || "{}",
        );
        sessionStorage.setItem(
          "paymentSuccessData",
          JSON.stringify({
            invoiceRef:
              data.reference_id ||
              data.payment_attempt?.reference_id ||
              data.id ||
              "-",
            customerId: customerCode || data.customer_id?.customer_code || "-",
            description: selectedPkg?.name || data.package_id?.name || "-",
            paidAt: new Date().toISOString(),
            paymentMethod:
              selectedMethod?.name ||
              data.channel_payment_id?.name ||
              data.channel_code ||
              "-",
            amount: Number(data.amount) || selectedPkg?.price || 0,
          }),
        );
        router.replace(
          salesId
            ? `/payment-billing/success?sales_id=${salesId}`
            : "/payment-billing/success",
        );
        return;
      }

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
    const type = params.get("type");
    const selected = params.get("selected_payment");

    if (type && selected) {
      const matchedType = dataVa.find(
        (item) => item.route.toLowerCase() === type,
      );
      if (matchedType) {
        const matchedLogo: any = matchedType.logo.find(
          (logo) => logo.name === selected,
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
            {formatPaymentNumber(data.va ?? "-")}
          </span>

          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              disabled={isCopied}
              onClick={() => {
                navigator.clipboard
                  .writeText(data.va ?? "-")
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
                  ? "opacity-60 cursor-not-allowed!"
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

            <div className="text-right">
              {data.channel_payment_id?.logo && (
                <div className="flex justify-end">
                  {/* <SecureImage
                    obsPath={data.channel_payment_id?.logo}
                    alt={data.channel_payment_id?.name}
                    width={500}
                    height={500}
                    className="w-31 h-fit my-3"
                  /> */}
                  <Image
                    src={`${process.env.NEXT_PUBLIC_URL_OBS}${data.channel_payment_id?.logo}`}
                    alt={data.channel_payment_id?.name}
                    width={500}
                    height={500}
                    className="w-31 h-fit my-3"
                  />
                </div>
              )}

              <span className="block pt-2 font-medium max-[580px]:text-[12px]">
                PT. TELEMEDIA KOMUNIKASI PRATAMA
              </span>
            </div>
          </div>

          {data.payment_attempt?.expires_at && (
            <div className="flex justify-between gap-2 w-full pt-3 max-sm:text-sm text-primary">
              <div className="">Bayar Sebelum</div>
              <div className="text-right font-medium">
                {formatDate(data?.payment_attempt?.expires_at)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        {data.channel_payment_id?.description ? (
          <div className="container mx-auto my-6">
            <div
              dangerouslySetInnerHTML={{
                __html: data.channel_payment_id.description,
              }}
              className="
                          [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2
                          [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-2
                          [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1
                          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1
                          [&>p]:my-2 [&>p]:text-sm
                          [&>strong]:font-semibold  
                        "
            />
          </div>
        ) : (
          <div className="">
            {selectedInstructionList.map((item: any, index: number) => (
              <div key={index}>
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

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeInstructions[item.title]
                      ? "max-h-125 opacity-100"
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
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={checkPaymentStatus}
          disabled={isLoadingStatus}
          className={`${isLoadingStatus ? "opacity-50" : "hover:bg-dark-primary-2"} bg-primary text-white disabled:cursor-not-allowed! cursor-pointer sm:mt-10 mt-3 rounded-full sm:rounded-lg font-bold w-full max-sm:text-sm py-3`}
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
              <h2 className="text-xl font-bold text-green-600 mb-2 mt-10 sm:mt-3">
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
              <h2 className="text-xl font-bold text-red-600 mb-2 mt-10 sm:mt-3">
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
}

export default VA;
