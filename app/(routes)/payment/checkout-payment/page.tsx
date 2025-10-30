"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import QRIS from "./_components/Qris/QRIS";
import VA from "./_components/VA/VA";
import { convertToCurrency } from "@/app/_shared/utils";
import Outlet from "./_components/Outlet/Outlet";

function Page() {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <div className="sm:px-2">
      {/* <Header /> */}
      <div className="max-w-4xl container mx-auto max-lg:px-4 py-5  w-full h-full min-h-screen">
        <div
          onClick={() => {
            router.replace('/payment');
          }}
          className="flex gap-2 cursor-pointer items-center w-fit"
        >
          <div>
            <MdOutlineKeyboardArrowLeft size={30} />
          </div>
          <div className="font-bold text-lg sm:text-[20px] md:text-[24px]">
            Pembayaran
          </div>
        </div>

        <div className="mt-5 bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)]  rounded-xl px-4 py-5">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>Deskripsi</div>
            <div className="text-right ">Pembayaran Paket 200 Mbps</div>

            <div>Subtotal</div>
            <div className="text-right">{convertToCurrency(100000)}</div>

            <div>Biaya Bank</div>
            <div className="text-right">{convertToCurrency(7000)}</div>
          </div>

          <div className="w-full h-px bg-[#C5C5C5] mt-3"></div>

          <div className="grid grid-cols-2 gap-y-2 text-sm pt-3">
            <div className="text-lg sm:text-xl">Total Pembayaran</div>
            <div className="text-right text-dark-primary-2 font-bold text-lg sm:text-2xl">
              {convertToCurrency(107000)}{" "}
            </div>
          </div>

          {params.get("type") &&
          params.get("type")?.toLowerCase() === "qris" ? (
            <QRIS />
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "va" ? (
            <VA />
          ) : params.get("type") &&
            params.get("type")?.toLowerCase() === "outlet" ? (
            <Outlet />
          ) : (
            ""
          )}

          <button
            type="button"
            onClick={() => {}}
            className="bg-orange mt-3 rounded-lg font-bold text-white w-full max-sm:text-sm py-3"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
