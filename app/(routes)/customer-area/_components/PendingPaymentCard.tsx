import React from "react";
import Image from "next/image";
import { FaChevronRight } from "react-icons/fa";
import logoIra from "@/public/assets/Icons/Logo-Ira-Red.svg";
import expirationIcon from "@/public/assets/Icons/jam-pasir.svg";
import paymentIcon from "@/public/assets/Icons/hargaPaket.svg";
import channelIcon from "@/public/assets/Icons/rocket.svg";
import warningIcon from "@/public/assets/Icons/warning-icon.svg";
import { convertToCurrency2, formatDate } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { UnifiedPaymentData } from "@/app/_shared/types/payment";
import toast from "react-hot-toast";

const PendingPaymentCard = ({ data }: { data: UnifiedPaymentData }) => {
  const router = useRouter();

  const handlePaymentRedirect = () => {
    const paymentAttempt = data.payment_attempt;
    const url =
      paymentAttempt?.desktop_web_checkout_url ??
      paymentAttempt?.mobile_web_checkout_url ??
      paymentAttempt?.qr_checkout_string ??
      paymentAttempt?.mobile_deeplink_checkout_url ??
      undefined;

    const category = paymentAttempt?.method_category;
    const paymentReqID = paymentAttempt?.id;
    const paymentCode = paymentAttempt?.channel_code;

    if (category !== "ewallet") {
      router.push(
        `/payment/checkout-payment?id=${paymentReqID}&type=${category}&selected_payment=${paymentCode}`,
      );
    } else if (category === "ewallet" && url) {
      window.location.href = url;
    } else {
      toast.error("Terjadi kesalahan, silakan coba metode pembayaran lain");
    }
  };

  return (
    <div className="bg-linear-to-b from-white via-white to-[#FFF4CE] rounded-xl shadow-lg p-6 max-sm:p-4">
      {/* Header */}
      <div className="mb-3 font-bold text-orange-600">Menunggu Pembayaran</div>
      <div className="flex items-center gap-4 mb-4">
        {/* Logo */}
        <div className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center shrink-0">
          <Image src={logoIra} alt="IRA Icon" width={28} height={28} />
        </div>

        <div>
          <h3 className="sm:text-xl font-bold text-black">
            {data.package_id?.name ?? "-"}
          </h3>
          <button
            onClick={handlePaymentRedirect}
            className="text-orange-500 cursor-pointer flex items-center justify-center gap-1 sm:text-sm text-xs underline hover:text-orange-600 transition"
          >
            Lanjutkan Pembayaran
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Message */}
      <div className="pt-4">
        <Image
          src={warningIcon}
          width={24}
          height={24}
          alt="warning-icon"
          className="mb-1"
        />
        <p className="sm:text-sm text-xs font-bold text-orange-600">
          Selesaikan pembayaran sebelum{" "}
          {formatDate(data.payment_attempt?.expires_at ?? "") ?? "-"}
        </p>
        <p className="sm:text-sm text-xs mt-1">
          Anda memiliki tagihan yang belum dibayar. Mohon segera selesaikan
          pembayaran agar paket internet Anda dapat dinikmati tanpa hambatan.
        </p>
      </div>

      <div className="border-t border-gray-border-2 my-6"></div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {/* Total Tagihan */}
        <div className="flex flex-col items-start gap-3">
          <Image src={paymentIcon} alt="tagihanIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Total Tagihan</p>
            <p className="text-sm sm:text-base font-bold text-primary">
              {convertToCurrency2(Number(data.amount)) ?? "-"}
            </p>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="flex flex-col items-start gap-3">
          <Image src={channelIcon} alt="channelIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Metode Bayar</p>
            <p className="text-sm sm:text-base">
              {data.channel_payment_id?.name ?? data.channel_code ?? "-"}
            </p>
          </div>
        </div>

        {/* Batas Waktu */}
        <div className="flex flex-col items-start gap-3">
          <Image src={expirationIcon} alt="expirationIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Batas Waktu</p>
            <p className="text-sm sm:text-base">
              {formatDate(data.payment_attempt?.expires_at ?? "") ?? "-"}
            </p>
          </div>
        </div>
      </div>

      <button
        className="w-full mt-6 cursor-pointer sm:rounded-lg text-sm sm:text-base transition"
        onClick={handlePaymentRedirect}
      >
        <div className="w-full relative flex justify-center items-center bg-orange-500 rounded-full h-12 md:h-14 overflow-hidden custom-bg-animation">
          {/* glossy highlight */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 fancy-background-expired w-[92%] h-6.5 rounded-full z-0" />

          <span className="relative z-10 text-white text-sm sm:text-base md:text-lg font-bold whitespace-nowrap px-16">
            Bayar Sekarang
          </span>
        </div>
      </button>
    </div>
  );
};

export default PendingPaymentCard;
