"use client";

import React, { useEffect, useState } from "react";

import toast from "react-hot-toast";
import {
  createPaymentRequestVA,
  createPaymentRequestEWallet,
  createPaymentRequestQRIS,
  createPaymentRequestOTC,
  getPaymentChannel,
  createPaymentRequestGopay,
  createPaymentRequestVAMidtrans,
  createPaymentRequestShopeePay,
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
import { checkPackage } from "@/app/_api/Customer/CustomerArea";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import Image from "next/image";
import limitImage from "@/public/assets/Images/limit-images.png";
import {
  checkPackageMicrosite,
  createPaymentRequestEWalletMicrosite,
  createPaymentRequestGopayMicrosite,
  createPaymentRequestOTCMicrosite,
  createPaymentRequestQRISMicrosite,
  createPaymentRequestShopeePayMicrosite,
  createPaymentRequestVAMicrosite,
  createPaymentRequestVAMidtransMicrosite,
} from "@/app/_api/Payment/Payment-Microsite";

// Mapping code API -> gambar lokal

const PaymentMehods = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [salesId, setSalesId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("sales_id");
    if (id) {
      setSalesId(id);
    }
  }, [searchParams]);

  const backToBillingUrl = salesId
    ? `/payment-billing?sales_id=${salesId}`
    : "/payment-billing";

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
    selectedChannelFromLS,
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
    selectedPackageFromSession,
  );
  const [isCreatePayment, setIsCreatePayment] = useState(false);
  const [openModalNotAllowed, setOpenModalNotAllowed] = useState(false);

  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     const currentPath = window.location.pathname;
  //     if (currentPath !== "/auth/login") {
  //       router.push(
  //         `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`,
  //       );
  //     } else {
  //       toast.error("Silahkan login terlebih dulu");
  //       router.push("/auth/login");
  //     }
  //   }
  // }, [isLoggedIn, router]);

  useEffect(() => {
    if (!selectedPackage) {
      toast.error("Informasi paket hilang, silakan pilih ulang.");
      if (isLoggedIn) {
        router.push("/payment");
      } else {
        router.replace(backToBillingUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, router, selectedPackage]);

  const handleCheckPackage = async (): Promise<boolean> => {
    try {
      const code = isLoggedIn
        ? userInfo?.customer_code
        : sessionStorage.getItem("customer_code");

      if (!isLoggedIn && (!code || code === "-")) {
        toast.error(
          "Identitas pelanggan tidak ditemukan. Silakan isi ulang data.",
        );
        router.replace(backToBillingUrl);
        return false;
      }

      const res = isLoggedIn
        ? await checkPackage()
        : await checkPackageMicrosite({
            payload: code,
            ...(salesId && { mitra_user_id: salesId }),
          });

      // Jika API mengembalikan false (berarti sedang aktif dan tidak boleh beli baru)
      if (res?.data?.data === false) {
        setOpenModalNotAllowed(true);
        return false;
      }
      return true;
    } catch (err) {
      toastErrorFromAPI(err);
      return false;
    }
  };

  useEffect(() => {
    const initPage = async () => {
      // Tunggu sampai status login stabil (isLoggedIn) atau data guest tersedia
      if (isLoggedIn || sessionStorage.getItem("customer_code")) {
        // Mencegah double fetch saat inisialisasi awal (jika data sudah ada atau sedang fetch)
        if (paymentChannels.length > 0) return;

        const isAllowed = await handleCheckPackage();
        if (isAllowed) {
          await getPaymentMethods();
        }
      }
    };

    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Filter by category
  const virtualAccounts = paymentChannels.filter(
    (ch) => ch.category === "va" && ch.is_active,
  );
  const ewallets = paymentChannels.filter(
    (ch) => ch.category === "ewallet" && ch.is_active,
  );
  const cardChannel = paymentChannels.filter(
    (ch) => ch.category === "card" && ch.is_active,
  );
  const qrisChannels = paymentChannels.filter(
    (ch) => ch.category === "qris" && ch.is_active,
  );
  const outlets = paymentChannels.filter(
    (ch) => ch.category === "otc" && ch.is_active,
  );

  const getPaymentMethods = async () => {
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

  const handleCreatePayment = async () => {
    if (!selectedChannel) return;

    if (!selectedPackage?.id) {
      toast.error("Data paket tidak ditemukan. Silakan pilih paket kembali.");
      router.push("/payment");
      return;
    }

    setIsCreatePayment(true);
    let navigated = false;

    try {
      // Pengecekan keamanan terakhir sebelum hit API bayar
      const isAllowed = await handleCheckPackage();
      if (!isAllowed) {
        return;
      }

      let createRes;

      const code = isLoggedIn
        ? userInfo?.customer_code
        : sessionStorage.getItem("customer_code");

      if (!code || code === "-") {
        toast.error(
          "Identitas pelanggan tidak ditemukan. Silakan isi ulang data.",
        );
        router.replace(backToBillingUrl);
        navigated = true;
        return;
      }

      let payload: any = {
        package_id: selectedPackage?.id,
        payment_channel_id: selectedChannel?.id,
        customer_code: code,
        ...(!isLoggedIn && salesId && { mitra_user_id: salesId }),
      };

      // Khusus untuk channel yang menggunakan gateway MIDTRANS
      if (selectedChannel.payment_gateway_id?.code === "MIDTRANS") {
        switch (selectedChannel.category) {
          case "va":
            createRes = isLoggedIn
              ? createPaymentRequestVAMidtrans(payload)
              : createPaymentRequestVAMidtransMicrosite(payload);
            break;
          case "ewallet":
            createRes = isLoggedIn
              ? createPaymentRequestGopay(payload)
              : createPaymentRequestGopayMicrosite(payload);
            break;
          default:
            throw new Error("Metode Pembayaran MIDTRANS Tidak Didukung");
        }
      }
      // else if (selectedChannel.payment_gateway_id?.code === "AIRPAY") {
      //   switch (selectedChannel.category) {
      //     case "ewallet":
      //       createRes = isLoggedIn
      //         ? createPaymentRequestShopeePay(payload)
      //         : createPaymentRequestShopeePayMicrosite(payload);
      //       break;
      //     default:
      //       throw new Error("Metode Pembayaran AIRPAY Tidak Didukung");
      //   }
      // }
      else if (selectedChannel.payment_gateway_id?.code === "XENDIT") {
        switch (selectedChannel.category) {
          case "va":
            createRes = isLoggedIn
              ? createPaymentRequestVA(payload)
              : createPaymentRequestVAMicrosite(payload);
            break;
          case "ewallet":
            createRes = isLoggedIn
              ? createPaymentRequestEWallet(payload)
              : createPaymentRequestEWalletMicrosite(payload);
            break;
          case "qris":
            createRes = isLoggedIn
              ? createPaymentRequestQRIS(payload)
              : createPaymentRequestQRISMicrosite(payload);
            break;
          case "otc":
            createRes = isLoggedIn
              ? createPaymentRequestOTC(payload)
              : createPaymentRequestOTCMicrosite(payload);
            break;
          case "card":
            toast.error(
              `Metode ${selectedChannel.category} belum tersedia. Gunakan Virtual Account atau QRIS untuk sekarang.`,
            );
            return;
          default:
            throw new Error("Metode Pembayaran Tidak Didukung");
        }
      } else {
        throw new Error("Gateway Pembayaran Tidak Didukung");
      }

      const paymentReqID = (await createRes)?.data?.data?.id;
      sessionStorage.setItem(
        "paymentInfo",
        JSON.stringify((await createRes).data.data),
      );

      if ((await createRes).data?.statusCode === 200) {
        const data = (await createRes).data.data;

        const url =
          data.desktop_web_checkout_url ??
          data.mobile_web_checkout_url ??
          data.qr_checkout_string ??
          data.mobile_deeplink_checkout_url ??
          undefined;

        if (selectedChannel.category !== "ewallet") {
          let nextPath = `/payment/checkout-payment?id=${paymentReqID}&type=${selectedChannel?.category}&selected_payment=${selectedChannel?.code}`;

          if (salesId) {
            nextPath += `&sales_id=${salesId}`;
          }

          router.push(nextPath);
          navigated = true;
        } else if (selectedChannel.category === "ewallet" && url) {
          // ─── GUEST FLOW SUCCESS DATA ──────────────────────────────────────────
          // Simpan data pembayaran ke sessionStorage sebelum redirect ke Xendit.
          // Ini digunakan oleh interseptor di /auth/login untuk meneruskan user
          // non-login langsung ke halaman sukses pembayaran (/payment-billing/success).
          if (!isLoggedIn) {
            const cid = sessionStorage.getItem("customer_code") || "-";
            sessionStorage.setItem(
              "paymentSuccessData",
              JSON.stringify({
                invoiceRef: data.reference_id || data.id || "-",
                customerId: cid,
                description: selectedPackage?.name || "-",
                paidAt: new Date().toISOString(),
                paymentMethod: selectedChannel.name || "E-Wallet",
                amount: Number(data.amount) || selectedPackage?.price || 0,
                salesId: salesId, // Simpan ID Sales di sini biar gak hilang
              }),
            );
            console.log("Guest payment data saved for success redirect.");
          }

          window.location.href = url;
          navigated = true;
          // window.open(url, "_blank");
        } else {
          toast.error(
            "Terjadi kesalahan, gagal mendapatkan checkout URL e-wallet",
          );
        }
      }

      if (!paymentReqID) {
        throw new Error("Gagal mendapatkan ID pembayaran");
      }
    } catch (error: any) {
      toastErrorFromAPI(error, "Terjadi kesalahan saat memproses pembayaran");
    } finally {
      if (!navigated) {
        setIsCreatePayment(false);
      }
    }
  };

  if (isLoading) return <ChannelsSkeleton />;

  return (
    <div className="container mx-auto my-8 sm:p-6 ">
      <div className="relative flex items-center mb-6 max-sm:mx-4">
        <MdOutlineKeyboardArrowLeft
          className="cursor-pointer shrink-0"
          onClick={() => router.back()}
          size={30}
        />
        <h2 className="absolute left-1/2 -translate-x-1/2 sm:text-3xl text-xl font-bold text-old-primary whitespace-nowrap">
          Metode Pembayaran
        </h2>
      </div>
      {/* Modal Header */}
      <div className="bg-white  max-sm:mx-3">
        {/* Virtual Account */}
        <div className="mb-6 rounded-xl sm:shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            Virtual Account
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {virtualAccounts.length > 0 ? (
              virtualAccounts.map((channel) => {
                const Logo = process.env.NEXT_PUBLIC_URL_OBS + channel.logo;
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel),
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
        <div className="mb-6 rounded-xl sm:shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            E-Wallet
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {ewallets.length > 0 ? (
              ewallets.map((channel) => {
                const Logo = process.env.NEXT_PUBLIC_URL_OBS + channel.logo;
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel),
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
                const Logo = process.env.NEXT_PUBLIC_URL_OBS + channel.logo;
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
        <div className="mb-6 rounded-xl sm:shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            QRIS
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {qrisChannels.length > 0 ? (
              qrisChannels.map((channel) => {
                const Logo = process.env.NEXT_PUBLIC_URL_OBS + channel.logo;
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel),
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
        <div className="mb-6  rounded-xl sm:shadow-lg p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-spectrum-800 mb-3">
            Outlet
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {outlets.length > 0 ? (
              outlets.map((channel) => {
                const Logo = process.env.NEXT_PUBLIC_URL_OBS + channel.logo;
                return (
                  <ButtonChannel
                    key={channel.id}
                    channel={channel}
                    Logo={Logo}
                    handleClick={() => {
                      setSelectedChannel(channel);
                      sessionStorage.setItem(
                        "selectedPaymentMethod",
                        JSON.stringify(channel),
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
          onClick={handleCreatePayment}
          disabled={isCreatePayment}
          className="w-full mt-4 text-base sm:text-xl cursor-pointer sm:py-4 py-2 bg-primary text-white font-semibold rounded-full sm:rounded-lg hover:bg-dark-primary-2 transition disabled:cursor-not-allowed! disabled:bg-slate-400"
        >
          <span>{isCreatePayment ? "Mohon menunggu.." : "Bayar"}</span>
        </button>
      </div>

      {/* modal ketika paket masih aktif */}
      {openModalNotAllowed && (
        <ModalTemplate
          closeModal={() => {
            setOpenModalNotAllowed(false);
            if (isLoggedIn) {
              router.push("/customer-area");
            } else {
              router.replace(backToBillingUrl);
            }
          }}
        >
          <div className="p-6 mt-6">
            <div className="flex justify-center">
              <Image
                src={limitImage}
                width={170}
                height={170}
                alt="limit-image"
              />
            </div>

            <h3 className="text-2xl font-bold text-center text-primary mt-6">
              Paket Anda Masih Aktif
            </h3>

            <div className="mt-4">
              <p className="text-center">
                Anda tidak dapat membeli paket selama paket masih aktif
              </p>
            </div>

            <button
              className="w-full mt-4 text-base sm:text-xl cursor-pointer sm:py-4 py-2 bg-primary text-white font-semibold rounded-full sm:rounded-lg hover:bg-dark-primary-2 transition disabled:cursor-not-allowed! disabled:bg-slate-400"
              onClick={() => {
                setOpenModalNotAllowed(false);
                if (isLoggedIn) {
                  router.push("/customer-area");
                } else {
                  router.replace(backToBillingUrl);
                }
              }}
            >
              Oke, Mengerti
            </button>
          </div>
        </ModalTemplate>
      )}
    </div>
  );
};

export default PaymentMehods;
