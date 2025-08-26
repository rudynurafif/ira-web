"use client";

import { useState } from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerBanner from "@/public/assets/banner-customer.svg";
import Image from "next/image";
import ActivePacket from "./components/ActivePacket";
import PersonalData from "./components/PersonalData";
import DeliveryTracking from "./components/DeliveryTracking";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import SubscriptionHistory from "./components/SubscriptionHistory";

const tabs = ["Paket Aktif", "Data Pribadi", "Tracking Pengiriman", "Riwayat"];

export default function AreaPelanggan() {
  const [activeTab, setActiveTab] = useState("Paket Aktif");
  const [customerData, setCustomerData] = useState({
    name: "Sugeng Presetio",
    id: "STL10089766890",
    avatar: starIcon,
  });

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <CustomerHeader />

      <div className="relative z-10 max-w-[1329px] mx-auto px-8 -mt-28">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
          {/* Avatar */}
          <div className="h-[170px] w-[170px] max-sm:h-[100px] max-sm:w-[100px] max-sm:mt-8 rounded-full bg-white ring-8 ring-white shadow-[0_0_20px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-center flex-shrink-0">
            <Image
              src={customerData?.avatar}
              alt="Avatar"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Info */}
          <div className="text-center md:text-left select-none">
            <p className="text-2xl max-sm:text-[20px] font-bold text-ads-platform-dark">
              {customerData?.name || "Nama Pelanggan"}
            </p>
            <p className="text-xl max-sm:text-[16px] text-ads-platform-dark">
              {customerData?.id || "STL00000000XXXX"}
            </p>
          </div>
        </div>
      </div>

      {/* TAB MENU */}
      <div className="max-w-[1329px] px-8 mt-[54px] mx-auto">
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide  border-b border-gray-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 underline-animation whitespace-nowrap max-sm:text-xs text-xl cursor-pointer ${
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

        {activeTab === "Tracking Pengiriman" && <DeliveryTracking />}

        {activeTab === "Riwayat" && <SubscriptionHistory />}
      </div>
    </div>
  );
}
