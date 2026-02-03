import Image from "next/image";
import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
import greenCheck from "@/public/assets/Icons/mdi_tick-circle.svg";
import iraIcon from "@/public/assets/Icons/Logo-Ira-Red.svg";
import {
  convertToCurrency2,
  formatISODate,
  htmlToPdf,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import toast from "react-hot-toast";
import { useState } from "react";
import { downloadInvoice } from "@/app/_api/Customer/CustomerArea";

const SubsHistoryCard = ({ data }: { data: SubscriptionHistoryAPI }) => {
  const [isToastCooldown, setIsToastCooldown] = useState<boolean>(false);

  const handleDownloadInvoice = async () => {
    if (isToastCooldown) return;

    try {
      setIsToastCooldown(true);
      const htmlResponse = await downloadInvoice({
        code: data.billing_id[0].invoice_id[0].invoice_no,
      });

      if (typeof htmlResponse.data === "string") {
        const filename = `InvoiceIRA-${data.billing_id[0].invoice_id[0].invoice_no}.pdf`;

        const htmlBlob = new Blob([htmlResponse.data], { type: "text/html" });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        window.open(htmlUrl, "_blank");

        await htmlToPdf(htmlResponse.data, filename);
      } else {
        toast.error("Gagal memuat invoice.");
      }
    } catch (err: any) {
      toastErrorFromAPI(err || "Terjadi kesalahan saat mengunduh invoice.");
    } finally {
      setTimeout(() => setIsToastCooldown(false), 3000);
    }
  };

  return (
    <div className="flex-1 gap-4 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-8 py-5 max-sm:p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {/* Desktop */}
        <div className="py-4 pr-3 max-sm:hidden">
          <Image
            src={iraIcon}
            alt="ira-icon"
            height={40}
            width={40}
            className="w-10 h-10 min-w-10 min-h-10 shrink-0"
          />
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
              <div className="max-sm:block hidden">
                <Image
                  src={iraIcon}
                  alt="ira-icon"
                  className="w-7.5 h-7.5 min-w-7.5 min-h-7.5 shrink-0"
                  height={30}
                  width={30}
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
                  {data.package_id?.name ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Harga in Mobile View */}
          <p className="max-sm:block hidden text-sm font-medium">
            {convertToCurrency2(
              Number(data.billing_id[0]?.invoice_id[0]?.paid_amount),
            ) ?? "0"}
            /bulan
          </p>
          <p className="sm:text-sm text-[10px]">
            {" "}
            Dibayar pada{" "}
            {formatISODate(data?.billing_id[0]?.invoice_id[0]?.paid_at) || "-"}
          </p>
        </div>
      </div>

      <div className="flex-col text-right">
        {/* Harga in Desktop View */}
        <p className="font-medium text-xl max-sm:hidden mb-2">
          {convertToCurrency2(
            Number(data.billing_id[0]?.invoice_id[0]?.paid_amount),
          ) ?? "0"}
          /bulan
        </p>
        {/* {!data.billing_id[0]?.is_free && ( */}
        <button
          disabled={isToastCooldown}
          onClick={handleDownloadInvoice}
          className={`${
            data?.billing_id[0]?.status === "PAID"
              ? "bg-primary hover:bg-dark-primary-2"
              : "bg-red-primary hover:bg-dark-primary"
          } text-white font-medium cursor-pointer whitespace-nowrap px-5 py-2 max-sm:p-2 rounded-lg text-sm max-sm:text-[10px] ${
            isToastCooldown ? "opacity-70 cursor-not-allowed!" : ""
          }`}
        >
          {isToastCooldown
            ? "Mohon menunggu.."
            : data?.billing_id[0]?.status === "PAID"
              ? "Unduh Invoice"
              : "Bayar Invoice"}
        </button>
        {/* )} */}
      </div>
    </div>
  );
};

export default SubsHistoryCard;
