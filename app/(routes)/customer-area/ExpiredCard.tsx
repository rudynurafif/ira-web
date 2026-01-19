import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Image from "next/image";
import React from "react";
import expiredIcon from "@/public/assets/Images/internet-mati.png";
import { formattedDate } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/store";

const ExpiredCard = ({
  data,
  isDismantled,
}: {
  data?: SubscriptionHistoryAPI | null;
  isDismantled?: boolean;
}) => {
  const router = useRouter();

  const { userInfo, is_coverage } = useAppSelector((state) => state.auth);

  return (
    <div className="text-center py-6 px-4 bg-linear-to-b from-white via-white to-[#D6211E] rounded-xl shadow-lg">
      {/* Ikon Peringatan Besar */}
      <div className="flex justify-center mb-4">
        <Image
          src={expiredIcon} // Gunakan exclamationIcon atau expiredIcon, sesuaikan visual
          width={120}
          height={120}
          alt="warning-icon"
          className="animate-pulse"
        />
      </div>

      {/* Judul Utama */}
      {userInfo?.status === "suspend" && (
        <p className="text-sm sm:text-base font-bold text-[#D6211E] mb-2">
          Internet isolir — Bayar paket untuk aktif kembali.
        </p>
      )}
      {userInfo?.status === "dismantled" && (
        <p className="text-sm sm:text-base font-bold text-[#D6211E] mb-2">
          Kamu Masuk Masa Dismantle
        </p>
      )}

      {/* Deskripsi */}
      {userInfo?.status === "suspend" && (
        <p className="text-xs sm:text-sm  mb-6">
          Internet nonaktif sementara karena masa aktif sudah berakhir pada{" "}
          <span className="font-bold">
            {formattedDate(data?.end_date ?? "") ?? "-"}
          </span>
          . Pilih dan bayar paket yang kamu inginkan agar koneksi Internet
          Rakyat segera aktif kembali; hubungi bantuan jika membutuhkan panduan.
        </p>
      )}
      {userInfo?.status === "dismantled" && (
        <div className="mb-6">
          <p className="text-xs sm:text-sm">
            Paket internet kamu sudah tidak aktif selama lebih dari 1 bulan
            karena belum diperpanjang.
          </p>
          <p className="font-bold text-sm">
            Segera perpanjang atau beli paket agar internet kembali aktif.
          </p>
        </div>
      )}

      {/* Tombol CTA */}
      <button
        onClick={() => router.push("/payment")}
        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-md"
      >
        Beli Paket Sekarang
      </button>
    </div>
  );
};

export default ExpiredCard;
