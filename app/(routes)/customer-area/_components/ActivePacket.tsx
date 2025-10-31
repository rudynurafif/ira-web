"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
import {
  getActivePacket,
  getSubscriptionHistory,
} from "@/app/_api/Customer/CustomerArea";
import {
  ActivePacketData,
  SubscriptionHistory,
} from "@/app/_shared/types/customer-area";
import { useRouter } from "next/navigation";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import toast from "react-hot-toast";
import { useAppSelector } from "@/app/store/store";
import bannerPanduan from "@/public/assets/Images/bannerPanduan.svg";
import bannerCS from "@/public/assets/Images/bannerCS.png";
import greenCheck from "@/public/assets/Icons/mdi_tick-circle.svg";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import ActivePackageCard from "./ActivePackageCard";

const SubscriptionHistoryCard = ({
  paid,
  mainTitle,
  packageInfo,
  subTitle,
  price,
}: SubscriptionHistory) => {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-8 py-5 max-sm:p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="py-4 pr-3 max-sm:hidden">
          <Image src={starIcon} alt="star-icon" height={40} width={40} />
        </div>
        <div className="flex flex-col gap-1">
          <p
            className={`${
              paid ? "text-green-primary" : "text-red-primary"
            }  text-sm max-sm:text-[10px] font-semibold items-center flex gap-1`}
          >
            <Image
              src={paid ? greenCheck : redAlert}
              className="max-sm:hidden"
              alt="alert"
            />
            <Image
              src={paid ? greenCheck : redAlert}
              className="sm:hidden"
              height={12}
              width={12}
              alt="alert"
            />
            {mainTitle}
          </p>
          <p className="text-xl max-sm:text-sm font-bold text-dark-primary-2">
            {packageInfo}
          </p>
          <p className="max-sm:block hidden text-sm font-medium">{price}</p>
          <p className=" text-xs max-sm:text-[10px]">{subTitle}</p>
        </div>
      </div>
      <div className="flex-col text-right">
        <p className="font-semibold text-xl max-sm:hidden mb-2">{price}</p>
        <button
          className={`${
            paid
              ? "bg-dark-primary-2 hover:bg-dark-primary"
              : "bg-red-primary hover:bg-red-700"
          } text-white cursor-pointer whitespace-nowrap px-5 py-2 max-sm:p-2 rounded-lg text-sm max-sm:text-[10px]`}
        >
          {paid ? "Unduh Tagihan" : "Bayar Tagihan"}
        </button>
      </div>
    </div>
  );
};

const ActivePacket = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [activePacketData, setActivePacketData] = useState<ActivePacketData>({
    packageName: "Starlite 30 Hari [UNLIMITED]",
    packageDuration: "30 Hari",
    price: "Rp100.000",
    speed: "200Mbps",
    expiryDate: "18 Oktober 2025",
  });
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistory[]
  >([]);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const resPacket = await getActivePacket({});
        setActivePacketData(resPacket);

        const resSubHistory = await getSubscriptionHistory({});
        setSubscriptionHistory(resSubHistory);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal muat data paket");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  const isFetching = !activePacketData && !userInfo;

  if (isFetching) return <SkeletonLoadingCard />;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-5 col-span-12 space-y-5">
        <ActivePackageCard
          packageName={activePacketData?.packageName}
          packageDuration={activePacketData?.packageDuration}
          price={activePacketData?.price}
          speed={activePacketData?.speed}
          expiryDate={activePacketData?.expiryDate}
          onExtend={() => alert("Perpanjang paket")}
        />
        <Image src={bannerCS} alt="banner CS"  />
      </div>
      <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
        <Image src={bannerPanduan} alt="Banner Panduan" className="w-full" />

        <div className="">
          <p className="text-xl font-bold text-dark-primary mb-4">Riwayat Tagihan</p>
          <div className="flex flex-col gap-6">
            {subscriptionHistory.map((history, index) => (
              <SubscriptionHistoryCard
                key={index}
                paid={history.paid || false}
                mainTitle={history.mainTitle || "-"}
                packageInfo={history.packageInfo || "-"}
                subTitle={history.subTitle || "-"}
                price={history.price || "-"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePacket;
