"use client";
import React, { useState } from "react";
import ModemActivationsOptions from "./_components/ModemActivationsOptions";
import SignalChecking from "./_components/SignalChecking";
import InputManualForm from "./_components/InputManualForm";

import SettingModemForm from "./_components/SettingModemForm";
import Html5BarcodeScanner from "./_components/Html5BarcodeScanner";

function Page() {
  const [activeSection, setActiveSection] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  return (
    <div className="py-10">
      {activeSection === "" ? (
        <ModemActivationsOptions
          setActiveSection={(val: string) => {
            setActiveSection(val);
          }}
        />
      ) : activeSection === "input" ? (
        <InputManualForm
          serialNumberScan={serialNumber}
          setActiveSection={(val: string) => {
            setActiveSection(val);
          }}
        />
      ) : activeSection === "scan" ? (
        // <ScanBarcode
        //   onResult={(text) => {
        //     // lakukan sesuatu (fetch, navigate, isi form, dll.)
        //     toast.success(text);
        //   }}
        //   onManualInput={() => {
        //     // arahkan ke form input manual
        //     setActiveSection("input");
        //   }}
        //   // singleShot={true}
        // />
        // <BarcodeScanner
        //   onDetected={(text) => {
        //     alert(`Barcode terdeteksi:\n${text}`);
        //     // TODO: lanjutkan ke alur Anda (fetch detail, isi form, dll.)
        //   }}
        //   // onManualInput={() => {
        //   //   // Contoh: arahkan ke halaman input manual
        //   //   window.location.href = "/input-manual";
        //   // }}
        // />

        <Html5BarcodeScanner
          setActiveSection={(val: string) => {
            setActiveSection(val);
          }}
          onDetected={(txt) => {
            // setValue(txt);
            setSerialNumber(txt);
          }}
          onManual={() => {
            const v = prompt("Masukkan barcode/serial secara manual:") || "";
            // if (v) setValue(v);
          }}
        />
      ) : activeSection === "setting" ? (
        <SettingModemForm
          setActiveSection={(val: string) => {
            setActiveSection(val);
          }}
        />
      ) : activeSection === "check-signal" ? (
        <SignalChecking />
      ) : (
        ""
      )}
    </div>
  );
}

export default Page;
