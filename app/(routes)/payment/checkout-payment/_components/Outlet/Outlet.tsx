"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoCopyOutline } from "react-icons/io5";
import moment from "moment";
import "moment/locale/id"; // Import locale Indonesia
import Image from "next/image";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import checkoutOutlet from "@/public/assets/checkout-payment/checkout-outlet.png";
import { getPaymentStatus } from "@/app/_api/Payment/Payment";
import { useRouter, useSearchParams } from "next/navigation";
import { dataOutlet } from "./Data/dataOutlet";
import { formatDate, toastErrorFromAPI } from "@/app/_shared/utils";
import Lottie from "lottie-react";
import successAnimation from "@/public/assets/Icons/SuccessAnimation.json";
import failedAnimation from "@/public/assets/Icons/FailedAnimation.json";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { UnifiedPaymentData } from "@/app/_shared/types/payment";
import Indomaret from "@/public/assets/Icons/payment-method/outlet/indomaret-large.png";
import Alfamart from "@/public/assets/Icons/payment-method/outlet/logo-alfamart.png";
import { getPaymentStatusMicrosite } from "@/app/_api/Payment/Payment-Microsite";
import { useAppSelector } from "@/app/store/store";

function Outlet({ data }: { data: UnifiedPaymentData }) {
  const [selectedImage, setSelectedImage] = useState<any>("");
  const [selectedInstructionList, setSelectedInstructionList] = useState([]);

  const params = useSearchParams();
  const router = useRouter();
  const [activeInstructions, setActiveInstructions] = useState<any>({});

  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const { userInfo } = useAppSelector((state) => state.auth);

  // outletAlfa

  const checkPaymentStatus = async () => {
    setIsLoadingStatus(true);

    try {
      const customerId = sessionStorage.getItem("customer_id");
      const params = {
        customer_code: customerId,
      };
      const res_status = userInfo
        ? await getPaymentStatus(params)
        : await getPaymentStatusMicrosite(params);
      const isPaid = res_status?.data?.data;

      // Non-login + success → halaman khusus (bukan modal)
      if (!userInfo && isPaid === true) {
        const selectedPkg = JSON.parse(sessionStorage.getItem("selectedPackage") || "{}");
        const selectedMethod = JSON.parse(sessionStorage.getItem("selectedPaymentMethod") || "{}");
        sessionStorage.setItem("paymentSuccessData", JSON.stringify({
          invoiceRef: data.reference_id || data.payment_attempt?.reference_id || data.id || "-",
          customerId: customerId || data.customer_id?.customer_code || "-",
          description: selectedPkg?.name || data.package_id?.name || "-",
          paidAt: new Date().toISOString(),
          paymentMethod: selectedMethod?.name || data.channel_payment_id?.name || data.channel_code || "-",
          amount: Number(data.amount) || selectedPkg?.price || 0,
        }));
        router.push("/payment-billing/success");
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

  const type = params.get("type");
  const selected = params.get("selected_payment");

  useEffect(() => {
    if (type && selected) {
      const matchedType = dataOutlet.find(
        (item) => item.route.toLowerCase() === type,
      );
      if (matchedType) {
        const matchedLogo: any = matchedType.logo.find(
          (logo) => logo.name === selected,
        );
        if (matchedLogo) {
          setSelectedImage(matchedLogo);
          setSelectedInstructionList(matchedLogo.instructions || []);
        }
      }
    }
  }, [params, selected, type]);

  const toggleInstruction = (title: any) => {
    setActiveInstructions((prev: any) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div>
      <div className="mt-4 bg-[#F7F9FD]  border border-[#949AA3] w-full rounded-xl p-5">
        <span className="block text-center text-blue ">
          Tunjukkan Kode Pembayaran ke Kasir
        </span>

        <div className="flex justify-center pt-2">
          {data.channel_payment_id?.logo && (
            <div className="flex justify-end">
              <Image
                src={
                  `${process.env.NEXT_PUBLIC_URL_OBS}${data.channel_payment_id?.logo}` ||
                  selectedImage
                }
                alt={data.channel_payment_id?.name}
                width={500}
                height={500}
                className="w-31 h-fit my-3"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center font-bold text-xl my-3">
          Kode: {data.va ?? "-"}
        </div>

        <div className="flex justify-between gap-2 w-full pt-3 max-sm:text-sm text-primary">
          <div className="">Bayar Sebelum</div>
          <div className="text-right font-medium">
            {formatDate(data.payment_attempt.expires_at ?? "-")}
          </div>
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
                {/* Header */}
                <div
                  onClick={() => {
                    toggleInstruction(item.title ?? "-");
                  }}
                  className="flex justify-between items-center gap-1 cursor-pointer pt-4"
                >
                  <span className="font-bold block">{item.title ?? "-"}</span>

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

      <div className="text-center my-3">
        <button
          type="button"
          onClick={checkPaymentStatus}
          disabled={isLoadingStatus}
          className={`bg-primary hover:bg-dark-primary-2 text-white disabled:cursor-not-allowed! cursor-pointer sm:mt-10 mt-3 rounded-full font-bold w-full max-sm:text-sm py-3 ${isLoadingStatus ? "bg-primary/50 cursor-not-allowed" : ""}`}
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

export default Outlet;
