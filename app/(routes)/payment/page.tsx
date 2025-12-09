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
import petir from "@/public/assets/Icons/petir.svg";
import BannerLatest from "./_components/BannerLatest";

function PackageCardMobile({
  pkg,
  selected,
  onSelect,
  convertToCurrency,
}: {
  pkg: PackageData;
  selected: boolean;
  onSelect: (p: PackageData) => void;
  convertToCurrency: (v: number) => string;
}) {
  const isUnlimited = !pkg.quota_mb || Number(pkg.quota_mb) === 0;

  return (
    <div
      onClick={() => onSelect(pkg)}
      className={[
        "rounded-xl border bg-[url('/assets/Images/packageBackground.svg')] bg-cover bg-center cursor-pointer transition px-4 pt-3 pb-4",
        selected
          ? "border-[#D7201D] ring-1 ring-[#D7201D]/30 shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
          : "border-gray-200 active:scale-[0.99]",
      ].join(" ")}
    >
      {/* judul */}
      <div className="flex items-center gap-1">
        <span className="text-base">
          <Image src={petir} alt="icon" />
        </span>
        <h3 className="text-base sm:text-xl font-semibold text-secondary">
          {pkg.name ?? "-"}
        </h3>
      </div>

      {/* body */}
      <div className="mt-2 ">
        {/* speed block */}
        <div className="w-full rounded-md overflow-hidden">
          <div className="flex items-start justify-between w-full relative text-dark-primary-2 whitespace-nowrap">
            <div className="flex gap-2">
              <div className="text-xs sm:text-sm">Up to</div>
              <div className="flex pt-2 gap-1">
                <div className="text-3xl sm:text-4xl leading-none font-extrabold tracking-tight">
                  {pkg.speed_mbps}
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-xs sm:text-sm font-semibold">Mbps</div>
                  <div className="text-[10px] sm:text-xs">Unlimited Kuota</div>
                </div>
              </div>
            </div>

            {/* badge harga */}
            <div className="shrink-0 ml-2">
              <span className="inline-flex flex-col sm:flex-row max-w-[400px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm text-black whitespace-nowrap">
                <p className="max-sm:font-bold font-semibold">
                  {convertToCurrency(pkg.price ?? 0)}
                </p>
                <p className="font-semibold">/{pkg.duration ?? 0} Hari</p>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* remarks optional */}
      {pkg.remarks ? (
        <div className="mt-2 text-[10px] sm:text-xs text-dark-primary">
          {pkg.remarks}
        </div>
      ) : null}
    </div>
  );
}

const Payment = () => {
  const router = useRouter();
  const selectedPackageFromSession = (() => {
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
    selectedPackageFromSession
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
    } catch (err: any) {
      const errorStatusCode =
        err?.response?.data?.statusCode || "(status code)";

      toastErrorFromAPI(err);

      if (errorStatusCode === 404) {
        setError(err?.response?.data?.message || "Data paket tidak ditemukan.");
        return;
      }

      if (errorStatusCode === 401) {
        setError(`Silahkan login terlebih dahulu untuk melanjutkan.`);
      }
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
      toastErrorFromAPI(error, "Terjadi kesalahan saat memproses pembayaran");
    }
  };

  if (isLoading) return <Loader />;

  if (error) return <ErrorFallback message={error} onRetry={fetchPackages} />;

  return (
    <div className="container mx-auto my-8 max-md:p-4">
      <div className="flex gap-2 items-center justify-center mb-7">
        <div className="font-bold text-primary-text text-3xl">
          Perpanjang Paket
        </div>
      </div>

      {/* Banner Goes Here */}
      <BannerLatest />

      <div className="sm:p-6 sm:shadow-lg my-8 rounded-lg">
        <h2 className="sm:text-2xl text-lg text-primary-text font-bold mb-3">
          Pilih Paket
        </h2>

        <div className="md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-sm:space-y-6">
          {packages && packages.length ? (
            packages.map((pkg) => (
              <PackageCardMobile
                key={pkg.id}
                pkg={pkg}
                selected={selectedPackage?.id === pkg.id}
                onSelect={handleSelect}
                convertToCurrency={convertToCurrency}
              />
            ))
          ) : (
            <div>Belum ada Daftar Paket yang tersedia untuk Anda</div>
          )}
        </div>

        <div className="border border-gray-border my-6"></div>

        <div className="mb-8">
          <div className="flex max-md:flex-col max-md:gap-3 justify-between mb-3">
            <h2 className="font-bold sm:text-2xl text-lg text-primary-text">
              Metode Pembayaran
            </h2>
          </div>

          <div
            className="flex cursor-pointer mt-6 justify-between border border-gray-border shadow-md gap-4 rounded-lg p-4 items-center"
            onClick={() => router.push("/payment/payment-methods")}
          >
            <div className="flex items-center gap-4 md:gap-8">
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
            className="rounded-lg shadow-lg sm:text-2xl mt-6 disabled:cursor-not-allowed disabled:bg-slate-400 text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-3"
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
