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

export default function AreaPelanggan() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userInfo, isLoggedIn, shipmentStatus } = useAppSelector(
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
  const dispatch = useAppDispatch();

  const [subscriptionHistory, setSubscriptionHistory] =
    useState<SubscriptionHistoryAPI[]>();

  const fetchData = async () => {
    try {
      const resSubHistory = await getCustomerPackage({});
      const data = resSubHistory.data?.data;
      setSubscriptionHistory(data);

      const hasStartDate = !!data?.[0]?.start_date;
      setIsActive(hasStartDate);

      if (hasStartDate) {
        setTabs((prev) => {
          if (!prev.includes("Informasi Perangkat")) {
            return [...prev, "Informasi Perangkat"];
          }
          return prev;
        });
      }

      setIsActive(data[0]?.start_date);
      if (isActive) tabs.push("Informasi Perangkat");

      const shipmentStatus = data?.[0]?.shipment_status || null;
      dispatch(setShipmentStatus(shipmentStatus));
    } catch (err: any) {
      toastErrorFromAPI(err);
    }
  };

  useEffect(() => {
    // if (!shipmentStatus)
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (userInfo) {
      setIsLoading(false);
      // console.log("user dari state", user);
    }
  }, [userInfo]);

  const isFetching = !userInfo;

  return (
    <div className="min-h-screen bg-background-customer pb-10">
      {showPaymentSuccessModal && (
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
              className="w-[170px] sm:w-[190px] md:w-[200px] lg:w-60 lg:h-60"
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

      {/* HEADER */}
      <CustomerHeader />

      <div className="relative z-10 max-w-[1329px] mx-auto px-8 -mt-28">
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
                    <span>ID: {userInfo?.customer_code}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Tracking */}
      {subscriptionHistory &&
        !subscriptionHistory?.[0]?.start_date &&
        !isLoading && (
          <div className="max-w-[1329px] max-md:mt-6 mx-auto px-8 mt-12">
            <DeliveryTracking
              refetch={fetchData}
              data={subscriptionHistory?.[0]}
            />
          </div>
        )}

      {/* Banner Aktivasi CPE */}
      {isActivating && (
        <div className="max-w-[1329px] max-md:mt-6 mx-auto px-8 mt-12">
          <CpeActivationStatus />
        </div>
      )}

      {/* TAB MENU */}
      <div className="max-w-[1329px] sm:px-8 px-5 mt-8 mx-auto">
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
      <div className="max-w-[1329px] sm:px-8 px-5 mx-auto mt-6">
        {activeTab === "Informasi Paket dan Riwayat" && <PackageAndHistory />}

        {activeTab === "Data Pribadi" && <PersonalData />}

        {activeTab === "Informasi Perangkat" && isActive && (
          <DeviceInformation />
        )}

        {/* {activeTab === "Tracking Pengiriman" && <DeliveryTracking />} */}

        {/* {activeTab === "Riwayat Berlangganan" && <SubscriptionHistory />} */}
      </div>
    </div>
  );
}
