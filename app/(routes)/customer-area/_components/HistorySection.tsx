import React, { useEffect, useState } from "react";
import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import DatePickerFilter from "@/app/_components/form/DatePickerFilter";
import SubsHistoryCard from "./SubsHistoryCard";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import { formatDateFilter, toastErrorFromAPI } from "@/app/_shared/utils";
import Image from "next/image";
import empty from "@/public/assets/Images/Empty.svg";

const HistorySection = () => {
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistoryAPI[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [startDateFilter, setStartDateFilter] = useState<any>();
  const [endDateFilter, setEndDateFilter] = useState<any>();

  const fetchHistory = async (page: number) => {
    setIsLoadingHistory(true);
    try {
      const params: any = {
        page,
        pageSize: 5,
      };

      if (startDateFilter)
        params.start_date = formatDateFilter(startDateFilter);

      if (endDateFilter) params.end_date = formatDateFilter(endDateFilter);

      const res = await getCustomerPackage(params);

      const data = res.data?.data || [];
      const total = res.data?.total || 0;
      const pages = Math.ceil(total / 5);

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
    if (startDateFilter && endDateFilter) {
      setCurrentPage(1);
      fetchHistory(1);
    } else if (!startDateFilter && !endDateFilter) {
      setCurrentPage(1);
      fetchHistory(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDateFilter, startDateFilter]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchHistory(page);
  };

  const hasHistory = subscriptionHistory[0]?.start_date ?? false;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="sm:text-xl font-bold text-black">
          Riwayat Tagihan
        </p>
        {hasHistory && (
          <DatePickerFilter
            label="Filter berdasarkan tanggal"
            onChangeDate={(val: any) => {
              const [start, end] = val;
              setStartDateFilter(start);
              setEndDateFilter(end);
            }}
            deleteDate={() => {
              setStartDateFilter(null);
              setEndDateFilter(null);
            }}
            startDate={startDateFilter}
            endDate={endDateFilter}
          />
        )}
      </div>

      {isLoadingHistory ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
};

export default HistorySection;
