"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PackageData } from "@/app/_shared/types/customer-area";
import { getPackageList } from "@/app/_api/Customer/CustomerArea";
import { convertToCurrency, toastErrorFromAPI } from "@/app/_shared/utils";
import ccSvg from "@/public/assets/Icons/payment-method/credit-card-svg.svg";
import { PaymentChannel } from "@/app/_shared/types/payment";
import {
  createPaymentRequestEWallet,
  createPaymentRequestOTC,
  createPaymentRequestQRIS,
  createPaymentRequestVA,
} from "@/app/_api/Payment/Payment";
import { IoIosArrowForward } from "react-icons/io";
import Loader from "@/app/_components/Loader";
import ErrorFallback from "@/app/_components/ErrorFallback";
import { PAYMENT_LOGOS } from "@/app/_shared/data/payment";

const Payment = () => {
  const router = useRouter();
  const selectedPackageFromLS = (() => {
    if (typeof window === "undefined") return null;
    const item = sessionStorage.getItem("selectedPackage");
    if (!item) return null;
    try {
      return JSON.parse(item) as PackageData;
    } catch {
      return null;
    }
  })();
  const selectedChannelFromLS = (() => {
    if (typeof window === "undefined") return null;
    const item = sessionStorage.getItem("selectedPaymentMethod");
    if (!item) return null;
    try {
      return JSON.parse(item) as PaymentChannel;
    } catch {
      return null;
    }
  })();

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    selectedPackageFromLS
  );
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(
    selectedChannelFromLS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      const res = await getPackageList({});
      if (res?.data?.statusCode === 200) {
        setPackages(res.data?.data);
      }
    } catch (error: any) {
      const errorStatusCode =
        error?.response?.data?.statusCode || "(status code)";
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Terdapat kesalahan saat memuat daftar paket";

      toastErrorFromAPI(error);

      setError(`Error ${errorStatusCode}: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSelect = (pkg: PackageData) => {
    sessionStorage.setItem("selectedPackage", JSON.stringify(pkg));
    setSelectedPackage(pkg);
  };

  const handleCreatePayment = async () => {
    if (!selectedChannel) return;

    try {
      let createRes;

      const payload = {
        package_id: selectedPackage?.id,
        payment_channel_id: selectedChannel?.id,
      };

      switch (selectedChannel.category) {
        case "va":
          createRes = createPaymentRequestVA(payload);
          break;
        case "qris":
          createRes = createPaymentRequestQRIS(payload);
          break;
        case "ewallet":
          createRes = createPaymentRequestEWallet(payload);
          break;
        case "otc":
          createRes = createPaymentRequestOTC(payload);
          break;
        case "card":
          toast.error(
            `Metode ${selectedChannel.category} belum tersedia. Gunakan Virtual Account atau QRIS untuk sekarang.`
          );
          return;
        default:
          throw new Error("Metode Pembayaran Tidak Didukung");
      }

      const paymentReqID = (await createRes)?.data?.data?.id;
      sessionStorage.setItem(
        "paymentInfo",
        JSON.stringify((await createRes).data.data)
      );

      if (!paymentReqID) {
        throw new Error("Gagal mendapatkan ID pembayaran");
      }

      router.push(
        `/payment/checkout-payment?id=${paymentReqID}&type=${selectedChannel?.category}&selected_payment=${selectedChannel?.code}`
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat memproses pembayaran"
      );
    }
  };

  if (isLoading) return <Loader />;

  if (error) return <ErrorFallback message={error} onRetry={fetchPackages} />;

  return (
    <div className="container mx-auto my-8 p-6">
      <div className="flex gap-2 items-center justify-center">
        <div className="font-bold text-primary-text text-3xl">
          Perpanjang Paket
        </div>
      </div>
      <div className="p-6 shadow-lg my-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-3">Pilih Paket</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages ? (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-background-customer rounded-xl shadow-lg p-6 cursor-pointer transition ${
                  selectedPackage?.id === pkg.id
                    ? "border border-primary"
                    : "hover:shadow-2xl"
                }`}
                onClick={() => handleSelect(pkg)}
              >
                <h3 className="text-xl font-bold text-dark-primary mb-2">
                  {pkg.name ?? "-"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {pkg.description ?? "-"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {convertToCurrency(pkg.price ?? 0)}
                  </span>
                  <span className="text-sm">
                    / berlaku {pkg.duration ?? "0"} Hari
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Speed Up to {pkg.speed_mbps} Mbps • Kuota{" "}
                  {parseInt(pkg.quota_mb ?? 0) / 1024} GB
                </div>

                {pkg.remarks && (
                  <div className="text-xs text-green-600 mb-4">
                    {pkg.remarks ?? "-"}
                  </div>
                )}

                <button
                  className={`w-full cursor-pointer py-2 rounded-lg font-semibold transition ${
                    selectedPackage?.id === pkg.id
                      ? "bg-primary text-white"
                      : "bg-white border border-primary text-gray-700 hover:bg-primary hover:text-white"
                  }`}
                >
                  {selectedPackage?.id === pkg.id ? "Terpilih" : "Pilih Paket"}
                </button>
              </div>
            ))
          ) : (
            <div>Belum ada Daftar Paket yang tersedia untuk Anda</div>
          )}
        </div>

        <div className="border border-gray-border my-5"></div>

        <div className="mb-8">
          <div className="flex max-md:flex-col max-md:gap-3 justify-between mb-3">
            <h2 className="font-bold text-2xl ">Metode Pembayaran</h2>
          </div>

          <div className="flex mt-6 justify-between border border-gray-border gap-4 rounded-lg p-4 items-center">
            <div className="flex items-center gap-8">
              {selectedChannel ? (
                <Image
                  src={PAYMENT_LOGOS[selectedChannel.code] || ccSvg}
                  width={100}
                  height={100}
                  alt={selectedChannel.name}
                  className="object-contain"
                />
              ) : (
                <Image
                  src={ccSvg}
                  width={80}
                  height={80}
                  alt="Metode pembayaran"
                />
              )}

              <div className="sm:text-lg text-sm font-semibold">
                {selectedChannel?.name ??
                  "*Pilih metode pembayaran terlebih dahulu"}
              </div>
            </div>

            <button
              className="rounded-lg flex gap-1 items-center text-dark-primary-2 font-bold cursor-pointer"
              onClick={() => router.push("/payment/payment-methods")}
            >
              <p className="hidden md:block">
                {selectedChannel
                  ? "Ganti Metode Pembayaran"
                  : "Pilih Metode Pembayaran"}
              </p>

              <IoIosArrowForward
                size={18}
                className="text-dark-primary-2 font-bold"
              />
            </button>
          </div>
        </div>

        <div>
          <button
            className="rounded-lg text-2xl mt-6 disabled:cursor-not-allowed disabled:bg-slate-400 text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-3"
            onClick={handleCreatePayment}
            disabled={!selectedPackage || !selectedChannel}
          >
            Bayar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
