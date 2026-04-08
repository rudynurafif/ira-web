"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRIS from "./_components/Qris/QRIS";
import VA from "./_components/VA/VA";
import {
  convertToCurrency,
  convertToCurrency2,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import Outlet from "./_components/Outlet/Outlet";
import { UnifiedPaymentData } from "@/app/_shared/types/payment";
import { getCurrentPayment } from "@/app/_api/Payment/Payment";
import toast from "react-hot-toast";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import Loader from "@/app/_components/Loader";
import EWallet from "./_components/EWallet/EWallet";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import Image from "next/image";
import { getCurrentPaymentMicrosite } from "@/app/_api/Payment/Payment-Microsite";
import { useAppSelector } from "@/app/store/store";

function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type")?.toLowerCase(); // 'va', 'qris', 'ewallet', 'otc'
  const salesId = params.get("sales_id");

  const [salesIdState, setSalesIdState] = useState<string | null>(null);

  useEffect(() => {
    if (salesId) {
      setSalesIdState(salesId);
    }
  }, [salesId]);

  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<
    UnifiedPaymentData | undefined
  >();
  const id = params.get("id");
  const [openModalCancel, setopenModalCancel] = useState(false);

  const handleCancelPayment = () => {
    const confirmed = window.confirm("Apakah Anda Yakin?");

    if (confirmed) {
      window.location.href = "/customer-area";
    }
  };

  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);

  const getCurrentPaymentData = async () => {
    try {
      const customerCode =
        userInfo?.customer_code || sessionStorage.getItem("customer_code");

      const params = {
        customer_code: customerCode,
        ...(salesId && { mitra_user_id: salesId }),
      };

      const res = isLoggedIn
        ? await getCurrentPayment(params)
        : await getCurrentPaymentMicrosite(params);

      if (res?.data?.data === null) {
        toast.error("Terjadi kesalahan. Silakan pilih paket kembali");
        if (isLoggedIn) {
          router.push("/payment");
        } else {
          router.push("/payment-billing");
        }
        return;
      }

      setPaymentInfo(res.data?.data);
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Jalankan jika sudah tahu status loginnya (isLoggedIn) atau jika terdeteksi data microsite
    if (isLoggedIn || sessionStorage.getItem("customer_code")) {
      getCurrentPaymentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userInfo]);

  const bankFee =
    paymentInfo && "channel_payment_id" in paymentInfo
      ? parseInt((paymentInfo as any).channel_payment_id?.fee_flat ?? "0")
      : 0;

  const bankFeeBackup =
    (typeof paymentInfo?.amount === "string"
      ? parseFloat(paymentInfo.amount)
      : (paymentInfo?.amount ?? 0)) -
    (typeof paymentInfo?.package_id?.price === "string"
      ? parseFloat(paymentInfo.package_id?.price)
      : (paymentInfo?.package_id?.price ?? 0));

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="">
      <div className="container mx-auto p-6">
        <div className="flex gap-2 items-center justify-center">
          <div className="font-bold text-old-primary md:text-3xl text-2xl">
            Pembayaran
          </div>
        </div>

        <div className="mt-6 sm:bg-white sm:shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)] sm:rounded-xl sm:p-6">
          <div className="grid grid-cols-2 gap-y-2 sm:text-base text-xs">
            <div>Nama Paket</div>
            <div className="text-right">
              {paymentInfo?.package_id?.name || "-"}
            </div>

            <div>Deskripsi</div>
            <div className="text-right">
              {paymentInfo?.package_id?.description || "-"}
            </div>

            <div>Subtotal</div>
            <div className="text-right">
              {convertToCurrency(paymentInfo?.package_id?.price || 0)}
            </div>

            <div>Biaya Bank/Admin</div>
            <div className="text-right">
              {convertToCurrency2(
                bankFee !== undefined && bankFee !== null && bankFee !== 0
                  ? bankFee
                  : bankFeeBackup,
              )}
            </div>
          </div>

          <div className="border border-gray-border sm:my-5 my-3"></div>

          <div className="grid grid-cols-2 gap-y-2 text-sm items-center">
            <div className="text-base font-semibold sm:text-xl">
              Total Pembayaran
            </div>
            <div className="text-right text-primary font-bold text-lg sm:text-2xl">
              {convertToCurrency2(paymentInfo?.amount ?? "0")}
            </div>
          </div>

          {params.get("type") &&
          params.get("type")?.toLowerCase() === "qris" ? (
            <QRIS data={paymentInfo as UnifiedPaymentData} />
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "va" ? (
            paymentInfo ? (
              <VA data={paymentInfo as UnifiedPaymentData} />
            ) : null
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "otc" ? (
            <Outlet data={paymentInfo as UnifiedPaymentData} />
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "ewallet" ? (
            <EWallet data={paymentInfo as UnifiedPaymentData} />
          ) : (
            ""
          )}

          <button
            type="button"
            onClick={handleCancelPayment}
            className="cursor-pointer underline sm:mt-10 mt-3 rounded-lg font-bold text-primary hover:text-dark-primary-2 w-full max-sm:text-sm py-3"
          >
            Kembali Ke Area Pelanggan
          </button>
        </div>
      </div>

      {/* <ModalTemplate
        closeModal={() => {
          setopenModalCancel(false);
        }}
      >
        <div className="p-6 mt-6">
          <div className="flex justify-center">
            <Image
              src={limitImage}
              width={170}
              height={170}
              alt="limit-image"
            />
          </div>

          <h3 className="text-2xl font-bold text-center text-primary mt-6">
            Apakah Anda Yakin Ingin Membatalkan Pembayaran
          </h3>

          <button
            className="rounded-full sm:rounded-lg shadow-lg sm:text-xl mt-6 disabled:cursor-not-allowed! text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-4"
            onClick={() => setopenModalCancel(false)}
          >
            Oke, Mengerti
          </button>
        </div>
      </ModalTemplate> */}
    </div>
  );
}

export default Page;
