import { useRouter } from "next/navigation";
import React from "react";
import checkoutQris from "@/public/assets/checkout-payment/checkout-qris.png";
import Image from "next/image";

function QRIS() {
  const router = useRouter();
  return (
    <div>
      <div className="mt-4 w-full bg-[#F7F9FD] border border-[#949AA3] rounded-[12px] p-5">
        <div className="flex justify-center">
          <Image
            src={checkoutQris}
            alt="QRIS"
            width={500}
            height={500}
            className="w-[234px] h-full"
          />
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={() => {}}
            className="bg-dark-primary-2 rounded-[8px] text-white font-bold w-full max-sm:text-sm py-3"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRIS;
