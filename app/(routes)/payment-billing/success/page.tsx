"use client";
import FloatingNavbar from "@/app/_components/FloatingNavbar";
import Footer from "@/app/_components/layout/Footer";
import { dmSans } from "@/app/_shared/font/font";
import { convertToCurrency } from "@/app/_shared/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import personPayment from "@/public/assets/Images/person-payment-success.webp";
import { useAppSelector } from "@/app/store/store";

import { getPaymentStatusMicrosite } from "@/app/_api/Payment/Payment-Microsite";
import SkeletonLarge from "@/app/_components/skeletons/SkeletonLarge";
import Loader from "@/app/_components/Loader";

interface SuccessData {
  invoiceRef: string;
  customerId: string;
  description: string;
  paidAt: string;
  paymentMethod: string;
  amount: number;
  salesId?: string | null;
}

function Page() {
  const router = useRouter();
  const [data, setData] = useState<SuccessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useSearchParams();

  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);

  const salesIdFromUrl = params.get("sales_id");

  useEffect(() => {
    const verifyAndLoadData = async () => {
      setIsLoading(true);
      const raw = sessionStorage.getItem("paymentSuccessData");
      const customerCode = sessionStorage.getItem("customer_code");

      if (!raw) {
        toast.error("Data pembayaran tidak ditemukan");
        router.push("/payment-billing");
        return;
      }

      try {
        const parsedData = JSON.parse(raw);
        // Prioritaskan ID dari URL, jika kosong ambil dari session (back-up E-wallet)
        const finalSalesId = salesIdFromUrl || parsedData.salesId;

        // Jika data sudah punya expiry dan sudah lewat waktunya, hapus dan redirect
        const now = new Date().getTime();
        if (parsedData.expiry && now > parsedData.expiry) {
          sessionStorage.removeItem("paymentSuccessData");
          toast.error("Sesi pembayaran telah berakhir.");
          router.push("/payment-billing");
          return;
        }

        // Verifikasi real-time ke BE
        if (customerCode) {
          const res = await getPaymentStatusMicrosite({
            customer_code: customerCode,
            ...(finalSalesId && { mitra_user_id: finalSalesId }),
          });
          const isPaid = res?.data?.data;

          if (isPaid !== true) {
            toast.error("Pembayaran Anda belum terverifikasi oleh sistem");
            router.push("/payment-billing");
            return;
          }
        }

        // Jika SUKSES terverifikasi, set expiry jika belum ada (TTL: 10 menit)
        if (!parsedData.expiry) {
          parsedData.expiry = now + 60 * 60 * 1000; // 60 Menit dalam milliseconds
          sessionStorage.setItem(
            "paymentSuccessData",
            JSON.stringify(parsedData),
          );
        }

        setData(parsedData);
      } catch (error) {
        console.error("Gagal verifikasi pembayaran:", error);
        router.push("/payment-billing");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoadData();

    // // LOCK: Cegah Back Browser
    // window.history.pushState(null, "", window.location.href);
    // const handlePopState = () => {
    //   window.history.pushState(null, "", window.location.href);
    //   // Optional: beri toast kecil agar user tau kenapa dia ga bisa back
    //   toast("Transaksi selesai. Silakan masuk ke Dashboard.", { icon: "ℹ️" });
    // };

    // window.addEventListener("popstate", handlePopState);
    // return () => {
    //   window.removeEventListener("popstate", handlePopState);
    // };
  }, [router, salesIdFromUrl]);

  const rows = data
    ? [
        { label: "ID Pelanggan", value: data.customerId },
        { label: "Deskripsi", value: data.description },
        {
          label: "Tanggal Pembayaran",
          value: new Date(data.paidAt).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        { label: "Metode Pembayaran", value: data.paymentMethod },
        {
          label: "Total Pembayaran",
          value: convertToCurrency(data.amount),
        },
      ]
    : [];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={`bg-white min-h-screen w-full ${dmSans.className}`}>
      <FloatingNavbar />

      {/* BG merah di atas */}
      <div
        className="absolute top-0 left-0 w-full h-screen sm:h-[65vh] bg-cover bg-right bg-no-repeat z-0"
        style={{ backgroundImage: "url('/assets/Images/bg-register.png')" }}
      />

      <div className="relative z-10 px-4 md:px-6 pt-28 md:pt-36 pb-16">
        <div className="w-full max-w-[1100px] mx-auto">
          {/* Card — sama dengan RegistrationWizard */}
          <div className="w-full rounded-3xl md:rounded-[40px] bg-[#a80f0f] shadow-[0_20px_60px_rgba(164,18,18,0.4)] overflow-visible relative flex flex-col lg:flex-row min-h-[440px] border-2 border-white mb-10">
            {/* Person — overflow ke atas */}
            <div
              className="w-full lg:w-[40%] relative flex justify-center items-end min-h-[220px] md:min-h-[320px] lg:min-h-[440px] max-lg:mt-16"
              style={{ clipPath: "inset(-200% -200% 0 -200%)" }}
            >
              <div className="absolute inset-x-0 bottom-0 w-full flex justify-center lg:justify-end items-end h-full pointer-events-none">
                <Image
                  src={personPayment}
                  alt="Yeay Pembayaran Berhasil"
                  fill
                  className="object-contain object-bottom scale-110 lg:scale-100 transform origin-bottom lg:translate-y-[20px] drop-shadow-[5px_0_15px_rgba(0,0,0,0.4)]"
                  priority
                />
              </div>
            </div>

            {/* White card — detail pembayaran */}
            <div className="w-full max-sm:mt-[-20%] lg:w-[62%] flex justify-center items-center p-5 lg:p-8 max-lg:pt-0 relative">
              <div className="bg-white rounded-[24px] md:rounded-[32px] w-full shadow-2xl p-6 sm:p-8 border border-white/50">
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary text-center mb-6">
                  Yeay! Pembayaran Berhasil
                </h1>

                {data && (
                  <p className="text-sm  text-center mb-6">
                    Terima kasih! Tagihan Anda{" "}
                    <span className="font-semibold text-gray-900">
                      #{data.invoiceRef}
                    </span>{" "}
                    telah berhasil dibayar
                  </p>
                )}

                {/* Tabel detail */}
                <div className="space-y-3 text-sm mb-6">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[2fr_3fr] gap-2 py-1"
                    >
                      <span className="text-gray-700">{row.label}</span>
                      <span className="font-semibold text-gray-900">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    isLoggedIn
                      ? router.push("/customer-area")
                      : router.push("/auth/login")
                  }
                  className="w-full py-4 bg-primary hover:bg-dark-primary-2 text-white font-bold rounded-xl transition-colors"
                >
                  Masuk ke Area Pelanggan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Page;
