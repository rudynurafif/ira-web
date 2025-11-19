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
import { getSubscriptionHistory } from "@/app/_api/Customer/CustomerArea";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import { setShipmentStatus } from "@/app/store/slice/authSlice";

function Page() {
  const params = useSearchParams();
  const [activeSection, setActiveSection] = useState("scan");
  const { shipmentStatus } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [subscriptionHistory, setSubscriptionHistory] =
    useState<SubscriptionHistoryAPI[]>();
  const dispatch = useAppDispatch();

  const fetchData = async () => {
    try {
      const resSubHistory = await getSubscriptionHistory({});
      const data = resSubHistory.data?.data;
      setSubscriptionHistory(data);

      const shipmentStatus = data?.[0]?.shipment_status || null;
      dispatch(setShipmentStatus(shipmentStatus));
    } catch (err: any) {
      toastErrorFromAPI(err);
    }
  };

  useEffect(() => {
    if (shipmentStatus && shipmentStatus !== "done") {
      router.replace("/customer-area");
      toast.error(
        "Pastikan anda sudah melakukan proses penerimaan perangkat CPE sebelum melakukan aktivasi."
      );
    }
  }, [router, shipmentStatus]);

  useEffect(() => {
    if (!shipmentStatus) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentStatus]);

  useEffect(() => {
    const sSection = params.get("section");
    if (sSection) {
      setActiveSection(sSection);
    } else {
      setActiveSection("scan");
    }
  }, [params]);

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
