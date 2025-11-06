import { SubscriptionHistoryAPI } from "@/app/_shared/types/customer-area";
import Image from "next/image";
import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
import greenCheck from "@/public/assets/Icons/mdi_tick-circle.svg";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import { convertToCurrency } from "@/app/_shared/utils";

const SubsHistoryCard = ({ data }: { data: SubscriptionHistoryAPI }) => {
  return (
    <div className="flex-1 gap-4 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-8 py-5 max-sm:p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="py-4 pr-3 max-sm:hidden">
          <Image src={starIcon} alt="star-icon" height={40} width={40} />
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
            {data.package_id.name}
          </p>
          <p className="text-xl max-sm:text-sm font-bold text-dark-primary-2">
            {data.package_id.description}
          </p>
          <p className="max-sm:block hidden text-sm font-medium">
            {data.package_id.price}
          </p>
          <p className=" text-xs max-sm:text-[10px]">
            {data.package_id.remarks}
          </p>
        </div>
      </div>

      <div className="flex-col text-right">
        <p className="font-semibold text-xl max-sm:hidden mb-2">
          {convertToCurrency(data.package_id.price)}
        </p>
        <button
          className={`${
            data.package_id.is_active
              ? "bg-dark-primary-2 hover:bg-dark-primary"
              : "bg-red-primary hover:bg-red-700"
          } text-white cursor-pointer whitespace-nowrap px-5 py-2 max-sm:p-2 rounded-lg text-sm max-sm:text-[10px]`}
        >
          {data.package_id.is_active ? "Unduh Tagihan" : "Bayar Tagihan"}
        </button>
      </div>
    </div>
  );
};

export default SubsHistoryCard;
