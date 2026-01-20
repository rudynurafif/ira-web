import React from "react";
import Image from "next/image";
import { FaChevronRight, FaStar } from "react-icons/fa";
import { PackageData } from "@/app/_shared/types/customer-area";
import logoIra from "@/public/assets/Icons/Logo-Ira-Red.svg";
import greenConfetti from "@/public/assets/Icons/confetti-green.svg";
import warningIcon from "@/public/assets/Icons/warning-icon.svg";
import exclamationIcon from "@/public/assets/Icons/exclamation-icon.svg";
import expiredIcon from "@/public/assets/Icons/expiredToday.svg";
import packageIcon from "@/public/assets/Icons/hargaPaket.svg";
import sandClock from "@/public/assets/Icons/jam-pasir.svg";
import rocket from "@/public/assets/Icons/rocket.svg";
import calendar from "@/public/assets/Icons/calendar-clock.svg";
import {
  convertToCurrency,
  formattedDate,
  packageCountdown,
} from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import moment from "moment";
import "moment/locale/id";

const ActivePackageCard = ({ data }: { data: SubscriptionHistoryAPI }) => {
  const router = useRouter();
  const { label, status, days } = packageCountdown(data.end_date ?? null);

  return (
    <div
      className={`bg-linear-to-b from-white via-white ${
        status === "3_days_remaining"
          ? "to-[#67aaff]"
          : status === "expires_today"
            ? "to-[#f89d66]"
            : "to-[#FFDCDC]"
      } rounded-xl shadow-lg p-6 max-sm:p-4`}
    >
      {/* Header */}
      <div className="mb-3">Paket yang terakhir dibeli</div>
      <div className="flex items-center gap-4 mb-4">
        {/* Logo */}
        <div className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center">
          <Image src={logoIra} alt="IRA Icon" width={28} height={28} />
        </div>

        <div>
          <h3 className="sm:text-xl font-bold text-black">
            {data.package_id?.name ?? "-"}
          </h3>
          <button
            onClick={() => router.push("/payment")}
            className="text-primary cursor-pointer flex items-center justify-center gap-1 sm:text-sm text-xs underline hover:text-dark-primary transition"
          >
            Perpanjang Paket
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Message */}
      <div className="pt-4">
        {status === "active" && (
          <>
            <Image
              src={greenConfetti}
              width={24}
              height={24}
              alt="confetti-icon"
              className="mb-1"
              color="#008E19"
            />
            <p className="sm:text-sm text-xs font-bold text-green-3">
              Selamat {data.package_id?.name ?? "-"} baru kamu sudah aktif!
            </p>
            <p className="sm:text-sm text-xs mt-1">
              Nikmati Kuota Unlimited dan koneksi stabil selama{" "}
              <strong>{label}</strong> ke depan.
            </p>
          </>
        )}
        {status === "3_days_remaining" && (
          <>
            <Image
              src={warningIcon}
              width={24}
              height={24}
              alt="warning-icon"
              className="mb-1"
              color="#0168ff"
            />
            <p className="sm:text-sm text-xs font-bold text-nokia-blue">
              Tinggal {days} hari! Segera perpanjang sebelum{" "}
              {formattedDate(data.end_date) ?? "-"} agar tidak terputus.
            </p>
            <p className="sm:text-sm text-xs mt-1">
              Masa aktif hampir habis. Amankan akses internet keluarga dengan
              memperpanjang paket sebelum tanggal{" "}
              {formattedDate(data.end_date) ?? "-"}; proses cepat, layanan tetap
              aktif tanpa putus.
            </p>
          </>
        )}
        {status === "expires_today" && (
          <>
            <Image
              src={exclamationIcon}
              width={24}
              height={24}
              alt="caution-icon"
              className="mb-1"
              color="#008E19"
            />
            <p className="sm:text-sm text-xs font-bold text-orange">
              Paket berakhir hari ini! Segera perpanjang sebelum{" "}
              {formattedDate(data.end_date) ?? "-"} agar tidak terisolir.
            </p>
            <p className="sm:text-sm text-xs mt-1">
              Hari ini {data.package_id?.name} mencapai jatuh tempo. Selesaikan
              pembayaran sebelum {formattedDate(data.end_date) ?? "-"} agar
              layanan tetap aktif tanpa jeda. Perpanjangan diproses otomatis
              begitu pembayaran berhasil.
            </p>
          </>
        )}
        {status === "expired" && (
          <>
            <Image
              src={expiredIcon}
              width={24}
              height={24}
              alt="expired-icon"
              className="mb-1"
              color="#008E19"
            />
            <p className="sm:text-sm text-xs font-bold text-[#D6211E]">
              Internet nonaktif—bayar paket untuk aktif kembali seketika.
            </p>
            <p className="sm:text-sm text-xs mt-1">
              Internet nonaktif sementara karena masa aktif sudah berakhir pada{" "}
              <span className="font-bold">
                {formattedDate(data.end_date) ?? "-"}
              </span>
              . Pilih dan bayar paket yang kamu inginkan agar koneksi Internet
              Rakyat segera aktif kembali; hubungi bantuan jika membutuhkan
              panduan.
            </p>
          </>
        )}
      </div>

      <div className="border-t border-gray-border-2 my-6"></div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Harga Paket */}
        {/* <div className="flex flex-col items-start gap-3">
          <Image src={packageIcon} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Harga Paket</p>
            <p className="sm:text-lg text-base">
              {convertToCurrency(data.package_id?.price) ?? "-"}
            </p>
          </div>
        </div> */}

        {/* Sisa Hari */}
        <div className="flex flex-col items-start gap-3">
          <Image src={sandClock} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Sisa Hari</p>
            <p className="text-sm sm:text-base">{label}</p>
          </div>
        </div>

        {/* Kecepatan Paket */}
        <div className="flex flex-col items-start gap-3">
          <Image src={rocket} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Kecepatan Paket</p>
            <p className="text-sm sm:text-base">
              {data.package_id?.speed_mbps ?? "-"}Mpbs
            </p>
          </div>
        </div>

        {/* Tanggal Jatuh Tempo */}
        <div className="flex flex-col items-start gap-3">
          <Image src={calendar} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">
              Tanggal Berakhir Paket
            </p>
            <p className="text-sm sm:text-base">
              {formattedDate(data.end_date) ?? "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePackageCard;
