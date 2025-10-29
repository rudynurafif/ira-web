"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import checkGreenIcon from "@/public/assets/Icons/mdi_tick-circle.svg";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import editIcon from "@/public/assets/Icons/icon-edit.svg";
import exitIcon from "@/public/assets/Icons/icon-exit.svg";
import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
import { ProfileLabel } from "./PersonalData";
import {
  getActivePacket,
  getProfileInfo,
} from "@/app/_api/Customer/CustomerArea";
import {
  ActivePacketData,
  ProfileInfo,
} from "@/app/_shared/types/customer-area";
import ModalEditProfile from "./ModalEditProfile";
import DeliveryTracking from "./DeliveryTracking";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import toast from "react-hot-toast";
import { useAppSelector } from "@/app/store/store";

const ActivePacket = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [activePacketData, setActivePacketData] = useState<ActivePacketData>();
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const resPacket = await getActivePacket({});

        setActivePacketData(resPacket);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal muat data paket");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  const isFetching = !activePacketData && !userInfo;

  return (
    <div className="flex flex-col gap-10 mb-10">
      {isFetching ? (
        <SkeletonLoadingCard />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-8 max-sm:p-4">
            <div>
              <div className="flex flex-row justify-between items-center mb-1">
                <h3 className="text-sm text-secondary max-sm:text-xs">
                  Paket Aktif
                </h3>
                {/* <div className="flex items-center space-x-1">
              <Image
                src={activePacketData?.isPaid ? checkGreenIcon : redAlert}
                alt="check-green"
                width={20}
                height={20}
              />
              <p
                className={`text-sm max-sm:text-[10px] ${
                  activePacketData?.isPaid
                    ? "text-green-primary"
                    : "text-red-primary"
                }  font-medium`}
              >
                {activePacketData?.isPaid
                  ? "Tagihan Lunas"
                  : "Tagihan Belum Lunas"}
              </p>
            </div> */}
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="font-bold text-dark-primary-2 text-xl max-sm:text-sm">
                  {activePacketData?.packageInfo}
                </p>
                <div className="flex items-center space-x-1">
                  <Image
                    src={activePacketData?.isPaid ? checkGreenIcon : redAlert}
                    alt="check-green"
                    width={20}
                    height={20}
                  />
                  <p
                    className={`text-sm max-sm:text-[10px] ${
                      activePacketData?.isPaid
                        ? "text-green-primary"
                        : "text-red-primary"
                    }  font-medium`}
                  >
                    {activePacketData?.isPaid
                      ? "Tagihan Lunas"
                      : "Tagihan Belum Lunas"}
                  </p>
                </div>
              </div>
              <p className="text-[16px] max-sm:text-[12px] text-black mt-2">
                {activePacketData?.packagePrice}
              </p>
              <div className="flex justify-between items-center mt-2">
                {/* <p className="text-sm max-sm:text-[12px] text-green-primary">
              Jatuh tempo:{" "}
              {activePacketData?.dueDate}
            </p> */}
                {userInfo?.status !== "active" && (
                <button
                  onClick={() => router.push(`/activation`)}
                  className={`${
                    activePacketData?.isActive
                      ? "bg-gray-border cursor-not-allowed"
                      : "bg-button hover:bg-dark-primary-2 cursor-pointer"
                  } max-sm:text-[12px] max-sm:p-2 py-2 px-5 rounded-lg font-medium text-white`}
                >
                  Aktivasi Sekarang
                </button>
                )} 
                {/* {activePacketData?.isPaid && (
                  <button
                    className={`${
                      activePacketData?.isPaid
                        ? "bg-gray-border cursor-not-allowed"
                        : "bg-button hover:bg-dark-primary-2 cursor-pointer"
                    } max-sm:text-[12px] max-sm:p-2 py-2 px-5 rounded-lg font-medium text-white`}
                  >
                    Bayar tagihan
                  </button>
                )} */}
              </div>
            </div>
          </div>

          <DeliveryTracking />
        </>
      )}
    </div>
  );
};

export default ActivePacket;
