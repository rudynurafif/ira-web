"use client";

import React, { useEffect, useState } from "react";

import toast from "react-hot-toast";
import {
  createPaymentRequestEWallet,
  createPaymentRequestOTC,
  createPaymentRequestQRIS,
  createPaymentRequestVA,
  getPaymentChannel,
} from "@/app/_api/Payment/Payment";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentChannel } from "@/app/_shared/types/payment";
import { useAppSelector } from "@/app/store/store";
import ChannelsSkeleton from "../_components/ChannelsSkeleton";
import ButtonChannel from "../_components/ButtonChannel";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { PAYMENT_LOGOS } from "@/app/_shared/data/payment";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import { PackageData } from "@/app/_shared/types/customer-area";

// Mapping code API -> gambar lokal

const PaymentMehods = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const selectedChannelFromLS = (() => {
    if (typeof window === "undefined") return null;
    const item = sessionStorage.getItem("selectedPaymentMethod");
    if (!item) return null;
    try {
      return JSON.parse(item) as PaymentChannel;
    } catch {
      return null;
    }
  })();
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(
    selectedChannelFromLS
  );
  const selectedPackageFromSession = (() => {
    if (typeof window === "undefined") return null;
    const item = sessionStorage.getItem("selectedPackage");
    if (!item) return null;
    try {
      return JSON.parse(item) as PackageData;
    } catch {
      return null;
    }
  })();
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    selectedPackageFromSession
  );
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const [isCreatePayment, setIsCreatePayment] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      const currentPath = window.location.pathname;
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

  // Filter by category
  const virtualAccounts = paymentChannels.filter(
    (ch) => ch.category === "va" && ch.is_active
  );
  const ewallets = paymentChannels.filter(
    (ch) => ch.category === "ewallet" && ch.is_active
  );
  const cardChannel = paymentChannels.filter(
    (ch) => ch.category === "card" && ch.is_active
  );
  const qrisChannels = paymentChannels.filter(
    (ch) => ch.category === "qris" && ch.is_active
  );
  const outlets = paymentChannels.filter(
    (ch) => ch.category === "otc" && ch.is_active
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentChannel({});

      if (res?.data?.data) {
        const allChannels: PaymentChannel[] = [
          ...(res.data.data.va || []),
          ...(res.data.data.ewallet || []),
          ...(res.data.data.card || []),
          ...(res.data.data.qris || []),
          ...(res.data.data.otc || []),
        ];
        setPaymentChannels(allChannels ?? []);
      }
    } catch (error: any) {
      toastErrorFromAPI(error, "Gagal muat daftar metode pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const handleCreatePayment = async () => {
    if (!selectedChannel) return;
    setIsCreatePayment(true);

    try {
      let createRes;

      const payload = {
        package_id: selectedPackage?.id,
        payment_channel_id: selectedChannel?.id,
      };

      switch (selectedChannel.category) {
        case "va":
          createRes = createPaymentRequestVA(payload);
          break;
        case "qris":
          createRes = createPaymentRequestQRIS(payload);
          break;
        case "ewallet":
          createRes = createPaymentRequestEWallet(payload);
          break;
        case "otc":
          createRes = createPaymentRequestOTC(payload);
          break;
        case "card":
          toast.error(
            `Metode ${selectedChannel.category} belum tersedia. Gunakan Virtual Account atau QRIS untuk sekarang.`
          );
          return;
        default:
          throw new Error("Metode Pembayaran Tidak Didukung");
      }

      const paymentReqID = (await createRes)?.data?.data?.id;
      sessionStorage.setItem(
        "paymentInfo",
        JSON.stringify((await createRes).data.data)
      );

      if (!paymentReqID) {
        throw new Error("Gagal mendapatkan ID pembayaran");
      }

      router.push(
        `/payment/checkout-payment?id=${paymentReqID}&type=${selectedChannel?.category}&selected_payment=${selectedChannel?.code}`
      );
    } catch (error: any) {
      toastErrorFromAPI(error, "Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setIsCreatePayment(false);
    }
  };

  if (isLoading) return <ChannelsSkeleton />;

  return (
    <div className="container mx-auto my-8 p-6">
      <div className="flex gap-2 items-center mb-6">
        <MdOutlineKeyboardArrowLeft
          className="cursor-pointer w-fit"
          onClick={() => router.back()}
          size={30}
        />
        <h2 className="sm:text-3xl text-xl font-bold text-gray-800">
          Metode Pembayaran
        </h2>
      </div>
      {/* Modal Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ">
        {/* Virtual Account */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            Virtual Account
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {virtualAccounts.length > 0 ? (
              virtualAccounts.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel)
                      );
                    }}
                    selected={selectedChannel?.id === channel.id}
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

        {/* E-Wallet */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            E-Wallet
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {ewallets.length > 0 ? (
              ewallets.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel)
                      );
                    }}
                    selected={selectedChannel?.id === channel.id}
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

        {/* Card */}
        {/* <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            Cards
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {cardChannel.length > 0 ? (
              cardChannel.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => setSelectedChannel(channel)}
                    selected={selectedChannel?.id === channel.id}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 col-span-2 text-sm">
                Tidak ada e-wallet tersedia
              </p>
            )}
          </div>
        </div> */}

        {/* QRIS */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            QRIS
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {qrisChannels.length > 0 ? (
              qrisChannels.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel)
                      );
                    }}
                    selected={selectedChannel?.id === channel.id}
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

        {/* Outlet */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            Outlet
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {outlets.length > 0 ? (
              outlets.map((channel) => {
                const Logo = PAYMENT_LOGOS[channel.code];
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel)
                      );
                    }}
                    selected={selectedChannel?.id === channel.id}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada outlet tersedia</p>
            )}
          </div>
        </div>

        <button
          disabled={!selectedChannel || isCreatePayment}
          // onClick={() => router.push("/payment")}
          onClick={handleCreatePayment}
          className="w-full mt-4 text-base sm:text-xl cursor-pointer sm:py-4 py-2 bg-primary text-white font-semibold rounded-full sm:rounded-lg hover:bg-dark-primary-2 transition disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isCreatePayment ? "Mohon menunggu.." : "Bayar"}
        </button>
      </div>
    </div>
  );
};

export default PaymentMehods;
