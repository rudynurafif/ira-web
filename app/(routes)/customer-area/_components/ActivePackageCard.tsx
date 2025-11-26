import React from "react";
import Image from "next/image";
import { FaChevronRight, FaStar } from "react-icons/fa";
import { PackageData } from "@/app/_shared/types/customer-area";
import logoIra from "@/public/assets/Icons/Logo-Ira-Red.svg";
import confetti from "@/public/assets/Icons/confetti.svg";
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
    <div className="bg-linear-to-b from-white via-white to-[#FFDCDC] rounded-xl shadow-lg p-6 max-sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Logo */}
        <div className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center">
          <Image src={logoIra} alt="IRA Icon" width={28} height={28} />
        </div>

        <div>
          <h3 className="sm:text-xl font-bold text-black">
            {data.package_id.name ?? "-"}
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
        <Image
          src={confetti}
          width={24}
          height={24}
          alt="confetti"
          className="mb-1"
        />
        <p className="sm:text-sm text-xs font-bold text-gray-700">
          Selamat paket {data.package_id.name ?? "-"} baru kamu sudah aktif!
        </p>
        {status === "active" && (
          <p className="sm:text-sm text-xs text-gray-700 mt-1">
            Nikmati kecepatan hingga{" "}
            <strong>{data.package_id.speed_mbps ?? "-"} Mbps</strong> penuh dan
            koneksi stabil selama <strong>{days}</strong> hari ke depan.
          </p>
        )}
        {status === "expires_today" && (
          <p className="sm:text-sm text-xs text-gray-700 mt-1">
            Paket <strong>{data.package_id.name ?? "-"}</strong> berakhir{" "}
            <strong>hari ini</strong>. Perpanjang sekarang agar layanan tetap
            aktif.
          </p>
        )}
        {status === "expired" && (
          <p className="sm:text-sm text-xs text-gray-700 mt-1">
            Masa aktif paket telah <strong>berakhir</strong>. Silakan perpanjang
            untuk mengaktifkan kembali internet.
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 my-6"></div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:gap-10 gap-2">
        {/* Harga Paket */}
        <div className="flex flex-col items-start gap-3">
          <Image src={packageIcon} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Harga Paket</p>
            <p className="sm:text-lg text-base">
              {convertToCurrency(data.package_id.price) ?? "-"}
            </p>
          </div>
        </div>

        {/* Sisa Hari */}
        <div className="flex flex-col items-start gap-3">
          <Image src={sandClock} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Sisa Hari</p>
            <p className="sm:text-lg text-base">{label}</p>
          </div>
        </div>

        {/* Kecepatan Paket */}
        <div className="flex flex-col items-start gap-3">
          <Image src={rocket} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">Kecepatan Paket</p>
            <p className="sm:text-lg text-base">{data.package_id.speed_mbps ?? "-"}Mpbs</p>
          </div>
        </div>

        {/* Tanggal Jatuh Tempo */}
        <div className="flex flex-col items-start gap-3">
          <Image src={calendar} alt="packageIcon" />
          <div>
            <p className="text-xs font-bold mb-2 mt-3">
              Tanggal Berakhir Paket
            </p>
            <p className="sm:text-lg text-base">{formattedDate(data.end_date) ?? "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePackageCard;
