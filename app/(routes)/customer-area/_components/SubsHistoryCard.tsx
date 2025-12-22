import Image from "next/image";
import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
import greenCheck from "@/public/assets/Icons/mdi_tick-circle.svg";
import iraIcon from "@/public/assets/Icons/Logo-Ira-Red.svg";
import {
  convertToCurrency,
  formatDate,
  formatISODate,
} from "@/app/_shared/utils";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import toast from "react-hot-toast";
import { useState } from "react";

const SubsHistoryCard = ({ data }: { data: SubscriptionHistoryAPI }) => {
  const [isToastCooldown, setIsToastCooldown] = useState<boolean>(false);

  const handleCoomingSoon = () => {
    if (isToastCooldown) return;

    setIsToastCooldown(true);
    toast("Coming Soon!");

    setTimeout(() => {
      setIsToastCooldown(false);
    }, 3000);
  };

  return (
    <div className="flex-1 gap-4 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-8 py-5 max-sm:p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="py-4 pr-3 max-sm:hidden">
          <Image src={iraIcon} alt="ira-icon" height={40} width={40} />
        </div>
        <div className="flex flex-col gap-1">
          <div
            className={`${
              data?.billing_id[0]?.status === "PAID"
                ? "text-green-primary"
                : "text-red-primary"
            }  text-sm max-sm:text-xs font-semibold items-center flex gap-1`}
          >
            <div className="flex items-center gap-2">
              {/* Logo IRA */}
              <div className=" max-sm:block hidden">
                <Image
                  src={iraIcon}
                  alt="ira-icon"
                  className="p-2"
                  height={40}
                  width={40}
                />
              </div>

              <div className="flex flex-col gap-1 justify-center">
                {/* Informasi Pembayaran*/}
                <div className="flex gap-1 max-sm:text-xs">
                  <Image
                    src={
                      data?.billing_id[0]?.status === "PAID"
                        ? greenCheck
                        : redAlert
                    }
                    className="max-sm:hidden"
                    alt="alert"
                  />
                  <Image
                    src={
                      data?.billing_id[0]?.status === "PAID"
                        ? greenCheck
                        : redAlert
                    }
                    className="sm:hidden"
                    height={12}
                    width={12}
                    alt="alert"
                  />
                  {data?.billing_id[0]?.status === "PAID"
                    ? "Paket berhasil dibayar"
                    : "Paket belum dibayar"}
                </div>

                {/* Nama Paket */}
                <p className="text-xl max-sm:text-base font-bold text-black">
                  {data.package_id.name ?? "-"}
                </p>
              </div>
            </div>
          </div>

          <p className="max-sm:block hidden text-sm font-medium">
            {convertToCurrency(data.package_id.price) ?? "-"}/bulan
          </p>
          <p className="sm:text-sm text-[10px]">
            {" "}
            Dibayar pada{" "}
            {formatISODate(data?.billing_id[0]?.invoice_id[0]?.paid_at) || "-"}
          </p>
        </div>
      </div>

      <div className="flex-col text-right">
        <p className="font-medium text-xl max-sm:hidden mb-2">
          {convertToCurrency(data.package_id.price) ?? "-"}/bulan
        </p>
        {/* {!data.billing_id[0]?.is_free && ( */}
        <button
          disabled={isToastCooldown}
          onClick={handleCoomingSoon}
          className={`${
            data?.billing_id[0]?.status === "PAID"
              ? "bg-primary hover:bg-dark-primary-2"
              : "bg-red-primary hover:bg-dark-primary"
          } text-white font-medium cursor-pointer whitespace-nowrap px-5 py-2 max-sm:p-2 rounded-lg text-sm max-sm:text-[10px] ${
            isToastCooldown ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {data?.billing_id[0]?.status === "PAID"
            ? "Unduh Invoice"
            : "Bayar Invoice"}
        </button>
        {/* )} */}
      </div>
    </div>
  );
};

export default SubsHistoryCard;
