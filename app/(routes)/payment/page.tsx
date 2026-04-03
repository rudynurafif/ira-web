"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PackageData } from "@/app/_shared/types/customer-area";
import {
  checkPackage,
  getCustomerPackage,
  getPackageList,
} from "@/app/_api/Customer/CustomerArea";
import { convertToCurrency, toastErrorFromAPI } from "@/app/_shared/utils";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
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

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    selectedPackageFromSession,
  );
  const [latestPackage, setLatestPackage] =
    useState<SubscriptionHistoryAPI | null>(null);
  const [isLatestPackageFree, setIsLatestPackageFree] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [openModalNotAllowed, setOpenModalNotAllowed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const fetchPackages = async () => {
    try {
      const res = await getPackageList({});
      if (res?.data?.statusCode === 200) {
        setPackages(res.data?.data ?? []);
      }
    } catch (err: any) {
      const errorStatusCode =
        err?.response?.data?.statusCode || "(status code)";
      setErrorStatus(errorStatusCode);

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

          const isFree = latest?.package_id.package_type === "free";

          setIsLatestPackageFree(isFree);

          if (!isFree) {
            // Kita tetap set latestPackage untuk display info saja, tapi JANGAN setSelectedPackage di sini
          }
        }
      } catch (err) {
        toastErrorFromAPI(err);
      }
    };

    fetchLatestPackage();
  }, []);

  useEffect(() => {
    if (packages.length > 0) {
      const firstPkg = packages[0];
      setSelectedPackage(firstPkg);
      sessionStorage.setItem("selectedPackage", JSON.stringify(firstPkg));
    }
  }, [packages]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSelect = (pkg: PackageData) => {
    sessionStorage.setItem("selectedPackage", JSON.stringify(pkg));
    setSelectedPackage(pkg);
  };

  const handleCheckPackage: () => Promise<void> = async () => {
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

  if (error && errorStatus !== 404 && errorStatus !== 401)
    return <ErrorFallback message={error} onRetry={fetchPackages} />;

  return (
    <div className="container flex flex-col justify-between max-sm:min-h-[80vh] mx-auto sm:my-8 max-sm:px-4 max-sm:py-6">
      <div>
        <div className="flex gap-2 items-center justify-center mb-6">
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
                  selected={
                    selectedPackage?.id === latestPackage?.package_id?.id
                  }
                  onSelect={
                    packages.some((p) => p.id === latestPackage.package_id.id)
                      ? handleSelect
                      : () => {}
                  }
                  convertToCurrency={convertToCurrency}
                />
              </div>

              <div className="border border-gray-border my-6"></div>
            </>
          )}

          <h2
            className="sm:text-2xl text-lg text-primary-text font-bold mb-3"
            suppressHydrationWarning
          >
            <span>
              {isLatestPackageFree
                ? "Daftar Paket"
                : "Pilih Paket Internet Untuk Perpanjang"}
            </span>
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
              <div>
                {error || "Belum ada Daftar Paket yang tersedia untuk Anda"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="">
        <button
          className="rounded-full sm:rounded-lg shadow-lg sm:text-xl mt-6 disabled:cursor-not-allowed! disabled:bg-slate-400 text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-4"
          onClick={handleCheckPackage}
          disabled={!selectedPackage}
        >
          Pilih Metode Pembayaran
        </button>
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
            </div>

            <button
              className="rounded-full sm:rounded-lg shadow-lg sm:text-xl mt-6 disabled:cursor-not-allowed! text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-4"
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
