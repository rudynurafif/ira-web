"use client";

import React, { useEffect, useState } from "react";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import Image from "next/image";
import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
import greenCheck from "@/public/assets/Icons/mdi_tick-circle.svg";
import type { SubscriptionHistory } from "@/app/_shared/types/customer-area";
import { getSubscriptionHistory } from "@/app/_api/Customer/CustomerArea";

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

const SubscriptionHistory = () => {
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistory[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const resSubHistory = await getSubscriptionHistory({});

      setSubscriptionHistory(resSubHistory);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
  );
};

export default SubscriptionHistory;
