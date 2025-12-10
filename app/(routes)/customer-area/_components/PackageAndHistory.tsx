"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
import { useRouter, useSearchParams } from "next/navigation";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import { useAppSelector } from "@/app/store/store";
import bannerPanduan from "@/public/assets/Images/bannerPanduan.png";
import bannerPanduanMobile from "@/public/assets/Images/bannerPanduanMobile.png";
import bannerCS from "@/public/assets/Images/bannerCS.png";
import bannerCSMobile from "@/public/assets/Images/bannerCSmobile.png";
import ActivePackageCard from "./ActivePackageCard";
import SubsHistoryCard from "./SubsHistoryCard";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import { convertToCurrency, toastErrorFromAPI } from "@/app/_shared/utils";
import empty from "@/public/assets/Images/Empty.svg";
import toast from "react-hot-toast";
import DatePickerFilter from "@/app/_components/form/DatePickerFilter";
import HistorySection from "./HistorySection";

const PAGE_SIZE = 5;

const PackageAndHistory = () => {
  const [activePacketData, setActivePacketData] =
    useState<SubscriptionHistoryAPI | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistoryAPI[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const searchParams = useSearchParams();

  const { userInfo } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const phoneCS = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";

  const [startDateFilter, setStartDateFilter] = useState<any>();
  const [endDateFilter, setEndDateFilter] = useState<any>();

  // Fetch paket aktif (hanya sekali, tidak dipengaruhi pagination)
  useEffect(() => {
    const fetchActivePackage = async () => {
      try {
        const res = await getCustomerPackage({
          page: 1,
          pageSize: 1,
        });
        const data = res.data?.data || [];
        if (data[0]) {
          const isActive = data[0].start_date && data[0].end_date;
          setActivePacketData(isActive ? data[0] : null);
        }
      } catch (err) {
        toastErrorFromAPI(err);
      }
    };

    fetchActivePackage();
  }, []);

  // Fetch riwayat dengan pagination
  const fetchHistory = async (page: number) => {
    setIsLoadingHistory(true);
    try {
      const res = await getCustomerPackage({
        page,
        pageSize: PAGE_SIZE,
      });

      const data = res.data?.data || [];
      const total = res.data?.total || 0;
      const pages = Math.ceil(total / PAGE_SIZE);

      setSubscriptionHistory(data);
      setTotalPages(pages);
    } catch (err: any) {
      toastErrorFromAPI(err);
      setSubscriptionHistory([]);
      setTotalPages(1);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const isFetching = !userInfo;
  if (isFetching) return <SkeletonLoadingCard />;

  return (
    <>
      {/* MOBILE (< sm) */}
      <div className="sm:hidden space-y-6">
        {activePacketData && <ActivePackageCard data={activePacketData} />}

        <Image
          src={bannerCSMobile}
          alt="banner CS"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
        />

        <Image
          src={bannerPanduanMobile}
          alt="Banner Panduan"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open("/pandaan-cara-bayar", "_blank")}
        />

        <HistorySection />
      </div>

      {/* DESKTOP (≥ sm) */}
      <div className="hidden sm:grid grid-cols-12 gap-6">
        <div className="lg:col-span-5 col-span-12 space-y-5">
          {activePacketData && <ActivePackageCard data={activePacketData} />}
          <Image
            src={bannerCS}
            alt="banner CS"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
          />
        </div>

        <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
          {/* Paket terakhir dibeli */}
          {activePacketData && (
            <div className="hidden xl:block">
              <div className="text-xl font-bold">Paket Terakhir Dibeli</div>
              <div className="hidden lg:flex justify-between items-center gap-4">
                <Image
                  src="/assets/Images/gambar-latest.png"
                  alt="gambar-latest"
                  width={157}
                  height={171}
                  unoptimized
                />

                {/* Kode Kartu Paket Di Sini */}
                <div className="bg-white rounded-lg shadow-lg p-0.5 w-full">
                  {/* Header Merah */}
                  <div
                    className="bg-linear-to-r text-white text-center py-2 rounded-t-lg font-bold text-sm"
                    style={{
                      background: "linear-gradient(to right, #520201, #9C1816)",
                    }}
                  >
                    {activePacketData.package_id.name ||
                      "Paket Internet Rakyat"}
                  </div>

                  {/* Body: Speed & Price */}
                  <div className="flex justify-between">
                    <div className="flex flex-col justify-between items-center py-3 px-2">
                      <div className="text-xs ">Internet sampai dengan</div>
                      <div className="text-2xl font-extrabold text-gradient-red">
                        {activePacketData.package_id.speed_mbps || "Speed"}{" "}
                        <span className="text-base">Mbps</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-center py-3 px-2">
                      <div className="text-xs ">Harga</div>
                      <div className="text-2xl font-extrabold text-gradient-red">
                        <span className="text-base font-semibold align-top">
                          Rp{" "}
                        </span>
                        {activePacketData
                          ? activePacketData.package_id.price
                              .toLocaleString("id-ID")
                              .replace(/,/g, ".")
                          : "0"}
                      </div>
                    </div>
                  </div>

                  {/* Fitur */}
                  <div className="flex justify-between items-center bg-background-customer rounded-b-lg py-2 px-3">
                    <div className="flex items-center gap-1 text-xs  font-medium">
                      <Image
                        src="/assets/Icons/icon-checklist.svg"
                        alt="ico-checklist"
                        width={18}
                        height={18}
                      />
                      <p className="font-bold">
                        <span className="text-gradient-red">GRATIS</span> SEWA
                        MODEM
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs  font-medium">
                      <Image
                        src="/assets/Icons/icon-checklist.svg"
                        alt="ico-checklist"
                        width={18}
                        height={18}
                      />
                      <p className="font-bold">
                        <span className="text-gradient-red">UNLIMITED</span>{" "}
                        DATA
                      </p>
                    </div>
                  </div>
                </div>

                <Image
                  src="/assets/Images/button-beli-lagi-home.png"
                  alt="button-beli-lagi-home"
                  width={157}
                  height={171}
                  // ambil latest paket dari activePacketData
                  onClick={() => {
                    sessionStorage.setItem(
                      "selectedPackage",
                      JSON.stringify(activePacketData.package_id)
                    );
                    router.push("payment/payment-methods");
                  }}
                  className="cursor-pointer hover:scale-110 transition-transform"
                />
              </div>
            </div>
          )}

          <Image
            src={bannerPanduan}
            alt="Banner Panduan"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("/panduan-cara-bayar", "_blank")}
          />

          <HistorySection />
        </div>
      </div>
    </>
  );
};

export default PackageAndHistory;
