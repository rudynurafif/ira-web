"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
import { useRouter } from "next/navigation";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import { useAppSelector } from "@/app/store/store";
import bannerPanduan from "@/public/assets/Images/bannerPanduan.png";
import bannerPanduanMobile from "@/public/assets/Images/bannerPanduangmobile.png";
import bannerCS from "@/public/assets/Images/bannerCS.png";
import bannerCSMobile from "@/public/assets/Images/bannerCSmobile.png";
import ActivePackageCard from "./ActivePackageCard";
import SubsHistoryCard from "./SubsHistoryCard";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import empty from "@/public/assets/Images/Empty.svg";
import Link from "next/link";

const PAGE_SIZE = 5;

const ActivePacket = () => {
  const [activePacketData, setActivePacketData] =
    useState<SubscriptionHistoryAPI | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistoryAPI[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const { userInfo } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const phoneCS = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";

  // Ambil hanya paket aktif dari subHistory (indeks 0)
  useEffect(() => {
    if (subscriptionHistory?.[0]) {
      console.log(subscriptionHistory?.[0]);
      // Cek apakah ini paket aktif (ada start_date dan belum expired)
      const isActive =
        subscriptionHistory[0]?.start_date && subscriptionHistory[0]?.end_date;
      setActivePacketData(isActive ? subscriptionHistory?.[0] : null);
    }
  }, [subscriptionHistory]);

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
    fetchHistory(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchHistory(page);
  };

  const isFetching = !userInfo;
  if (isFetching) return <SkeletonLoadingCard />;

  const hasHistory = subscriptionHistory[0]?.start_date;

  const HistorySection = () => (
    <div>
      <p className="text-xl hidden sm:block font-bold text-black mb-4">
        Riwayat Tagihan
      </p>

      {isLoadingHistory ? (
        <div className="space-y-4">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <SkeletonLoadingCard key={i} />
          ))}
        </div>
      ) : hasHistory ? (
        <>
          <div className="flex flex-col gap-6">
            {subscriptionHistory.map((history) => (
              <SubsHistoryCard data={history} key={history.id} />
            ))}
          </div>

          {/* Pagination UI */}
          {totalPages >= 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 cursor-pointer rounded-md bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                {"<"}
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Tampilkan semua halaman jika ≤ 5
                // Jika > 5, tampilkan hanya first, last, dan ±2 di sekitar current
                if (totalPages <= 5) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page
                            ? "bg-primary text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={page}>...</span>;
                  }
                  return null;
                }
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 cursor-pointer rounded-md bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                {">"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex text-secondary flex-col gap-4 justify-center items-center text-center py-10">
          <Image src={empty} alt="empty" />
          Anda belum memiliki riwayat pembelian paket Internet Rakyat.
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* MOBILE (< sm) */}
      <div className="sm:hidden space-y-6">
        {activePacketData && <ActivePackageCard data={activePacketData} />}

        <Image
          src={bannerCSMobile}
          alt="banner CS"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
        />

        <Image
          src={bannerPanduanMobile}
          alt="Banner Panduan"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open("/pandaan-cara-bayar", "_blank")}
        />

        <HistorySection />
      </div>

      {/* DESKTOP (≥ sm) */}
      <div className="hidden sm:grid grid-cols-12 gap-6">
        <div className="lg:col-span-5 col-span-12 space-y-5">
          {activePacketData && <ActivePackageCard data={activePacketData} />}
          <Image
            src={bannerCS}
            alt="banner CS"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
          />
        </div>

        <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
          <Image
            src={bannerPanduan}
            alt="Banner Panduan"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("/panduan-cara-bayar", "_blank")}
          />
          <HistorySection />
        </div>
      </div>
    </>
  );
};

export default ActivePacket;
