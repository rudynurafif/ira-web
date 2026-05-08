"use client";
import FloatingNavbar from "@/app/_components/FloatingNavbar";
import Footer from "@/app/_components/layout/Footer";
import { dmSans } from "@/app/_shared/font/font";
import { convertToCurrency } from "@/app/_shared/utils";
import PackageCardMobile from "@/app/(routes)/payment/_components/PackageCardMobile";
import { LuPackageX } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import bannerPerpanjang from "@/public/assets/Images/banner-perpanjang-paket.png";
import bannerPerpanjangMobile from "@/public/assets/Images/banner-perpanjangan-paket-mobile.png";

function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const salesId = searchParams.get("sales_id");

  const [dataPayment, setDataPayment] = useState<any>(null);
  const [listPackage, setListPackage] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [agreed, setAgreed] = useState<boolean>(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("dataPayment");
    const rawList = sessionStorage.getItem("listPackage");
    const rawSelected = sessionStorage.getItem("selectedPackage");

    if (!raw) {
      toast.error("Data tidak ditemukan. Silakan ulangi.");
      router.back();
      return;
    }

    setDataPayment(JSON.parse(raw));
    setListPackage(rawList ? JSON.parse(rawList) : []);
    setSelectedPackage(rawSelected ? JSON.parse(rawSelected) : null);
  }, [router]);

  function handleNext() {
    // selectedPackage sudah tersimpan di sessionStorage, langsung navigate
    const nextPath = salesId
      ? `/payment/payment-methods?sales_id=${salesId}`
      : "/payment/payment-methods";

    router.push(nextPath);
  }

  return (
    <div className={`bg-white min-h-screen w-full ${dmSans.className}`}>
      <div className="max-w-[700px] mx-auto px-4 py-8">
        {/* Header row */}
        <div className="relative flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            ← <span className="hidden md:block">Kembali</span>
          </button>
          <h1 className="absolute text-old-primary left-1/2 -translate-x-1/2 text-xl font-bold text-center whitespace-nowrap">
            Konfirmasi Pembayaran
          </h1>
        </div>

        {/* Banner — desktop */}
        <div className="w-full rounded-2xl overflow-hidden mb-6 hidden md:block">
          <Image
            src={bannerPerpanjang}
            alt="Yuk Beli Paket Internet Lagi"
            width={1200}
            height={300}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
        {/* Banner — mobile */}
        <div className="w-full rounded-2xl overflow-hidden mb-6 md:hidden">
          <Image
            src={bannerPerpanjangMobile}
            alt="Yuk Beli Paket Internet Lagi"
            width={700}
            height={300}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* Customer Info Card */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-4 shadow-lg">
          <h2 className="font-bold text-base text-gray-900 mb-4">
            Informasi Data Pelanggan
          </h2>
          <div className="space-y-3 text-sm">
            {[
              {
                label: "ID Pelanggan",
                value: dataPayment?.customer_code ?? "-",
              },
              {
                label: "Nama Pelanggan",
                value: dataPayment?.name ?? "-",
              },
              {
                label: "Nomor Handphone Pelanggan",
                value: dataPayment?.phone_number ?? "-",
              },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-[1fr_2fr] gap-2">
                <span className="text-gray-600">{row.label}</span>
                <span className="font-semibold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Package Card */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-6 shadow-lg">
          <h2 className="font-bold text-base text-gray-900 mb-4">
            Paket yang Terakhir Dibeli
          </h2>
          {listPackage.length > 0 ? (
            <div className="space-y-3">
              {listPackage.map((item: any) => (
                <PackageCardMobile
                  key={item.id}
                  pkg={item}
                  selected={selectedPackage?.id === item.id}
                  onSelect={(pkg) => {
                    setSelectedPackage(pkg);
                    sessionStorage.setItem(
                      "selectedPackage",
                      JSON.stringify(pkg),
                    );
                  }}
                  convertToCurrency={convertToCurrency}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <LuPackageX
                color="red"
                className="w-12 h-12 mx-auto mb-2 opacity-70"
              />
              <p className="text-red-500 font-semibold">
                Tidak Ada Paket Tersedia
              </p>
            </div>
          )}
        </div>

        {/* Checkbox T&C */}
        <div className="flex items-start gap-3 mb-6">
          <input
            id="agree-tnc"
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-5 h-5 mt-0.5 accent-primary cursor-pointer shrink-0"
          />
          <label
            htmlFor="agree-tnc"
            className="text-sm text-gray-700 cursor-pointer select-none"
          >
            Dengan ini saya setuju dengan{" "}
            <Link
              href="/terms-and-condition"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-semibold"
            >
              Syarat dan Ketentuan
            </Link>{" "}
            serta{" "}
            <Link
              href="/privacy-and-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-semibold"
            >
              Kebijakan Privasi
            </Link>{" "}
            yang berlaku
          </label>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNext}
          disabled={!agreed || !selectedPackage}
          className={`w-full py-4 rounded-full sm:rounded-2xl text-white font-bold text-base transition-all ${
            agreed && selectedPackage
              ? "bg-primary hover:bg-dark-primary-2 shadow-lg"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Pilih Metode Pembayaran
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Page;
