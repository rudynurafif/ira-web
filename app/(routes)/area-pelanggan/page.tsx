"use client";

import { useState } from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerBanner from "@/app/assets/banner-customer.svg";
import CustomerImage from "@/app/assets/Icons/icon-starlite.svg";
import Image from "next/image";
import ActivePacket from "./components/ActivePacket";
import PersonalData from "./components/PersonalData";
import DeliveryTracking from "./components/DeliveryTracking";
import starIcon from "@/app/assets/Icons/icon-star.svg";
import SubscriptionHistory from "./components/SubscriptionHistory";

const tabs = [
  "Paket Aktif",
  "Data Pribadi",
  "Tracking Pengiriman",
  "Riwayat",
];

export default function AreaPelanggan() {
  const [activeTab, setActiveTab] = useState("Paket Aktif");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <CustomerHeader bannerSrc={CustomerBanner} />

      <div className="relative z-10 max-w-[1329px] mx-auto px-8 -mt-28">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
          {/* Avatar */}
          <div className="h-[140px] w-[140px] rounded-full bg-white ring-8 ring-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <Image
              src={starIcon}
              alt="Avatar"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Info */}
          <div className="text-center md:text-left select-none">
            <p className="text-lg font-semibold text-gray-900">
              Sugeng Presetio
            </p>
            <p className="text-sm text-gray-500">STL10089766890</p>
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
              className={`pb-2 text-xl cursor-pointer ${
                activeTab === tab
                  ? "border-b-2 border-nokia-blue text-dark-primary font-bold"
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
