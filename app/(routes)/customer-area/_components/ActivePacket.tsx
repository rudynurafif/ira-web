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

const ActivePacket = () => {
  const [isLoading, setisLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [activePacketData, setActivePacketData] = useState<ActivePacketData>();
  const [profileInfo, setprofileInfo] = useState<ProfileInfo>();

  const router = useRouter();

  const fetchData = async () => {
    setisLoading(true);

    try {
      const resPacket = await getActivePacket({});
      const resProfile = await getProfileInfo({});

      setActivePacketData(resPacket);
      setprofileInfo(resProfile.data?.data.customer ?? {});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal muat data paket");
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isFetching = !activePacketData || !profileInfo;

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
                {activePacketData?.isPaid && (
                  <button
                    className={`${
                      activePacketData?.isPaid
                        ? "bg-gray-border cursor-not-allowed"
                        : "bg-button hover:bg-dark-primary-2 cursor-pointer"
                    } max-sm:text-[12px] max-sm:p-2 py-2 px-5 rounded-lg font-medium text-white`}
                  >
                    Bayar tagihan
                  </button>
                )}
              </div>
            </div>
            {/* <div className="border text-gray-border"></div> */}
            {/* <div className="text-secondary text-sm mt-4">Langganan Aktif Lainnya</div> */}
            {/* <div className="mt-3 flex space-x-10 text-xs">
          <div className="flex justify-center items-center">
            <Image
              src={logoSuperChinese}
              height={40}
              width={40}
              alt="logo-superchinese"
              className="mr-1"
            />
            <Link
              href={`/`}
              className="text-dark-primary-2 text-sm font-bold underline"
            >
              Login SuperChinese{" "}
            </Link>
            <Image src={iconPop} height={16} width={16} alt="icon-pop" />
          </div>
          <div className="flex justify-center items-center">
            <Image
              src={logoCubmu}
              height={40}
              width={40}
              alt="logo-superchinese"
              className="mr-1"
            />
            <Link
              href={`/`}
              className="text-dark-primary-2 text-sm font-bold underline"
            >
              Login Cubmu{" "}
            </Link>
            <Image src={iconPop} height={16} width={16} alt="icon-pop" />
          </div>
          <div className="flex justify-center items-center">
            <Image
              src={logoIblooming}
              height={40}
              width={40}
              alt="logo-superchinese"
              className="mr-1"
            />
            <Link
              href={`/`}
              className="text-dark-primary-2 text-sm font-bold underline"
            >
              Login iblooming{" "}
            </Link>
            <Image src={iconPop} height={16} width={16} alt="icon-pop" />
          </div>
        </div> */}
          </div>
          {/* <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-4 max-sm:p-0">
        <div className="p-4 flex gap-4 items-center">
          <Image src={starIcon} alt="star-icon" height={40} width={40} />
          <h3 className="text-2xl font-bold max-sm:text-[16px]">Akun Anda</h3>
        </div>
        <ProfileLabel
          label="Nama Lengkap"
          data={profileInfo?.fullName || "-"}
        />
        <div className="flex items-center justify-between mr-4">
          <ProfileLabel
            label="Nomor Handphone"
            data={profileInfo?.phoneNumber || "-"}
          />
          <p
            onClick={() => {}}
            className="max-sm:text-xs text-xl text-dark-primary-2 font-bold cursor-pointer"
          >
            Verifikasi
          </p>
        </div>
        <ProfileLabel label="Email" data={profileInfo?.email || "-"} />
        <ProfileLabel label="Alamat" data={profileInfo?.address || "-"} />

        <div className="flex max-sm:flex-col max-sm:gap-2 gap-6 justify-between p-4">
          <>
            <div
              onClick={() => setOpenModal(true)}
              className="flex max-sm:text-xs text-lg items-center gap-2 cursor-pointer"
            >
              <Image src={editIcon} alt="edit-icon" />
              <p>Edit Profil</p>
            </div>

            <ModalEditProfile
              open={openModal}
              onClose={() => setOpenModal(false)}
              initial={{
                fullName: "Sugeng Prasetio",
                phone: "0821234889012",
                email: "sugengpresetio@mail.com",
                address:
                  "BINONG KAMPUNG CILENGR GANG GURU LILI NO 178 CURUG 004/03 KAB TANGERANG 15810",
              }}
              onSendOtp={(phone) => console.log("kirim OTP ke", phone)}
              onSubmit={(v) => console.log("submit", v)}
            />
          </>

          <div className="flex max-sm:text-xs text-lg text-red-primary items-center gap-2 cursor-pointer">
            <Image src={exitIcon} alt="edit-icon" />
            <p>Keluar</p>
          </div>
        </div>
      </div> */}

          <DeliveryTracking />
        </>
      )}
    </div>
  );
};

export default ActivePacket;
