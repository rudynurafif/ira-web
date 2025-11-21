"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRIS from "./_components/Qris/QRIS";
import VA from "./_components/VA/VA";
import { convertToCurrency } from "@/app/_shared/utils";
import Outlet from "./_components/Outlet/Outlet";
import {
  EWalletPaymentData,
  QRISPaymentData,
  VAPaymentData,
} from "@/app/_shared/types/payment";
import {
  getEWalletById,
  getOTCById,
  getQRISById,
  getVaById,
} from "@/app/_api/Payment/Payment";
import toast from "react-hot-toast";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import Loader from "@/app/_components/Loader";
import EWallet from "./_components/EWallet/EWallet";

function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type")?.toLowerCase(); // 'va', 'qris', 'ewallet', 'otc'

  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<
    VAPaymentData | EWalletPaymentData | QRISPaymentData
  >();
  const id = params.get("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("paymentInfo");

      if (stored) {
        try {
          const parsed = JSON.parse(stored) as
            | VAPaymentData
            | EWalletPaymentData
            | QRISPaymentData;
          setPaymentInfo(parsed);
        } catch (e) {
          console.error("Gagal parse paymentInfo:", e);
          toast.error("Data pembayaran tidak valid.");
          router.replace("/payment");
        }
      } else {
        // Jika tidak ada di sessionStorage, redirect
        toast.error("Sesi pembayaran tidak ditemukan.");
        router.replace("/payment");
      }
    }

    setIsLoading(false);
  }, [router]);

  const bankFee =
    paymentInfo && "channel_payment_id" in paymentInfo
      ? parseInt((paymentInfo as any).channel_payment_id?.fee_flat ?? "0")
      : 0;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="">
      <div className="container mx-auto p-6 my-8">
        <div className="flex gap-2 items-center justify-center">
          <div className="font-bold text-primary-text md:text-3xl text-2xl">Pembayaran</div>
        </div>

        <div className="mt-5 bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)] rounded-xl p-6">
          <div className="grid grid-cols-2 gap-y-2 sm:text-base text-xs">
            <div>Deskripsi</div>
            <div className="text-right">
              {paymentInfo?.package_id.description}
            </div>

            <div>Subtotal</div>
            <div className="text-right">
              {convertToCurrency(paymentInfo?.package_id?.price)}
            </div>

            <div>Biaya Bank/Admin</div>
            <div className="text-right">{convertToCurrency(bankFee) || 0}</div>
          </div>

          <div className="border border-gray-border sm:my-5 my-3"></div>

          <div className="grid grid-cols-2 gap-y-2 text-sm items-center">
            <div className="text-base font-semibold sm:text-xl">
              Total Pembayaran
            </div>
            <div className="text-right text-primary font-bold text-lg sm:text-2xl">
              {convertToCurrency(parseInt(String(paymentInfo?.amount ?? "0")))}
            </div>
          </div>

          {params.get("type") &&
          params.get("type")?.toLowerCase() === "qris" ? (
            <QRIS />
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "va" ? (
            paymentInfo ? (
              <VA data={paymentInfo as VAPaymentData} />
            ) : null
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "otc" ? (
            <Outlet />
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "ewallet" ? (
            <EWallet data={paymentInfo as EWalletPaymentData} />
          ) : (
            ""
          )}

          <button
            type="button"
            onClick={() => router.push("/customer-area")}
            className="cursor-pointer sm:mt-10 mt-3 rounded-lg font-bold text-primary hover:text-dark-primary hover:underline-animation-activation w-full max-sm:text-sm py-3"
          >
            Kembali ke Area Pelanggan
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
