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

const SubsHistoryCard = ({ data }: { data: SubscriptionHistoryAPI }) => {
  return (
    <div className="flex-1 gap-4 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-8 py-5 max-sm:p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="py-4 pr-3 max-sm:hidden">
          <Image src={iraIcon} alt="star-icon" height={40} width={40} />
        </div>
        <div className="flex flex-col gap-1">
          <p
            className={`${
              data.package_id.is_active
                ? "text-green-primary"
                : "text-red-primary"
            }  text-sm max-sm:text-[10px] font-semibold items-center flex gap-1`}
          >
            <Image
              src={data.package_id.is_active ? greenCheck : redAlert}
              className="max-sm:hidden"
              alt="alert"
            />
            <Image
              src={data.package_id.is_active ? greenCheck : redAlert}
              className="sm:hidden"
              height={12}
              width={12}
              alt="alert"
            />
            {data?.billing_id[0]?.status === "PAID"
              ? "Paket berhasil dibayar"
              : "Paket belum dibayar"}
          </p>
          <p className="text-xl max-sm:text-sm font-bold text-black">
            {data.package_id.name ?? "-"}
          </p>
          <p className="max-sm:block hidden text-sm font-medium">
            {convertToCurrency(data.package_id.price) ?? "-"}
          </p>
          <p className=" text-xs max-sm:text-[10px]">
            {" "}
            Dibayar pada{" "}
            {formatISODate(data?.billing_id[0]?.invoice_id[0]?.paid_at) || "-"}
          </p>
        </div>
      </div>

      <div className="flex-col text-right">
        <p className="font-semibold text-xl max-sm:hidden mb-2">
          {convertToCurrency(data.package_id.price) ?? "-"}
        </p>
        <button
          className={`${
            data.package_id.is_active
              ? "bg-primary hover:bg-dark-primary-2"
              : "bg-red-primary hover:bg-dark-primary"
          } text-white cursor-pointer whitespace-nowrap px-5 py-2 max-sm:p-2 rounded-lg text-sm max-sm:text-[10px]`}
        >
          {data.package_id.is_active ? "Unduh Invoice" : "Bayar Invoice"}
        </button>
      </div>
    </div>
  );
};

export default SubsHistoryCard;
