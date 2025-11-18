"use client";

import React, { useEffect, useRef, useState } from "react";
import { addUrlParam } from "@/app/_shared/utils";
import { useSearchParams } from "next/navigation";
import { FaWifi } from "react-icons/fa";

type Screen = "loading" | "failed" | "failedFinal" | "success";

const MAX_ATTEMPT = 3;

// ---- Stub: ganti dengan call API aktivasi aslinya ----
async function doActivation(
  serialNumber: string,
  force: string | null
): Promise<boolean> {
  // simulasi durasi request
  await new Promise((r) => setTimeout(r, 2500));

  if (force === "success") return true;
  if (force === "fail") return false;

  // default: sukses 60%
  return Math.random() < 0.6;
}

function ProgressRing({ percent }: { percent: number }) {
  const angle = Math.min(100, Math.max(0, percent)) * 3.6;
  return (
    <div
      className="w-[110px] h-[110px] mx-auto rounded-full relative"
      style={{
        background: `conic-gradient(#005FB8 ${angle}deg, #E5E7EB 0deg)`,
      }}
    >
      <div className="absolute inset-[10px] bg-white rounded-full flex items-center justify-center">
        <span className="font-bold text-[#001D47]">{Math.floor(percent)}%</span>
      </div>
    </div>
  );
}

const Badge = ({
  color,
  children,
}: {
  color: "green" | "red";
  children: React.ReactNode;
}) => (
  <span
    className={`ml-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
      color === "green"
        ? "bg-[#22C55E]/15 text-green-primary border border-[#22C55E]/30"
        : "bg-[#EF4444]/15 text-red-primary border border-[#EF4444]/30"
    }`}
  >
    {children}
  </span>
);

export default function ConnectToNetwork() {
  const params = useSearchParams();
  const serialNumber = params.get("serial_number") || "";
  const force = params.get("force"); // optional: "success" | "fail" (untuk uji tampilan)

  const [screen, setScreen] = useState<Screen>("loading");
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(1);

  const progressTimer = useRef<number | null>(null);

  // restore attempt dari sessionStorage
  useEffect(() => {
    const key = `activation_attempt:${serialNumber || "default"}`;
    const saved = Number(sessionStorage.getItem(key) || "0"); // jumlah gagal
    setAttempt(saved + 1); // attempt yang sedang berjalan (1..3)
  }, [serialNumber]);

  useEffect(() => {
    startActivation();

    return () => {
      if (progressTimer.current) {
        window.clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  function saveFailedAttempt(countFailed: number) {
    const key = `activation_attempt:${serialNumber || "default"}`;
    sessionStorage.setItem(key, String(countFailed));
  }

  function resetAttempt() {
    const key = `activation_attempt:${serialNumber || "default"}`;
    sessionStorage.removeItem(key);
  }

  async function startActivation() {
    if (!serialNumber) {
      setScreen("failed");
      return;
    }

    setScreen("loading");
    setProgress(0);

    // animasi progress ke ~94% sambil nunggu API
    if (progressTimer.current) window.clearInterval(progressTimer.current);
    progressTimer.current = window.setInterval(() => {
      setProgress((p) => Math.min(94, p + Math.max(1, (100 - p) * 0.03)));
    }, 80);

    const ok = await doActivation(serialNumber, force);

    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setProgress(100);

    if (ok) {
      resetAttempt();
      setScreen("success");
    } else {
      const failedSoFar = attempt; // attempt ini gagal
      if (failedSoFar >= MAX_ATTEMPT) {
        saveFailedAttempt(MAX_ATTEMPT);
        setScreen("failedFinal");
      } else {
        saveFailedAttempt(failedSoFar);
        setScreen("failed");
      }
    }
  }

  function retry() {
    // naikkan attempt dan mulai ulang
    setAttempt((a) => Math.min(MAX_ATTEMPT, a + 1));
  }

  function goNextSetting() {
    addUrlParam("section", "setting");
  }

  function contactCS() {
    const msg = encodeURIComponent(
      `Halo CS, saya butuh bantuan aktivasi modem IRA.\nSN: ${serialNumber}`
    );
    const phone = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";
    window.location.href = `https://wa.me/${phone}?text=${msg}`;
  }

  // ---- UI ----
  if (screen === "loading") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-[#001D47]">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-10">
          <ProgressRing percent={progress} />
        </div>

        <div className="pt-6">
          <div className="font-bold text-[#001D47]">
            Aktivasi CPE Sedang Berlangsung
          </div>
          <p className="text-[#666] max-w-[680px] mx-auto mt-2">
            Sistem sedang memverifikasi nomor seri dan mengatur konfigurasi
            perangkat Anda. Proses ini mungkin memerlukan{" "}
            <span className="font-semibold">waktu 1–2 menit</span>.
          </p>
        </div>
      </div>
    );
  }

  if (screen === "success") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-[#001D47]">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-8 flex justify-center items-center">
          {/* ikon wifi sederhana */}
          <FaWifi size={40}/>
        </div>

        <div className="pt-4">
          <div className="text-[#001D47] font-bold">
            Proses Aktivasi
            <Badge color="green">Berhasil</Badge>
          </div>
          <p className="text-[#666] max-w-[680px] mx-auto mt-2">
            Perangkat Anda telah berhasil diaktifkan dan terhubung ke jaringan
            inti. Internet sekarang sudah siap digunakan.
          </p>
        </div>

        <div className="pt-6 max-w-[480px] mx-auto">
          <button
            onClick={goNextSetting}
            className="w-full bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-[12px] py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    );
  }

  if (screen === "failedFinal") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-[#001D47]">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-8">
          <div className="text-[#001D47] font-bold">
            Proses Aktivasi
            <Badge color="red">Tidak Berhasil</Badge>
          </div>
          <p className="text-[#666] max-w-[680px] mx-auto mt-2">
            Aktivasi perangkat tidak berhasil dilakukan. Silakan coba kembali
            atau hubungi Customer Service kami untuk bantuan lebih lanjut.
          </p>
          <div className="text-[#001D47] font-bold mt-1">(3/3)</div>
        </div>

        <div className="pt-6 max-w-[480px] mx-auto">
          <button
            onClick={contactCS}
            className="w-full bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-[12px] py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service
          </button>
        </div>
      </div>
    );
  }

  // screen === "failed"
  return (
    <div className="container mx-auto px-6 text-center">
      <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-dark-primary">
        Menghubungkan Perangkat ke Jaringan
      </h2>

      <div className="pt-8">
        <div className="text-[#001D47] font-bold">
          Proses Aktivasi
          <Badge color="red">Tidak Berhasil</Badge>
        </div>
        <p className="text-[#666] max-w-[680px] mx-auto mt-2">
          Aktivasi perangkat tidak berhasil dilakukan. Silakan coba kembali atau
          hubungi Customer Service kami untuk bantuan lebih lanjut.
        </p>
        <div className="text-[#001D47] font-bold mt-1">
          ({attempt}/{MAX_ATTEMPT})
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={retry}
          className="text-primary cursor-pointer font-semibold underline-animation-activation"
          type="button"
        >
          Ulangi Proses Aktivasi
        </button>
      </div>
    </div>
  );
}
