import React from "react";
import starIcon from "@/app/assets/Icons/icon-star.svg";
import Image from "next/image";
import redAlert from "@/app/assets/Icons/carbon_warning-filled.svg";
import greenCheck from "@/app/assets/Icons/mdi_tick-circle.svg";

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
    <div className="flex-1 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-8 py-5 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="py-4 pr-2">
          <Image src={starIcon} alt="star-icon" height={40} width={40} />
        </div>
        <div className="flex flex-col gap-1">
          <p
            className={`${
              paid ? "text-green-primary" : "text-red-primary"
            }  text-sm font-semibold flex gap-1`}
          >
            <Image src={icon} alt="alert" />
            {mainTitle}
          </p>
          <p className="text-xl font-bold">{packageInfo}</p>
          <p className=" text-xs">{subTitle}</p>
        </div>
      </div>
      <div className="flex-col text-right">
        <p className="font-semibold text-xl mb-2">{price}</p>
        <button
          className={`${
            paid ? "bg-dark-primary-2" : "bg-red-primary"
          } text-white px-4 py-2 rounded text-sm`}
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
