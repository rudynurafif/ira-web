import React from "react";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import Image from "next/image";
import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
import greenCheck from "@/public/assets/Icons/mdi_tick-circle.svg";

type Props = {
  paid: boolean;
  icon: string;
  mainTitle: string;
  packageInfo: string;
  subTitle: string;
  price: string;
  buttonText: string;
};

const SubscriptionHistoryCard = ({
  paid,
  icon,
  mainTitle,
  packageInfo,
  subTitle,
  price,
  buttonText,
}: Props) => {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-8 py-5 max-sm:p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="py-4 pr-2 max-sm:hidden">
          <Image src={starIcon} alt="star-icon" height={40} width={40} />
        </div>
        <div className="flex flex-col gap-1">
          <p
            className={`${
              paid ? "text-green-primary" : "text-red-primary"
            }  text-sm max-sm:text-[10px] font-semibold items-center flex gap-1`}
          >
            <Image src={icon} className="max-sm:hidden" alt="alert" />
            <Image src={icon} className="sm:hidden" height={12} width={12} alt="alert" />
            {mainTitle}
          </p>
          <p className="text-xl max-sm:text-sm font-bold text-dark-primary-2">{packageInfo}</p>
          <p className="max-sm:block text-sm font-medium">{price}</p>
          <p className=" text-xs max-sm:text-[10px]">{subTitle}</p>
        </div>
      </div>
      <div className="flex-col text-right">
        <p className="font-semibold text-xl max-sm:hidden mb-2">{price}</p>
        <button
          className={`${
            paid ? "bg-dark-primary-2" : "bg-red-primary"
          } text-white whitespace-nowrap px-4 py-2 max-sm:p-2 rounded text-sm max-sm:text-[10px]`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const SubscriptionHistory = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <SubscriptionHistoryCard
        paid={false}
        icon={redAlert}
        mainTitle="Pembayaran sudah jatuh tempo"
        packageInfo="Paket 200Mbps Starlite"
        subTitle="Bayarkan tagihan Anda tanggal 10 Juli 2025"
        price="Rp100.000/Bulan"
        buttonText="Bayar Tagihan"
      />

      <SubscriptionHistoryCard
        paid={true}
        icon={greenCheck}
        mainTitle="Tagihan Lunas"
        packageInfo="Unlimited Package"
        subTitle="Aktif sampai 10 Juni 2025"
        price="Rp0/Bulan"
        buttonText="Unduh Tagihan"
      />
    </div>
  );
};

export default SubscriptionHistory;
