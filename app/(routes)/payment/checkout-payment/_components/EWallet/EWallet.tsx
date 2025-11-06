"use client";

import { EWalletPaymentData } from "@/app/_shared/types/payment";
import React, { useState } from "react";

const EWallet = ({ data }: { data: EWalletPaymentData }) => {
  const [checkOutUrl, setCheckOutUrl] = useState<string | null>(null);

  const handleOpenCheckoutUrl = () => {
    const url =
      data.desktop_web_checkout_url ??
      data.mobile_web_checkout_url ??
      data.qr_checkout_string ??
      data.mobile_deeplink_checkout_url ??
      undefined;

    setCheckOutUrl(url ?? null);

    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="mt-10">
      <h1 className="mb-3">{`E-Wallet (${data?.channel_code ?? "-"})`}</h1>
      <button
        type="button"
        onClick={handleOpenCheckoutUrl}
        className="bg-primary hover:bg-dark-primary-2 cursor-pointer rounded-lg font-bold text-white w-full text-sm sm:text-xl py-3"
      >
        Bayar Disini
      </button>
    </div>
  );
};

export default EWallet;
