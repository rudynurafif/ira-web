"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getSubscriptionHistory } from "@/app/_api/Customer/CustomerArea";
import { PackageData } from "@/app/_shared/types/customer-area";
import { useRouter } from "next/navigation";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import toast from "react-hot-toast";
import { useAppSelector } from "@/app/store/store";
import bannerPanduan from "@/public/assets/Images/bannerPanduan.svg";
import bannerCS from "@/public/assets/Images/bannerCS.svg";
import ActivePackageCard from "./ActivePackageCard";
import SubsHistoryCard from "./SubsHistoryCard";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import ActivePackageCardSkeleton from "./ActivePackageCardSkeleton";

const ActivePacket = () => {
  const [activePacketData, setActivePacketData] =
    useState<SubscriptionHistoryAPI>();
  const [subscriptionHistory, setSubscriptionHistory] =
    useState<SubscriptionHistoryAPI[]>();
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSubHistory = await getSubscriptionHistory({});
        setSubscriptionHistory(resSubHistory.data?.data);
        setActivePacketData(resSubHistory.data?.data?.[0]);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal muat data paket");
      }
    };

    fetchData();
  }, []);

  const isFetching = !activePacketData && !userInfo;

  if (isFetching) return <SkeletonLoadingCard />;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-5 col-span-12 space-y-5">
        {activePacketData?.start_date && (
          <ActivePackageCard data={activePacketData} />
        )}
        <Image
          src={bannerCS}
          alt="banner CS"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105"
        />
      </div>
      <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
        <Image
          src={bannerPanduan}
          alt="Banner Panduan"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105"
        />

        <div className="">
          <p className="text-xl font-bold text-black mb-4">Riwayat Tagihan</p>
          <div className="flex flex-col gap-6">
            {subscriptionHistory?.[0].start_date ? (
              (subscriptionHistory ?? []).map((history, index) => (
                <SubsHistoryCard data={history} key={history.id} />
              ))
            ) : (
              <div>
                Anda belum memiliki riwayat pembelian paket FWA Startlite.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePacket;
