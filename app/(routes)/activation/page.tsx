"use client";
import React, { useEffect, useState } from "react";
import ModemActivationsOptions from "./_components/ModemActivationsOptions";
import SignalChecking from "./_components/SignalChecking";
import InputManualForm from "./_components/InputManualForm";

import SettingModemForm from "./_components/SettingModemForm";
import Html5BarcodeScanner from "./_components/Html5BarcodeScanner";
import { useSearchParams } from "next/navigation";
import { addUrlParam } from "@/app/_shared/utils";

function Page() {
  const params = useSearchParams();
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sSection = params.get("section");
    if (sSection) {
      setActiveSection(sSection);
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
