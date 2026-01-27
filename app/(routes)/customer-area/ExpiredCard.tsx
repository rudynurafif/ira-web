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
          Internet isolir
        </p>
      )}
      {userInfo?.status === "dismantled" && (
        <p className="text-sm sm:text-base font-bold text-[#D6211E] mb-2">
          Kamu Masuk Masa Dismantle
        </p>
      )}

      {/* Deskripsi */}
      {userInfo?.status === "suspend" && (
        <p className="text-sm sm:text-base  mb-6">
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
          <p className="text-sm sm:text-base">
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
        className="inline-flex justify-center items-center mt-4 gradient-box-expired rounded-full custom-click cursor-pointer"
        id="button-beli-paket-sekarang"
      >
        <div className="w-full relative flex justify-center items-center bg-subs-expired rounded-full h-12 md:h-14 overflow-hidden custom-bg-animation">
          {/* glossy highlight */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 fancy-background-expired w-[92%] h-6.5 rounded-full z-0" />

          <span className="relative z-10 text-white text-sm sm:text-base md:text-lg font-bold whitespace-nowrap px-6">
            Beli Paket Sekarang
          </span>
        </div>
      </button>
    </div>
  );
};

export default ExpiredCard;
