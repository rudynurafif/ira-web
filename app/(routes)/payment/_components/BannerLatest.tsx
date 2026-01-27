"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import { useEffect, useState } from "react";
import { toastErrorFromAPI } from "@/app/_shared/utils";

const BannerLatest = () => {
  const [activePacketData, setActivePacketData] =
    useState<SubscriptionHistoryAPI | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchActivePackage = async () => {
      try {
        const res = await getCustomerPackage({
          page: 1,
          pageSize: 1,
        });
        const data = res.data?.data || [];
        if (data[0]) {
          const isActive = data[0].start_date && data[0].end_date;
          setActivePacketData(isActive ? data[0] : null);
        }
      } catch (err) {
        toastErrorFromAPI(err);
      }
    };

    fetchActivePackage();
  }, []);

  const handleClick = () => {
    // router.push("/packages");
    toast.success("Fitur ini akan segera hadir!");
  };

  return (
    <div className="relative hidden xl:block w-full overflow-hidden rounded-3xl bg-[url('/assets/Images/bg-latest-package.png')] bg-cover bg-center text-white shadow-xl">
      {/* Konten */}
      <div className="relative z-10 flex flex-col lg:flex-row align-top gap-2 pt-8 px-12 pb-0">
        {/* LEFT — TEXT */}
        <div className="flex w-1/3 flex-col gap-4 pt-8">
          <h1 className="text-[44px] font-black  test">
            Yuk, Beli Paket
            <br />
            Internet Lagi!
          </h1>
          <p className="text-sm sm:text-base mb-6 leading-relaxed text-white/95">
            Untuk menambah masa aktif internet kamu!
            <br />
            Dengan beli paket baru sekarang, kamu bisa terus menikmati layanan
            tanpa gangguan.
          </p>
        </div>

        {/* CENTER — WOMAN IMAGE */}
        <div className="flex w-1/3 justify-center items-end self-end">
          <Image
            src="/assets/Images/banner-woman-crop.png"
            alt="banner-lastest-package"
            width={360}
            height={360}
            priority
            className="m-0! p-0! object-contain! block"
          />
        </div>

        {/* RIGHT — CARD + BUTTON */}
        <div className="flex w-1/3 flex-col gap-4 items-center  mb-6">
          <h3 className="font-black text-3xl test tracking-wide drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] whitespace-nowrap text-balance text-[clamp(20px,2vw,30px)]">
            Paket Yang Terakhir Dibeli
          </h3>

          {/* CARD */}
          <div className="w-full max-w-105">
            <div className="rounded-2xl overflow-hidden bg-white shadow-[0_14px_30px_rgba(0,0,0,0.25)]">
              {/* Header merah */}
              <div className="bg-gradient-red py-2.5 text-center text-base font-semibold tracking-wide uppercase">
                {activePacketData ? activePacketData.package_id.name : "Speed"}
              </div>

              {/* Isi */}
              <div className=" bg-[#dd7070]">
                <div className="px-5 pt-4 pb-3 flex justify-evenly ">
                  <div className="flex flex-col text-xs text-white items-center gap-1">
                    <span className="text-black">Internet sampai dengan</span>
                    <span className="text-[30px] font-extrabold leading-none">
                      {activePacketData
                        ? activePacketData.package_id.speed_mbps
                        : "100"}{" "}
                      <span className="text-base font-semibold">Mbps</span>
                    </span>
                  </div>

                  <div className="flex flex-col text-xs text-white items-center gap-1">
                    <span className="text-black">Harga</span>
                    <span className="text-[30px] font-extrabold leading-none">
                      <span className="text-base font-semibold align-top">
                        Rp{" "}
                      </span>
                      {activePacketData
                        ? activePacketData.package_id.price
                            .toLocaleString("id-ID")
                            .replace(/,/g, ".")
                        : "0"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-evenly bg-white border-t border-gray-100 py-2 text-[10px] font-medium">
                  <div className="flex items-center gap-1.5 text-black">
                    <Image
                      src="/assets/Icons/icon-checklist.svg"
                      alt="ico-checklist"
                      width={18}
                      height={18}
                    />
                    <div className="font-bold">
                      <span className="text-gradient-red">GRATIS</span> SEWA
                      MODEM
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-black">
                    <Image
                      src="/assets/Icons/icon-checklist.svg"
                      alt="ico-checklist"
                      width={18}
                      height={18}
                    />
                    <div className="font-bold">
                      <span className="text-gradient-red">UNLIMITED</span> DATA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            // onClick={handleClick}
            className="w-full button-perpanjang text-xl text-primary font-bold"
          >
            Perpanjang Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerLatest;
