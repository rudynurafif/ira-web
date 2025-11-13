"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getSubscriptionHistory } from "@/app/_api/Customer/CustomerArea";
import { useRouter } from "next/navigation";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import { useAppSelector } from "@/app/store/store";
import bannerPanduan from "@/public/assets/Images/bannerPanduan.svg";
import bannerCS from "@/public/assets/Images/bannerCS.svg";
import ActivePackageCard from "./ActivePackageCard";
import SubsHistoryCard from "./SubsHistoryCard";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import empty from "@/public/assets/Images/Empty.svg";
import Link from "next/link";

const ActivePacket = () => {
  const [activePacketData, setActivePacketData] =
    useState<SubscriptionHistoryAPI>();
  const [subscriptionHistory, setSubscriptionHistory] =
    useState<SubscriptionHistoryAPI[]>();
  const { userInfo } = useAppSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSubHistory = await getSubscriptionHistory({});
        setSubscriptionHistory(resSubHistory.data?.data);
        setActivePacketData(resSubHistory.data?.data?.[0]);
      } catch (err: any) {
        toastErrorFromAPI(err);
      }
    };
    fetchData();
  }, []);

  const isFetching = !activePacketData && !userInfo;
  if (isFetching) return <SkeletonLoadingCard />;

  const hasHistory =
    (subscriptionHistory?.length ?? 0) > 0 &&
    Boolean(subscriptionHistory?.[0]?.start_date);

  const HistorySection = () => (
    <div>
      <p className="text-xl hidden sm:block font-bold text-black mb-4">Riwayat Tagihan</p>
      <div className="flex flex-col gap-6">
        {hasHistory ? (
          (subscriptionHistory ?? []).map((history) => (
            <SubsHistoryCard data={history} key={history.id} />
          ))
        ) : (
          <div className="flex text-secondary flex-col gap-4 justify-center items-center text-center py-10">
            <Image src={empty} alt="empty" />
            Anda belum memiliki riwayat pembelian paket Internet Rakyat.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE (< sm): urutan dinamis */}
      <div className="sm:hidden space-y-6">
        {hasHistory ? (
          <>
            {activePacketData?.start_date && (
              <ActivePackageCard data={activePacketData} />
            )}

            <Image
              src={bannerCS}
              alt="banner CS"
              className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            />

            <Image
              src={bannerPanduan}
              alt="Banner Panduan"
              className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            />

            <HistorySection />
          </>
        ) : (
          <>
            <HistorySection />

            <Image
              src={bannerCS}
              alt="banner CS"
              className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            />

            <Image
              src={bannerPanduan}
              alt="Banner Panduan"
              className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            />
          </>
        )}
      </div>

      {/* TABLET / DESKTOP (≥ sm): tetap seperti sebelumnya */}
      <div className="hidden sm:grid grid-cols-12 gap-6">
        <div className="lg:col-span-5 col-span-12 space-y-5">
          {activePacketData?.start_date && (
            <ActivePackageCard data={activePacketData} />
          )}

          <Image
            src={bannerCS}
            alt="banner CS"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          />
        </div>

        <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
          <Image
            src={bannerPanduan}
            alt="Banner Panduan"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          />
          <HistorySection />
        </div>
      </div>
    </>
  );
};

export default ActivePacket;
