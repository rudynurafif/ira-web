"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// Import semua gambar
import {
  bni,
  bjb,
  bri,
  bsi,
  cimb,
  mandiri,
  permata,
  qris,
  gopay,
  dana,
  ovo,
  indomaret,
  // alfamart,
  astraPay,
  bnc,
  linkAja,
  muamalat,
} from "@/public/assets/Images/bank";

import toast from "react-hot-toast";
import {
  createPaymentRequest,
  getPaymentChannel,
} from "@/app/_api/Payment/Payment";
import { useRouter } from "next/navigation";
import ChannelsSkeleton from "./_components/ChannelsSkeleton";
import ButtonChannel from "./_components/ButtonChannel";
import { PaymentChannel } from "@/app/_shared/types/payment";
import { useAppSelector } from "@/app/store/store";

// Mapping code API -> gambar lokal
const PAYMENT_LOGOS: Record<string, any> = {
  // Virtual Account
  BNI_VIRTUAL_ACCOUNT: bni,
  BJB_VIRTUAL_ACCOUNT: bjb,
  BRI_VIRTUAL_ACCOUNT: bri,
  BSI_VIRTUAL_ACCOUNT: bsi,
  CIMB_VIRTUAL_ACCOUNT: cimb,
  MANDIRI_VIRTUAL_ACCOUNT: mandiri,
  PERMATA_VIRTUAL_ACCOUNT: permata,
  BNC_VIRTUAL_ACCOUNT: bnc,
  MUAMALAT_VIRTUAL_ACCOUNT: muamalat,

  // E-Wallet
  GOPAY: gopay,
  DANA: dana,
  OVO: ovo,
  // SHOPEEPAY: qris,

  // Outlet
  INDOMARET: indomaret,
  // ALFAMART: alfamart,

  // QRIS
  QRIS: qris,
};

const Payment = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>();
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentChannel({});

      if (res?.data?.data) {
        setPaymentChannels(res.data.data);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Gagal memuat metode pembayaran"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      const currentPath = window.location.pathname;
      // Jangan simpan callback ke login atau auth
      if (currentPath !== "/auth/login") {
        router.push(
          `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`
        );
      } else {
        toast.error("Silahkan login terlebih dulu");
        router.push("/auth/login");
      }
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // Filter by category
  const virtualAccounts = paymentChannels.filter(
    (ch) => ch.category === "va" && ch.is_active
  );
  const qrisChannels = paymentChannels.filter(
    (ch) => ch.category === "qris" && ch.is_active
  );
  const ewallets = paymentChannels.filter(
    (ch) => ch.category === "ewallet" && ch.is_active
  );
  const outlets = paymentChannels.filter(
    (ch) => ch.category === "otc" && ch.is_active
  );

  const handleCreatePayment = async () => {
    try {
      const createRes = await createPaymentRequest({
        payment_channel_id: selectedChannel?.id,
        package_id: "54d196c8-bed4-427e-b248-9d9e8ca75084",
      });

      const paymentReqID = createRes.data.payment_request_id;

      router.push(
        `/payment/checkout-payment?type=${selectedChannel?.category}&selected_payment=${selectedChannel?.code}`
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat memproses pembayaran"
      );
    }
  };

  if (isLoading) return <ChannelsSkeleton />;

  return (
    <div className="container mx-auto my-8 p-6">
      {/* Modal Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl max-sm:text-center font-bold text-gray-800 mb-6">
          Metode Pembayaran
        </h2>

        {/* Virtual Account */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            Virtual Account
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {virtualAccounts.length > 0 ? (
              virtualAccounts.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => setSelectedChannel(channel)}
                    selected={selectedChannel === channel}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 col-span-3 text-sm">
                Tidak ada virtual account tersedia
              </p>
            )}
          </div>
        </div>

        {/* QRIS */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            QRIS
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {qrisChannels.length > 0 ? (
              qrisChannels.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => setSelectedChannel(channel)}
                    selected={selectedChannel === channel}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 col-span-2 text-sm">
                Tidak ada QRIS tersedia
              </p>
            )}
          </div>
        </div>

        {/* E-Wallet */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            E-Wallet
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ewallets.length > 0 ? (
              ewallets.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => setSelectedChannel(channel)}
                    selected={selectedChannel === channel}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 col-span-2 text-sm">
                Tidak ada e-wallet tersedia
              </p>
            )}
          </div>
        </div>

        {/* Outlet */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            Outlet
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {outlets.length > 0 ? (
              outlets.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => setSelectedChannel(channel)}
                    selected={selectedChannel === channel}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada outlet tersedia</p>
            )}
          </div>
        </div>

        <button
          disabled={!selectedChannel}
          onClick={() => handleCreatePayment()}
          className="w-full text-base sm:text-xl cursor-pointer py-4 bg-primary text-white font-semibold rounded-lg hover:bg-dark-primary-2 transition disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {selectedChannel ? "Selanjutnya" : "Pilih Metode Pembayaran"}
        </button>
      </div>
    </div>
  );
};

export default Payment;
