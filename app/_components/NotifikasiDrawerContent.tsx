// app/_components/NotifikasiDrawerContent.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import bellIcon from "@/public/assets/Icons/bell.png";
import docsIcon from "@/public/assets/Icons/docs.png";
import { allItems } from "../_shared/data/data";
import { IoIosArrowBack } from "react-icons/io";

export default function NotifikasiDrawerContent() {
  const [activeTab, setActiveTab] = useState<
    "semua" | "notifikasi" | "informasi"
  >("semua");
  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    type: string;
    icon: string;
    title: string;
    date: string;
    content: string;
  } | null>(null);

  // Filter items berdasarkan tab
  const filteredItems =
    activeTab === "semua"
      ? allItems
      : allItems.filter((item) => item.category === activeTab);

  const getIcon = (type: string) => {
    if (type === "bell") {
      return (
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <Image src={bellIcon} alt="bell" />
        </div>
      );
    }
    if (type === "document") {
      return (
        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
          <Image src={docsIcon} alt="docs" />
        </div>
      );
    }
    return null;
  };

  // Hitung badge
  const notifCount = allItems.filter(
    (i) => i.category === "notifikasi" && i.type === "baru",
  ).length;
  const infoCount = allItems.filter(
    (i) => i.category === "informasi" && i.type === "baru",
  ).length;
  const semuaCount = allItems.filter((i) => i.type === "baru").length;

  if (selectedItem) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Detail */}
        <div className="p-4 border-b border-gray-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedItem(null)} className="">
              <IoIosArrowBack size={20} />
            </button>
            <h2 className="text-xl font-bold ">Detail Notifikasi</h2>
          </div>
        </div>

        {/* Detail Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-3 mb-4">
            <div className="shrink-0 mt-1">{getIcon(selectedItem.icon)}</div>
            <div>
              <span className="font-bold  text-sm block">
                {selectedItem.title}
              </span>
              <span className="text-xs text-gray-500">{selectedItem.date}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-border">
            <p className="text-gray-700 whitespace-pre-line">
              {selectedItem.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Notifikasi dan Informasi</h2>
          <button className="text-primary underline text-sm font-medium ml-auto mt-2 sm:mt-0 sm:ml-0">
            Baca Semua
          </button>
        </div>

        {/* Tabs */}
        <div className="flex pt-3 space-x-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: "semua", label: "Semua", count: semuaCount },
            { key: "notifikasi", label: "Notifikasi", count: notifCount },
            { key: "informasi", label: "Informasi", count: infoCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`pb-2 flex gap-1 whitespace-nowrap text-sm font-medium relative ${
                activeTab === key
                  ? "text-black border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              {count > 0 && (
                <span className=" bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Tidak ada notifikasi
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`rounded-xl p-4 mb-4 border cursor-pointer transition-colors ${
                item.type === "baru"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex gap-3">
                <div className="shrink-0 mt-1">{getIcon(item.icon)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex-col">
                    <div className="flex items-center gap-2">
                      {item.type === "baru" && (
                        <span className="bg-primary font-tertiary font-bold text-white text-sm px-2 py-1 rounded-full">
                          Baru
                        </span>
                      )}
                      <span className="font-tertiary font-bold text-lg leading-tight truncate max-w-70">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-xs text-secondary whitespace-nowrap">
                      {item.date}
                    </span>
                  </div>
                  <p className=" text-sm mt-1 line-clamp-2">{item.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
