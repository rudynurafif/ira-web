"use client";

import { useEffect, useState } from "react";
import CustomerHeader from "./_components/CustomerHeader";
import PackageAndHistory from "./_components/PackageAndHistory";
import PersonalData from "./_components/PersonalData";
import DeliveryTracking from "./_components/DeliveryTracking";
import { getInitials, toastErrorFromAPI } from "@/app/_shared/utils";
import { useRouter, useSearchParams } from "next/navigation";
import SkeletonBase from "@/app/_components/skeletons/SkeletonBase";
import SkeletonLarge from "@/app/_components/skeletons/SkeletonLarge";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import successAnimation from "@/public/assets/Icons/SuccessAnimation.json";
import failedAnimation from "@/public/assets/Icons/FailedAnimation.json";

import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import Lottie from "lottie-react";
import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import toast from "react-hot-toast";
import { setShipmentStatus } from "@/app/store/slice/authSlice";
import DeviceInformation from "./_components/DeviceInformation";
import Image from "next/image";
import iraLogo from "@/public/assets/Images/LogoIra.png";
import CpeActivationStatus from "./_components/CpeActivation";
import Link from "next/link";
import { FaSearchLocation } from "react-icons/fa";
import { MdHeadsetMic } from "react-icons/md";

export default function AreaPelanggan() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userInfo, isLoggedIn, shipmentStatus, is_coverage } = useAppSelector(
    (state) => state.auth
  );
  const [tabs, setTabs] = useState([
    "Informasi Paket dan Riwayat",
    "Data Pribadi",
  ]);

  const initialTab = searchParams.get("tab") || "Informasi Paket dan Riwayat";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [animationData, setAnimationData] = useState<any>();
  const [successPayment, setSuccessPayment] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState(false);
  const isCancelled = userInfo?.status === "canceled-instalation";
  const dispatch = useAppDispatch();
  const [subscriptionHistory, setSubscriptionHistory] =
    useState<SubscriptionHistoryAPI[]>();

  const fetchData = async () => {
    try {
      const resSubHistory = await getCustomerPackage({});
      const data = resSubHistory.data?.data;
      setSubscriptionHistory(data);

      const hasStartDate = Boolean(data?.[0]?.start_date);
      const active = userInfo && userInfo?.status === "active";
      if (active) setIsActive(active);

      if (hasStartDate && active) {
        setTabs((prev) =>
          prev.includes("Informasi Perangkat")
            ? prev
            : [...prev, "Informasi Perangkat"]
        );
      }

      const shipmentStatus = data?.[0]?.shipment_status || null;
      dispatch(setShipmentStatus(shipmentStatus));
    } catch (err: any) {
      toastErrorFromAPI(err);
    }
  };

  useEffect(() => {
    if (userInfo) {
      setIsLoading(false);

      fetchData(); // masukan ke state dari sini (main)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  useEffect(() => {
    const paymentSuccess = searchParams.get("payment-success");

    if (paymentSuccess === "true") {
      setSuccessPayment(true);
      setShowPaymentSuccessModal(true);
      setAnimationData(successAnimation);
      sessionStorage.removeItem("paymentInfo");
    } else if (paymentSuccess === "false") {
      setSuccessPayment(false);
      setShowPaymentSuccessModal(true);
      setAnimationData(failedAnimation);
      sessionStorage.removeItem("paymentInfo");
    }
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Cek apakah halaman sebelumnya adalah /payment/checkout-payment
      const referrer = document.referrer;
      const isFromCheckoutPayment = referrer.includes(
        "/payment/checkout-payment"
      );

      if (isFromCheckoutPayment) {
        // Redirect langsung ke /payment
        window.location.href = "/payment";
      } else {
        // Opsional: jika bukan dari checkout, boleh kembali atau tampilkan konfirmasi
        // Contoh: dorong kembali ke halaman ini agar tidak keluar
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Push state saat masuk ke halaman ini
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const closePaymentSuccessModal = () => {
    setShowPaymentSuccessModal(false);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("payment-success");
    router.replace(newUrl.toString(), { scroll: false });
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    router.replace(url.toString(), { scroll: false });
  }, [activeTab, router]);

  const isFetching = !userInfo;
  const phoneCS = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";

  return (
    <div className="min-h-screen bg-background-customer pb-10">
      {/* Banner Background */}
      <CustomerHeader />

      <div className="max-w-332.25 mx-auto">
        {/* Customer Info */}
        <div className="relative z-10 px-8 -mt-28">
          {/* Avatar + Info */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:items-end justify-between">
            <div className="flex flex-col md:flex-row items-center gap-6 md:items-end">
              <div className="h-[170px] w-[170px] max-sm:h-[100px] max-sm:w-[100px] max-sm:mt-8 max-sm:p-6 rounded-full bg-white ring-8 ring-white shadow-[0_0_20px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-center flex-shrink-0">
                <span className="text-6xl max-sm:text-2xl font-bold">
                  {isFetching ? (
                    <SkeletonLarge />
                  ) : userInfo?.name ? (
                    getInitials(userInfo?.name)
                  ) : (
                    <Image src={iraLogo} alt="Logo IRA" width={90} />
                  )}
                </span>
              </div>

              {/* Info */}
              <div className="flex justify-between items-center">
                <div className="text-center md:text-left select-none">
                  <div className="">
                    {isLoading ? (
                      <SkeletonBase />
                    ) : (
                      <div className="text-2xl max-sm:text-[20px] font-bold text-ads-platform-dark">
                        {userInfo?.name}
                      </div>
                    )}
                  </div>
                  <div className="text-xl max-sm:text-[16px] text-ads-platform-dark">
                    {isFetching ? (
                      <SkeletonBase />
                    ) : (
                      <p>ID: {userInfo?.customer_code ?? "-"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Tracking */}
        {userInfo?.status === "waiting-for-installation" &&
          subscriptionHistory &&
          is_coverage &&
          !subscriptionHistory?.[0]?.start_date &&
          !isLoading && (
            <div className="max-md:mt-6 px-8 mt-12">
              <DeliveryTracking
                refetch={fetchData}
                data={subscriptionHistory?.[0]}
              />
            </div>
          )}

        {/* Banner Aktivasi CPE */}
        {isActivating && (
          <div className="max-md:mt-6 px-8 mt-12">
            <CpeActivationStatus />
          </div>
        )}

        {/* Banner Is Not Covered */}
        {!is_coverage && !isFetching && (
          <div className="max-md:mt-6 px-8 mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h1 className="text-2xl font-bold text-primary mb-4">
                Kami sedang menyiapkan layanan di area kamu
              </h1>
              <p className="text-gray-600 mb-6">
                Jangan khawatir! Kami akan segera memberi tahu kamu melalui{" "}
                <span className="font-bold text-primary">
                  WhatsApp dan Aplikasi IRA
                </span>{" "}
                jika layanan kami tersedia di daerahmu.
              </p>
              <Link
                href="/check-coverage"
                className="flex max-w-fit items-center gap-2 font-bold bg-primary text-white px-6 py-2 rounded-lg hover:bg-dark-primary-2"
              >
                <FaSearchLocation />
                Cek Jangkauan Terbaru
              </Link>
            </div>
          </div>
        )}

        {isCancelled && !isFetching && (
          <div className="max-md:mt-6 px-8 mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h1 className="text-2xl max-sm:text-center font-bold text-primary mb-4">
                Pendaftaran Dibatalkan
              </h1>
              <p className="text-gray-600 mb-6 max-sm:text-center">
                Yuk, klik berlangganan kembali dan nikmati internet cepat dari
                IRA.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <button
                  onClick={() => router.push("/reregistration")}
                  className="flex cursor-pointer max-w-fit items-center gap-2 font-bold bg-primary text-white px-6 py-3 rounded-lg hover:bg-dark-primary-2"
                >
                  Berlangganan Kembali
                </button>

                {/* <button
                  className="underline hover:text-dark-primary-2 flex gap-1 cursor-pointer items-center text-primary font-bold justify-center"
                  onClick={() =>
                    window.open(`https://wa.me/${phoneCS}`, "_blank")
                  }
                >
                  Hubungi Customer Service <MdHeadsetMic size={20} />
                </button> */}
              </div>
            </div>
          </div>
        )}

        {/* TAB MENU */}
        <div className="sm:px-8 px-5 mt-8">
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide border-b-2 border-gray-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 underline-animation-register whitespace-nowrap text-sm sm:text-xl cursor-pointer ${
                  activeTab === tab
                    ? "text-black font-bold border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="sm:px-8 px-5 mt-6">
          {activeTab === "Informasi Paket dan Riwayat" && <PackageAndHistory />}

          {activeTab === "Data Pribadi" && <PersonalData />}

          {activeTab === "Informasi Perangkat" && isActive && is_coverage && (
            <DeviceInformation />
          )}
        </div>
      </div>

      {showPaymentSuccessModal && is_coverage && (
        <ModalTemplate
          closeModal={closePaymentSuccessModal}
          classNameModal="max-w-md p-6 text-center w-[90%] sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3"
        >
          <h2 className="text-xl font-bold text-primary mb-2">
            {successPayment ? "Pembayaran Berhasil" : "Pembayaran Gagal"}
          </h2>

          <div className="flex justify-center">
            <Lottie
              width={104}
              height={104}
              className="w-42.5 sm:w-47.5 md:w-50 lg:w-60 lg:h-60"
              animationData={animationData}
            />
          </div>

          <p className="text-gray-700">
            {successPayment
              ? "Terima kasih! Paket langganan Anda telah aktif."
              : "Silahkan lakukan pembayaran ulang"}
          </p>
        </ModalTemplate>
      )}
    </div>
  );
}
