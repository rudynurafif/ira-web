"use client";
import React, { useEffect, useState } from "react";
import ModemActivationsOptions from "./_components/ModemActivationsOptions";
import SignalChecking from "./_components/SignalChecking";
import InputManualForm from "./_components/InputManualForm";

import SettingModemForm from "./_components/SettingModemForm";
import Html5BarcodeScanner from "./_components/Html5BarcodeScanner";
import { useRouter, useSearchParams } from "next/navigation";
import { addUrlParam, toastErrorFromAPI } from "@/app/_shared/utils";
import ConnectToNetwork from "./_components/ConnectToNetwork";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import toast from "react-hot-toast";
import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import { setShipmentStatus } from "@/app/store/slice/authSlice";
import Loader from "@/app/_components/Loader";

function Page() {
  const params = useSearchParams();
  const [activeSection, setActiveSection] = useState("scan");
  const { shipmentStatus, userInfo } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [subscriptionHistory, setSubscriptionHistory] =
    useState<SubscriptionHistoryAPI[]>();
  const dispatch = useAppDispatch();
  const [isDataReady, setIsDataReady] = useState(false);

  const fetchCustPackage = async () => {
    try {
      const resSubHistory = await getCustomerPackage({});
      const data = resSubHistory.data?.data;
      setSubscriptionHistory(data);

      const shipmentStatus = data?.[0]?.shipment_status || null;
      dispatch(setShipmentStatus(shipmentStatus));
    } catch (err: any) {
      toastErrorFromAPI(err);
    }
  };

  useEffect(() => {
    // Jika userInfo belum tersedia, jangan lakukan apa-apa
    if (userInfo === null) {
      setIsDataReady(false);
      return;
    }

    // Jika shipmentStatus belum tersedia, fetch
    if (shipmentStatus === null) {
      fetchCustPackage();
      setIsDataReady(false);
      return;
    }

    console.log(userInfo.status);
    console.log(shipmentStatus);

    // pastikan belum aktif dan sudah siap aktivasi
    if (userInfo.status === "active" || shipmentStatus !== "done") {
      router.replace("/customer-area");
      toast.error(
        "Pastikan anda sudah melakukan proses penerimaan perangkat CPE sebelum melakukan aktivasi."
      );
      return;
    }

    setIsDataReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, shipmentStatus, router]);

  useEffect(() => {
    if (!shipmentStatus) fetchCustPackage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentStatus]);

  useEffect(() => {
    const sSection = params.get("section");
    setActiveSection(sSection || "scan");
  }, [params]);

  if (!isDataReady) return <Loader />;

  return (
    <div className="py-10">
      {activeSection === "" ? (
        <ModemActivationsOptions />
      ) : activeSection === "input" ? (
        <InputManualForm />
      ) : activeSection === "scan" ? (
        <Html5BarcodeScanner />
      ) : activeSection === "connect" ? (
        <ConnectToNetwork />
      ) : activeSection === "setting" ? (
        <SettingModemForm />
      ) : activeSection === "check_signal" ? (
        <SignalChecking />
      ) : (
        ""
      )}
    </div>
  );
}

export default Page;
