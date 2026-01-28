"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PackageData } from "@/app/_shared/types/customer-area";
import {
  checkPackage,
  getCustomerPackage,
  getPackageList,
} from "@/app/_api/Customer/CustomerArea";
import { convertToCurrency, toastErrorFromAPI } from "@/app/_shared/utils";
import {
  PaymentChannel,
  SubscriptionHistoryAPI,
} from "@/app/_shared/types/payment";
import {
  createPaymentRequestEWallet,
  createPaymentRequestOTC,
  createPaymentRequestQRIS,
  createPaymentRequestVA,
} from "@/app/_api/Payment/Payment";
import Loader from "@/app/_components/Loader";
import ErrorFallback from "@/app/_components/ErrorFallback";
import bannerPerpanjang from "@/public/assets/Images/banner-perpanjang-paket.png";
import bannerPerpanjangMobile from "@/public/assets/Images/banner-perpanjangan-paket-mobile.png";
import PackageCardMobile from "./_components/PackageCardMobile";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import limitImage from "@/public/assets/Images/limit-images.png";

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
    selectedPackageFromSession,
  );
  const [latestPackage, setLatestPackage] =
    useState<SubscriptionHistoryAPI | null>(null);
  const [isLatestPackageFree, setIsLatestPackageFree] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [openModalNotAllowed, setOpenModalNotAllowed] = useState(false);

  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(
    selectedChannelFromLS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      const res = await getPackageList({});
      if (res?.data?.statusCode === 200) {
        setPackages(res.data?.data ?? []);
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
    const fetchLatestPackage = async () => {
      try {
        const res = await getCustomerPackage({
          page: 1,
          pageSize: 1,
        });

        const data = res.data?.data || [];
        if (!data[0]) return;

        const latest = data[0];
        const isActive = latest.start_date && latest.end_date;

        if (isActive) {
          setLatestPackage(latest);

          // ✅ Cek apakah nama paket mengandung kata "free", "demo", atau "gratis"
          const packageName = latest.package_id?.name || "";
          const normalized = packageName.toLowerCase();
          const isFree =
            normalized.includes("free") ||
            normalized.includes("demo") ||
            normalized.includes("gratis");

          setIsLatestPackageFree(isFree);

          if (!isFree) {
            setSelectedPackage(latest.package_id);
            sessionStorage.setItem(
              "selectedPackage",
              JSON.stringify(latest.package_id),
            );
          }
        }
      } catch (err) {
        toastErrorFromAPI(err);
      }
    };

    fetchLatestPackage();
  }, []);

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
            `Metode ${selectedChannel.category} belum tersedia. Gunakan Virtual Account atau QRIS untuk sekarang.`,
          );
          return;
        default:
          throw new Error("Metode Pembayaran Tidak Didukung");
      }

      const paymentReqID = (await createRes)?.data?.data?.id;
      sessionStorage.setItem(
        "paymentInfo",
        JSON.stringify((await createRes).data.data),
      );

      if (!paymentReqID) {
        throw new Error("Gagal mendapatkan ID pembayaran");
      }

      router.push(
        `/payment/checkout-payment?id=${paymentReqID}&type=${selectedChannel?.category}&selected_payment=${selectedChannel?.code}`,
      );
    } catch (error: any) {
      toastErrorFromAPI(error, "Terjadi kesalahan saat memproses pembayaran");
    }
  };

  const handleCheckPackage: () => Promise<void> = async () => {
    // router.push("/payment/payment-methods");

    try {
      const res = await checkPackage();

      if (res?.data?.data === true) {
        setIsAllowed(true);
        router.push("/payment/payment-methods");
      } else {
        setOpenModalNotAllowed(true);
        return;
      }
    } catch (err) {
      toastErrorFromAPI(err);
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

      {/* <BannerLatest /> */}
      <Image
        src={bannerPerpanjang}
        alt="banner-perpanjang-paket"
        className="lg:block hidden w-full drop-shadow-xl mb-8"
      />
      <Image
        src={bannerPerpanjangMobile}
        alt="banner-perpanjang-paket"
        className="lg:hidden block w-full drop-shadow-xl mb-8"
      />

      <div className="sm:p-6 sm:shadow-lg my-8 rounded-lg">
        {latestPackage && !isLatestPackageFree && (
          <>
            <h2 className="sm:text-2xl text-lg text-primary-text font-bold mb-3">
              Paket yang terakhir dibeli
            </h2>

            <div className="md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-sm:space-y-6">
              <PackageCardMobile
                pkg={latestPackage.package_id}
                selected={selectedPackage?.id === latestPackage?.package_id?.id}
                onSelect={handleSelect}
                convertToCurrency={convertToCurrency}
              />
            </div>

            <div className="border border-gray-border my-6"></div>
          </>
        )}

        <h2 className="sm:text-2xl text-lg text-primary-text font-bold mb-3">
          {isLatestPackageFree ? "Daftar Paket" : "Paket Lainnya"}
        </h2>

        <div className="md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-sm:space-y-6">
          {packages && packages?.length ? (
            packages.map((pkg) => (
              <PackageCardMobile
                key={pkg.id}
                pkg={pkg}
                selected={selectedPackage?.id === pkg?.id}
                onSelect={handleSelect}
                convertToCurrency={convertToCurrency}
              />
            ))
          ) : (
            <div>Belum ada Daftar Paket yang tersedia untuk Anda</div>
          )}
        </div>

        {/* <div className="my-8">
          <div
            className="flex cursor-pointer mt-6 justify-between border border-gray-border shadow-md gap-4 rounded-lg p-4 items-center"
            onClick={() => router.push("/payment/payment-methods")}
          >
            <div className="flex items-center gap-4 md:gap-8">
              {selectedChannel ? (
                <Image
                  src={PAYMENT_LOGOS[selectedChannel.code] || ccSvg}
                  alt={selectedChannel.name}
                  className="w-full object-contain"
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
        </div> */}

        <div className="mt-6">
          <button
            className="rounded-full sm:rounded-lg shadow-lg sm:text-xl mt-6 disabled:cursor-not-allowed disabled:bg-slate-400 text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-4"
            // onClick={handleCreatePayment}
            onClick={handleCheckPackage}
            disabled={!selectedPackage}
          >
            Pilih Metode Pembayaran
          </button>
        </div>
      </div>

      {openModalNotAllowed && (
        <ModalTemplate
          closeModal={() => {
            setOpenModalNotAllowed(false);
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
              Paket Anda Masih Aktif
            </h3>

            <div className="mt-4">
              <p className="text-center">
                Anda tidak dapat membeli paket selama paket masih aktif
              </p>
              {/* <p className="text-black ">
                Kamu hanya bisa memiliki dua paket kuota internet, ya!
              </p>
              <ol className="mt-3 font-bold text-left list-decimal pl-5 space-y-1 text-black">
                <li>Paket aktif yang sedang digunakan.</li>
                <li>Paket tambahan yang baru saja dibeli.</li>
              </ol>
              <p className="mt-4 text-black">
                Anda tidak dapat membeli paket kuota ketiga selama paket aktif
                dan tambahan masih aktif.
              </p> */}
            </div>

            <button
              className="rounded-full sm:rounded-lg shadow-lg sm:text-xl mt-6 disabled:cursor-not-allowed text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-4"
              onClick={() => setOpenModalNotAllowed(false)}
              disabled={!selectedPackage}
            >
              Oke, Mengerti
            </button>
          </div>
        </ModalTemplate>
      )}
    </div>
  );
};

export default Payment;
