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
import bannerCubmu from "@/public/assets/Images/banner-cubmu.png";
import bannerCubmuMobile from "@/public/assets/Images/banner-cubmu-mobile.png";
import ActivePackageCard from "./ActivePackageCard";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import {
  formattedDate,
  packageCountdown,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import HistorySection from "./HistorySection";
import thumbClick from "@/public/assets/Icons/thumb-click.png";
import ExpiredCard from "../ExpiredCard";
import InactiveCard from "../InactiveCard";
import { getAddOn } from "@/app/_api/AddOn/AddOn";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

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
  const { label, status, days } = packageCountdown(
    activePacketData?.end_date ?? null
  );
  const [isInactive, setIsInactive] = useState<boolean | null>(null);

  const { userInfo, is_coverage } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const phoneCS = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";
  const [addOns, setAddOns] = useState([]);

  const [startDateFilter, setStartDateFilter] = useState<any>();
  const [endDateFilter, setEndDateFilter] = useState<any>();

  useEffect(() => {
    const fetchAddon = async () => {
      try {
        const resAddon = await getAddOn({});
        setAddOns(resAddon.data.result || []);
      } catch (err) {
        toastErrorFromAPI(err);
      } finally {
      }
    };

    fetchAddon();
  }, []);

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

    if (userInfo?.is_active || userInfo?.status === "active")
      fetchActivePackage();
  }, [userInfo?.is_active, userInfo?.status]);

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
    if (userInfo) setIsInactive(userInfo?.status === "inactive");
    fetchHistory(1);
  }, [isInactive, userInfo, userInfo?.status]);

  const isFetching = !userInfo;
  if (isFetching) return <SkeletonLoadingCard />;

  // Komponen Paket Terakhir Dibeli
  const LatestPackage = () => {
    return (
      <div className="">
        <div className="text-xl font-bold mb-5">Paket Terakhir Dibeli</div>
        <div className="flex justify-between items-center gap-2">
          <Image
            src="/assets/Images/gambar-latest.png"
            alt="gambar-latest"
            width={140}
            height={152}
            // unoptimized
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
              {activePacketData?.package_id?.name || "Paket Internet Rakyat"}
            </div>

            {/* Body: Speed & Price */}
            <div className="flex flex-col [@media(max-width:480px)]:flex-col [@media(min-width:481px)]:flex-row justify-evenly">
              <div className="flex flex-col justify-between items-center py-3 px-2">
                <div className="text-xs text-center">
                  Internet sampai dengan
                </div>
                <div className="text-2xl font-extrabold text-gradient-red">
                  {activePacketData?.package_id?.speed_mbps || "Speed"}{" "}
                  <span className="sm:text-base text-xs">Mbps</span>
                </div>
              </div>

              <div className="flex flex-col justify-between items-center py-3 px-2">
                <div className="text-xs ">Harga</div>
                <div className="sm:text-2xl font-extrabold text-gradient-red">
                  <span className="sm:text-base text-xs font-semibold align-top">
                    Rp{" "}
                  </span>
                  {activePacketData
                    ? activePacketData.package_id?.price
                        .toLocaleString("id-ID")
                        .replace(/,/g, ".")
                    : "0"}
                </div>
              </div>
            </div>

            {/* Fitur */}
            <div className="flex flex-col sm:flex-row gap-2 justify-evenly items-start sm:items-center bg-background-customer rounded-b-lg py-2 px-3">
              <div className="flex items-center gap-1 text-xs  font-medium">
                <Image
                  src="/assets/Icons/icon-checklist.svg"
                  alt="ico-checklist"
                  width={18}
                  height={18}
                />
                <p className="font-bold">
                  <span className="text-gradient-red">GRATIS</span> SEWA MODEM
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
                  <span className="text-gradient-red">UNLIMITED</span> DATA
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-w-[100px] cursor-pointer hidden sm:block hover:scale-110 transition-transform">
            <Image
              src="/assets/Images/button-beli-lagi-home.png"
              alt="button-beli-lagi-home"
              width={100}
              height={152}
              onClick={() => {
                sessionStorage.setItem(
                  "selectedPackage",
                  JSON.stringify(activePacketData?.package_id)
                );
                router.push("payment/payment-methods");
              }}
              className="relative z-10"
              style={{
                filter: "drop-shadow(0 0 12px rgba(255, 0, 0, 0.6))",
              }}
            />
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div
                className="absolute top-0 h-full"
                style={{
                  width: "100px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  transform: "skew(-20deg)",
                  animation: "sweep-narrow 2.5s infinite ease-out",
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative w-full h-[60px] my-3 sm:hidden">
          <button
            className="relative w-full z-10 cursor-pointer border-white border-3 rounded-xl px-6 py-3 bg-gradient-red-light text-white font-bold text-lg flex justify-center items-center gap-2"
            style={{
              filter: "drop-shadow(0 0 12px rgba(255, 0, 0, 0.6))",
            }}
            onClick={() => {
              sessionStorage.setItem(
                "selectedPackage",
                JSON.stringify(activePacketData?.package_id)
              );
              router.push("payment/payment-methods");
            }}
          >
            Beli Lagi
            <Image
              src={thumbClick}
              alt="button-beli-lagi-home-mobile"
              width={24}
              height={24}
              // unoptimized
            />
          </button>

          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            <div
              className="absolute top-0 h-full"
              style={{
                width: "120px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                transform: "skew(-20deg)",
                animation: "sweep-mobile 3s infinite ease-out",
                left: "-120px",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* MOBILE (< sm) */}
      <div className="sm:hidden space-y-6">
        {activePacketData && isInactive ? (
          <InactiveCard data={activePacketData} />
        ) : userInfo.status === "dismantled" ||
          userInfo.status === "suspend" ? (
          <ExpiredCard data={activePacketData} isDismantled={true} />
        ) : status === "expired" ? (
          <ExpiredCard data={activePacketData} />
        ) : activePacketData ? (
          <ActivePackageCard data={activePacketData} />
        ) : null}

        {/* Banner Cubmu */}
        {addOns.length > 0 && (
          <div className="relative w-full">
            <Carousel
              autoPlay
              interval={5000}
              infiniteLoop
              showThumbs={false}
              showStatus={false}
              showIndicators={addOns.length > 1}
              swipeable={true}
              emulateTouch={true}
              stopOnHover={true}
              onChange={(index) => {
                // opsional: logika saat slide berubah
              }}
            >
              {addOns.map((addon: any, idx: number) => {
                // Asumsi addon memiliki field: banner_url (string) dan slug (string)
                const bannerUrl = addon.banner_url || bannerCubmuMobile;
                const link = `/add-on/${addon.id}`;

                return (
                  <div
                    key={idx}
                    onClick={() => window.open(link, "_blank")}
                    className="cursor-pointer"
                  >
                    <Image
                      src={bannerUrl}
                      alt={`Banner ${addon.name || "Add-on"}`}
                      width={800} // sesuaikan dengan ukuran asli banner
                      height={400} // penting untuk Next.js Image
                      className="w-full object-cover drop-shadow-lg hover:scale-[1.02] transition-transform"
                      priority={idx === 0} // preload slide pertama
                    />
                  </div>
                );
              })}
            </Carousel>
          </div>
        )}

        <Image
          src={bannerCSMobile}
          alt="banner CS"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
        />

        {activePacketData?.package_id && <LatestPackage />}

        <Image
          src={bannerPanduanMobile}
          alt="Banner Panduan"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open("/panduan-cara-bayar", "_blank")}
        />

        {is_coverage && userInfo.is_active && userInfo.status === "active" && (
          <HistorySection />
        )}
      </div>

      {/* DESKTOP (≥ sm) */}
      <div className="hidden sm:grid grid-cols-12 gap-6">
        <div className="lg:col-span-5 col-span-12 space-y-5">
          {activePacketData && isInactive ? (
            <InactiveCard data={activePacketData} />
          ) : userInfo.status === "dismantled" ||
            userInfo.status === "suspend" ? (
            <ExpiredCard data={activePacketData} isDismantled={true} />
          ) : status === "expired" ? (
            <ExpiredCard data={activePacketData} />
          ) : activePacketData ? (
            <ActivePackageCard data={activePacketData} />
          ) : null}

          {addOns.length > 0 && (
            <div className="relative w-full">
              <Carousel
                autoPlay
                interval={5000}
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                showIndicators={addOns.length > 1}
                swipeable={true}
                emulateTouch={true}
                stopOnHover={true}
                onChange={(index) => {
                  // opsional: logika saat slide berubah
                }}
              >
                {addOns.map((addon: any, idx: number) => {
                  // Asumsi addon memiliki field: banner_url (string) dan slug (string)
                  const bannerUrl = addon.banner_url || bannerCubmu;
                  const link = `/add-on/${addon.id}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => window.open(link, "_blank")}
                      className="cursor-pointer"
                    >
                      <Image
                        src={bannerUrl}
                        alt={`Banner ${addon.name || "Add-on"}`}
                        width={800} // sesuaikan dengan ukuran asli banner
                        height={400} // penting untuk Next.js Image
                        className="w-full object-cover drop-shadow-lg hover:scale-[1.02] transition-transform"
                        priority={idx === 0} // preload slide pertama
                      />
                    </div>
                  );
                })}
              </Carousel>
            </div>
          )}

          <Image
            src={bannerCS}
            alt="banner CS"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
          />
        </div>

        <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
          {/* Paket terakhir dibeli */}
          {activePacketData?.package_id && <LatestPackage />}

          <Image
            src={bannerPanduan}
            alt="Banner Panduan"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("/panduan-cara-bayar", "_blank")}
          />

          {is_coverage &&
            userInfo.is_active &&
            userInfo.status === "active" && <HistorySection />}
        </div>
      </div>
    </>
  );
};

export default PackageAndHistory;
