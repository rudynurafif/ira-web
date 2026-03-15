"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { checkPackage, getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { useRouter, useSearchParams } from "next/navigation";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import bannerPanduan from "@/public/assets/Images/bannerPanduan.png";
import bannerPanduanMobile from "@/public/assets/Images/bannerPanduanMobile.png";
import bannerCS from "@/public/assets/Images/bannerCS.png";
import bannerCSMobile from "@/public/assets/Images/bannerCSmobile.png";
import bannerCubmu from "@/public/assets/Images/banner-cubmu.png";
import bannerCubmuMobile from "@/public/assets/Images/banner-cubmu-mobile.png";
import ActivePackageCard from "./ActivePackageCard";
import {
  convertToCurrency2,
  packageCountdown,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import HistorySection from "./HistorySection";
import thumbClick from "@/public/assets/Icons/thumb-click.png";
import ExpiredCard from "../ExpiredCard";
import InactiveCard from "../InactiveCard";
import { getAddOn } from "@/app/_api/AddOn/AddOn";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import limitImage from "@/public/assets/Images/limit-images.png";
import {
  selectActivePackage,
  selectCustomerPackages,
  selectCustomerPackageState,
} from "@/app/store/slice/customerPackageSlice";
import { getSetting } from "@/app/_api/Settings/Settings";
import { getCurrentPayment } from "@/app/_api/Payment/Payment";
import OutCoverage from "../OutCoverage";
import InCoverage from "../InCoverage";
import { getCheckCoverageLogin } from "@/app/_api/Location/Location";
import { getUser } from "@/app/store/slice/authSlice";
import toast from "react-hot-toast";
import RegistrationSummary from "./Modal/RegistrationSummary";
import imageFailed from "@/public/assets/check-coverage/check-failed.png";
import { UnifiedPaymentData } from "@/app/_shared/types/payment";
import PendingPaymentCard from "./PendingPaymentCard";
import RegistrationForm from "../../auth/register/_components/RegistrationForm";

const PAGE_SIZE = 5;

const PackageAndHistory = () => {
  const pkgState = useAppSelector(selectCustomerPackageState);
  const activePacketData = useAppSelector(selectActivePackage);
  const allHistory = useAppSelector(selectCustomerPackages);

  const [currentPage, setCurrentPage] = useState(1);
  // const [subscriptionHistory, setSubscriptionHistory] = useState<
  //   SubscriptionHistoryAPI[]
  // >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const searchParams = useSearchParams();
  const { label, status, days } = packageCountdown(
    activePacketData?.end_date ?? null,
  );
  const [isInactive, setIsInactive] = useState<boolean | null>(null);

  const { userInfo, is_coverage } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [addOns, setAddOns] = useState([]);

  const [isAllowed, setIsAllowed] = useState(false);
  const [openModalNotAllowed, setOpenModalNotAllowed] = useState(false);

  const [startDateFilter, setStartDateFilter] = useState<any>();
  const [endDateFilter, setEndDateFilter] = useState<any>();
  const [phoneCS, setPhoneCS] = useState<string | null>("");

  const [modalResult, setModalResult] = useState<boolean>(false);
  const [isCoverage, setIsCoverage] = useState<boolean>(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [latestIsFree, setLatestIsFree] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState<
    UnifiedPaymentData | undefined
  >();
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [showUpdateAddressForm, setShowUpdateAddressForm] = useState(false);

  const dispatch = useAppDispatch();

  const getCurrentPaymentData = async () => {
    try {
      const res = await getCurrentPayment();

      setPaymentInfo(res.data?.data);
      setHasPendingPayment(
        res.data?.data?.payment_attempt?.status === "pending",
      );
      console.log("hasPendingPayment: ", hasPendingPayment);
    } catch (err: any) {
      console.error("Gagal get current payment:", err);
    }
  };

  // useEffect(() => {
  //   if (!userInfo?.is_coverage === false || userInfo?.is_active)
  //     getCurrentPaymentData();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [userInfo]);

  const handleCheckCoverage = async () => {
    try {
      const payload = {
        latitude: userInfo?.latitude,
        longitude: userInfo?.longitude,
      };

      const res = await getCheckCoverageLogin(payload);
      const insideCoverage = res.data?.result.inside_coverage ?? false;

      setIsCoverage(insideCoverage);
      setModalResult(true);

      if (insideCoverage) {
        setShowRegistrationModal(true);

        const profileRes = await getProfileInfo({});
        const customerData = profileRes.data?.data?.customer ?? {};
        dispatch(getUser(customerData));

        toast.success("Area Anda sudah tercakup! Silakan daftar paket.");
      } else {
        setShowRegistrationModal(false);
      }
    } catch (err: any) {
      toastErrorFromAPI(err);
      setModalResult(false);
    }
  };

  useEffect(() => {
    const getPhoneCS = async () => {
      const resSetting = await getSetting("cs_phone");

      setPhoneCS(
        resSetting.data?.data?.value ??
          process.env.NEXT_PUBLIC_PHONE_CS ??
          "6281110689111",
      );
    };

    getPhoneCS();
  }, []);

  // pagination client-side
  const totalPages = Math.max(
    1,
    Math.ceil((allHistory?.length ?? 0) / PAGE_SIZE),
  );
  const subscriptionHistory = (allHistory ?? []).slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (activePacketData?.package_id.package_type === "free") {
      setLatestIsFree(true);
    }
  }, [activePacketData]);

  useEffect(() => {
    const fetchAddon = async () => {
      try {
        const resAddon = await getAddOn({});
        setAddOns(resAddon.data?.result ?? []);
      } catch (err) {
        toastErrorFromAPI(err);
      } finally {
      }
    };

    fetchAddon();
  }, []);

  useEffect(() => {
    if (userInfo) setIsInactive(userInfo?.status === "inactive");
  }, [isInactive, userInfo, userInfo?.status]);

  const handleCheckPackage = async (pkg?: any) => {
    try {
      if (pkg) {
        sessionStorage.setItem("selectedPackage", JSON.stringify(pkg));
      }

      const res = await checkPackage();

      if (res?.data?.data === true) {
        if (latestIsFree) {
          router.push("/payment");
        } else {
          router.push("/payment/payment-methods");
        }
      } else {
        setOpenModalNotAllowed(true);
      }
    } catch (err) {
      toastErrorFromAPI(err);
    }
  };

  const isFetching = !userInfo;
  if (isFetching) return <SkeletonLoadingCard />;

  // Komponen Paket Terakhir Dibeli
  const LatestPackage = () => {
    return (
      <div className="">
        <div className="text-xl font-bold mb-5">Paket Terakhir Dibeli</div>
        <div className="flex justify-between items-center gap-2">
          <Image
            src="/assets/Images/gambar-latest.png"
            alt="gambar-latest"
            width={140}
            height={152}
            // unoptimized
          />

          {/* Kode Kartu Paket Di Sini */}
          <div className="bg-white rounded-lg shadow-lg p-0.5 w-full">
            {/* Header Merah */}
            <div
              className="bg-linear-to-r text-white text-center p-2 rounded-t-lg font-bold text-sm"
              style={{
                background: "linear-gradient(to right, #520201, #9C1816)",
              }}
            >
              {activePacketData?.package_id?.name || "Paket Internet Rakyat"}
            </div>

            {/* Body: Speed & Price */}
            <div className="flex flex-col [@media(max-width:480px)]:flex-col [@media(min-width:481px)]:flex-row justify-evenly">
              <div className="flex flex-col justify-between items-center py-3 px-2">
                <div className="text-xs text-center">
                  Internet sampai dengan
                </div>
                <div className="text-2xl font-extrabold text-gradient-red">
                  {activePacketData?.package_id?.speed_mbps || "Speed"}{" "}
                  <span className="sm:text-base text-xs">Mbps</span>
                </div>
              </div>

              <div className="flex flex-col justify-between items-center py-3 px-2">
                <div className="text-xs ">Harga</div>
                <div className="sm:text-2xl font-extrabold ">
                  {activePacketData?.billing_id[0]?.invoice_id[0]?.is_free ? (
                    <>
                      <span className="line-through text-gray-400 sm:text-base text-xs font-semibold align-top">
                        {convertToCurrency2(
                          Number(
                            activePacketData.billing_id[0]?.invoice_id[0]
                              ?.amount,
                          ),
                        ) ?? "0"}
                      </span>{" "}
                      <span className="sm:text-base text-xs font-semibold align-top text-green-600!">
                        Gratis
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="sm:text-base text-gradient-red text-xs font-semibold align-top">
                        Rp{" "}
                      </span>
                      <span className="text-gradient-red">
                        {activePacketData
                          ? Number(
                              activePacketData?.billing_id[0]?.invoice_id[0]
                                ?.amount,
                            )
                              .toLocaleString("id-ID")
                              .replace(/,/g, ".")
                          : "0"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Fitur */}
            <div className="flex flex-col sm:flex-row gap-2 justify-evenly items-start sm:items-center bg-background-customer rounded-b-lg py-2 px-3">
              <div className="flex items-center gap-1 text-xs  font-medium">
                <Image
                  src="/assets/Icons/icon-checklist.svg"
                  alt="ico-checklist"
                  width={18}
                  height={18}
                />
                <p className="font-bold">
                  <span className="text-gradient-red">GRATIS</span> SEWA MODEM
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs  font-medium">
                <Image
                  src="/assets/Icons/icon-checklist.svg"
                  alt="ico-checklist"
                  width={18}
                  height={18}
                />
                <p className="font-bold">
                  <span className="text-gradient-red">UNLIMITED</span> DATA
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Beli Lagi */}
          {!activePacketData?.billing_id[0]?.invoice_id[0]?.is_free && (
            <div className="relative min-w-25 cursor-pointer hidden sm:block hover:scale-110 transition-transform">
              <Image
                src="/assets/Images/button-beli-lagi-home.png"
                alt="button-beli-lagi-home"
                width={100}
                height={152}
                onClick={() => handleCheckPackage(activePacketData?.package_id)}
                className="relative z-10"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(255, 0, 0, 0.6))",
                }}
              />
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <div
                  className="absolute top-0 h-full"
                  style={{
                    width: "100px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    transform: "skew(-20deg)",
                    animation: "sweep-narrow 2.5s infinite ease-out",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Beli Lagi Mobile */}
        {!activePacketData?.billing_id[0]?.invoice_id[0]?.is_free && (
          <div className="relative w-full h-15 my-3 sm:hidden">
            <button
              className="relative w-full z-10 cursor-pointer border-white border-3 rounded-xl px-6 py-3 bg-gradient-red-light text-white font-bold text-lg flex justify-center items-center gap-2"
              style={{
                filter: "drop-shadow(0 0 12px rgba(255, 0, 0, 0.6))",
              }}
              onClick={() => handleCheckPackage(activePacketData?.package_id)}
            >
              Beli Lagi
              <Image
                src={thumbClick}
                alt="button-beli-lagi-home-mobile"
                width={24}
                height={24}
                // unoptimized
              />
            </button>

            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div
                className="absolute top-0 h-full"
                style={{
                  width: "120px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  transform: "skew(-20deg)",
                  animation: "sweep-mobile 3s infinite ease-out",
                  left: "-120px",
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* MOBILE (< sm) */}
      <div className="sm:hidden space-y-6">
        {
          // hasPendingPayment && paymentInfo ? (
          //   <PendingPaymentCard data={paymentInfo} />
          // ) :
          activePacketData && isInactive ? (
            <InactiveCard data={activePacketData} />
          ) : userInfo.status === "dismantled" ||
            userInfo.status === "suspend" ? (
            <ExpiredCard data={activePacketData} isDismantled={true} />
          ) : status === "expired" ? (
            <ExpiredCard data={activePacketData} />
          ) : activePacketData ? (
            <ActivePackageCard data={activePacketData} />
          ) : userInfo.is_coverage === false ? (
            <OutCoverage onCheckCoverage={handleCheckCoverage} />
          ) : userInfo.is_coverage === true ? (
            <InCoverage />
          ) : null
        }

        {/* Banner Cubmu */}
        {addOns.length > 0 && (
          <div className="relative w-full">
            <Carousel
              autoPlay
              interval={5000}
              infiniteLoop
              showThumbs={false}
              showStatus={false}
              showIndicators={addOns.length > 1}
              swipeable={true}
              emulateTouch={true}
              stopOnHover={true}
              onChange={(index) => {
                // opsional: logika saat slide berubah
              }}
            >
              {addOns.map((addon: any, idx: number) => {
                // Asumsi addon memiliki field: banner_url (string) dan slug (string)
                const bannerUrl = addon.banner_url || bannerCubmuMobile;
                const link = `/add-on/${addon.id}`;

                return (
                  <div
                    key={idx}
                    onClick={() => window.open(link, "_blank")}
                    className="cursor-pointer"
                  >
                    <Image
                      src={bannerUrl}
                      alt={`Banner ${addon.name || "Add-on"}`}
                      width={800} // sesuaikan dengan ukuran asli banner
                      height={400} // penting untuk Next.js Image
                      className="w-full object-cover drop-shadow-lg hover:scale-[1.02] transition-transform"
                      priority={idx === 0} // preload slide pertama
                    />
                  </div>
                );
              })}
            </Carousel>
          </div>
        )}

        <Image
          src={bannerCSMobile}
          alt="banner CS"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
        />

        {activePacketData?.package_id && <LatestPackage />}

        <Image
          src={bannerPanduanMobile}
          alt="Banner Panduan"
          className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open("/panduan-cara-bayar", "_blank")}
        />

        <HistorySection />
      </div>

      {/* DESKTOP (≥ sm) */}
      <div className="hidden sm:grid grid-cols-12 gap-6">
        <div className="lg:col-span-5 col-span-12 space-y-5">
          {
            // hasPendingPayment && paymentInfo ? (
            //   <PendingPaymentCard data={paymentInfo} />
            // ) :
            activePacketData && isInactive ? (
              <InactiveCard data={activePacketData} />
            ) : userInfo.status === "dismantled" ||
              userInfo.status === "suspend" ? (
              <ExpiredCard data={activePacketData} isDismantled={true} />
            ) : status === "expired" ? (
              <ExpiredCard data={activePacketData} />
            ) : activePacketData ? (
              <ActivePackageCard data={activePacketData} />
            ) : userInfo.is_coverage === false ? (
              <OutCoverage onCheckCoverage={handleCheckCoverage} />
            ) : userInfo.is_coverage === true ? (
              <InCoverage />
            ) : null
          }

          {addOns.length > 0 && (
            <div className="relative w-full">
              <Carousel
                autoPlay
                interval={5000}
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                showIndicators={addOns.length > 1}
                swipeable={true}
                emulateTouch={true}
                stopOnHover={true}
                onChange={(index) => {
                  // opsional: logika saat slide berubah
                }}
              >
                {addOns.map((addon: any, idx: number) => {
                  // Asumsi addon memiliki field: banner_url (string) dan slug (string)
                  const bannerUrl = addon.banner_url || bannerCubmu;
                  const link = `/add-on/${addon.id}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => window.open(link, "_blank")}
                      className="cursor-pointer"
                    >
                      <Image
                        src={bannerUrl}
                        alt={`Banner ${addon.name || "Add-on"}`}
                        width={800} // sesuaikan dengan ukuran asli banner
                        height={400} // penting untuk Next.js Image
                        className="w-full object-cover drop-shadow-lg hover:scale-[1.02] transition-transform"
                        priority={idx === 0} // preload slide pertama
                      />
                    </div>
                  );
                })}
              </Carousel>
            </div>
          )}

          <Image
            src={bannerCS}
            alt="banner CS"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
          />
        </div>

        <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
          {/* Paket terakhir dibeli */}
          {activePacketData?.package_id && <LatestPackage />}

          <Image
            src={bannerPanduan}
            alt="Banner Panduan"
            className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("/panduan-cara-bayar", "_blank")}
          />

          <HistorySection />
        </div>
      </div>

      {openModalNotAllowed && (
        <ModalTemplate
          closeModal={() => {
            setOpenModalNotAllowed(false);
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
              className="rounded-full sm:rounded-lg shadow-lg sm:text-xl mt-6 disabled:cursor-not-allowed! text-white font-bold w-full bg-primary hover:bg-dark-primary-2 cursor-pointer py-4"
              onClick={() => setOpenModalNotAllowed(false)}
              // disabled={!selectedPackage}
            >
              Oke, Mengerti
            </button>
          </div>
        </ModalTemplate>
      )}

      {modalResult && (
        <ModalTemplate
          closeModal={() => setModalResult(false)}
          classNameModal={isCoverage && showRegistrationModal ? "p-8" : ""}
          width={
            isCoverage && showRegistrationModal ? "max-w-[1200px]" : "max-w-2xl"
          }
        >
          {isCoverage && showRegistrationModal ? (
            <RegistrationSummary
              onBack={() => {
                setShowRegistrationModal(false);
                setModalResult(false);
              }}
            />
          ) : (
            <div className="rounded-xl overflow-hidden">
              <div className="w-full">
                <Image
                  alt="image-status"
                  src={imageFailed}
                  className="w-full"
                />
              </div>
              <div className="my-8 text-start px-5">
                <h1 className="text-primary text-center text-2xl font-bold w-full sm:w-3/4 mx-auto">
                  Yah... Lokasi Kamu Belum Terjangkau Internet Rakyat
                </h1>
                <p className="mt-3 w-full mx-auto text-center">
                  Mohon maaf saat ini layanan belum tersedia di alamat yang kamu
                  masukkan.
                </p>
                <p className="mt-3 w-full mx-auto text-center">
                  Kamu bisa memperbarui alamat yang benar dan sesuai atau coba
                  lagi dengan detail yang lebih lengkap (RT/RW, patokan, atau
                  titik lokasi di peta)
                </p>
                <button
                  onClick={() => {
                    setModalResult(false);
                    setShowUpdateAddressForm(true);
                  }}
                  className="w-full cursor-pointer py-3 text-white font-bold bg-primary hover:bg-dark-primary-2 sm:rounded-xl rounded-full mt-6"
                >
                  Perbarui Alamat
                </button>
              </div>
            </div>
          )}
        </ModalTemplate>
      )}

      {showUpdateAddressForm && (
        <ModalTemplate
          closeModal={() => setShowUpdateAddressForm(false)}
          classNameModal="p-6"
          width="max-w-[1200px]"
        >
          <RegistrationForm
            mode="update_address"
            title="Perbarui Alamat"
            showCancelButton={true}
            showBannerCovered={true}
            initialData={{
              fullname: userInfo?.name || "",
              email: userInfo?.email || "",
              phone: userInfo?.phone_number || "",
              latitude: userInfo?.latitude
                ? String(userInfo.latitude)
                : undefined,
              longitude: userInfo?.longitude
                ? String(userInfo.longitude)
                : undefined,
              actual_address: userInfo?.address || "",
              province: userInfo?.province_id?.id
                ? String(userInfo.province_id?.id)
                : "",
              city: userInfo?.city_id?.id ? String(userInfo.city_id?.id) : "",
              district: userInfo?.district_id?.id
                ? String(userInfo.district_id?.id)
                : "",
              sub_district: userInfo?.sub_district_id?.id
                ? String(userInfo.sub_district_id?.id)
                : "",
              rt: userInfo?.rt || "",
              rw: userInfo?.rw || "",
              postal_code: userInfo?.postal_code
                ? String(userInfo.postal_code)
                : "",
              notes: userInfo?.notes || "",
            }}
          />
        </ModalTemplate>
      )}
    </>
  );
};

export default PackageAndHistory;
