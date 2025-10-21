"use client";

import { useEffect, useState } from "react";
import CustomerHeader from "./_components/CustomerHeader";
import CustomerBanner from "@/public/assets/banner-customer.svg";
import Image from "next/image";
import ActivePacket from "./_components/ActivePacket";
import PersonalData from "./_components/PersonalData";
import DeliveryTracking from "./_components/DeliveryTracking";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import SubscriptionHistory from "./_components/SubscriptionHistory";
import { getInitials } from "@/app/utils";
import { ProfileInfo } from "@/app/_shared/types/customer-area";
import { getProfileInfo } from "@/app/_api/CustomerArea";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import qrCodeDummy from "@/public/assets/Images/qr-code.png";

const tabs = [
  "Paket Aktif",
  "Data Pribadi",
  // "Tracking Pengiriman",
  "Riwayat Berlangganan",
];

export default function AreaPelanggan() {
  const [activeTab, setActiveTab] = useState("Paket Aktif");
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>();
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const fetchData = async () => {
    setIsloading(true);

    try {
      const resProfile = await getProfileInfo({});

      setProfileInfo(resProfile);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <CustomerHeader />

      <div className="relative z-10 max-w-[1329px] mx-auto px-8 -mt-28">
        {/* Avatar + Info */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:items-end justify-between">
          <div className="flex flex-col md:flex-row items-center gap-6 md:items-end">
            <div className="h-[170px] w-[170px] max-sm:h-[100px] max-sm:w-[100px] max-sm:mt-8 max-sm:p-6 rounded-full bg-white ring-8 ring-white shadow-[0_0_20px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-center flex-shrink-0">
              <span className="text-6xl max-sm:text-2xl font-bold">
                {getInitials(profileInfo?.fullName ?? "-")}
              </span>
            </div>

            {/* Info */}
            <div className="flex justify-between items-center">
              <div className="text-center md:text-left select-none">
                <p className="text-2xl max-sm:text-[20px] font-bold text-ads-platform-dark">
                  {profileInfo?.fullName ?? "Nama Pelanggan"}
                </p>
                <p className="text-xl max-sm:text-[16px] text-ads-platform-dark">
                  {profileInfo?.id || "FWA00000000XXXX"}
                </p>
              </div>
            </div>
          </div>
          {/* Avatar */}

          {/* Button Show QR */}
          <button
            className="py-2 px-3 bg-primary hover:bg-dark-primary-2 text-white rounded-lg cursor-pointer"
            onClick={() => setShowQR(true)}
          >
            Tampilkan Kode QR
          </button>
          {showQR && (
            <ModalTemplate
              key="qr-modal"
              closeModal={() => setShowQR(false)}
              classNameModal="p-6 max-w-lg w-full mx-4 text-center rounded-xl shadow-lg"
            >
              <h3 className="text-dark-primary text-2xl font-bold mt-6 mb-4">
                Kode QR Pelanggan
              </h3>

              {/* QR Code */}
              <div className="my-6">
                <Image
                  src={qrCodeDummy}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                  width={200}
                  height={200}
                />
              </div>

              {/* Nomor Pelanggan */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">ID Pelanggan</p>
                <p className="text-xl font-bold text-dark-primary">
                  {profileInfo?.id || "FWA123400056"}
                </p>
              </div>

              {/* Button Tutup */}
              <button
                onClick={() => setShowQR(false)}
                className="py-3 cursor-pointer px-6 bg-primary hover:bg-dark-primary-2 text-white rounded-lg w-full font-medium transition"
              >
                Tutup
              </button>
            </ModalTemplate>
          )}
        </div>
      </div>

      {/* TAB MENU */}
      <div className="max-w-[1329px] px-8 mt-[54px] mx-auto">
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide  border-b border-gray-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 underline-animation-register whitespace-nowrap max-sm:text-xs text-xl cursor-pointer ${
                activeTab === tab
                  ? "text-dark-primary font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-[1329px] px-8 mx-auto mt-6">
        {activeTab === "Paket Aktif" && <ActivePacket />}

        {activeTab === "Data Pribadi" && <PersonalData />}

        {/* {activeTab === "Tracking Pengiriman" && <DeliveryTracking />} */}

        {activeTab === "Riwayat Berlangganan" && <SubscriptionHistory />}
      </div>
    </div>
  );
}
