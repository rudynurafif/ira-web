"use client";

import React, { useEffect, useRef, useState } from "react";
import { addUrlParam } from "@/app/_shared/utils";
import { useSearchParams } from "next/navigation";
import { FaWifi } from "react-icons/fa";
import SignalArc from "./SignalWave";
import Image from "next/image";
import CPEIRA from "@/public/assets/Images/cpe-ira.png";
import { MdHeadsetMic } from "react-icons/md";
import toast from "react-hot-toast";
import { useSSE } from "@/app/_context/SSEContext";
import Badge from "@/app/_components/Badge";

type Screen = "loading" | "failed" | "failedFinal" | "success";

const MAX_ATTEMPT = 3;

export default function ConnectToNetwork() {
  const params = useSearchParams();
  const serialNumber = params.get("serial_number") || "";
  const force = params.get("force"); // optional: "success" | "fail" (untuk uji tampilan)

  const [screen, setScreen] = useState<Screen>("loading");
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(1);

  const progressTimer = useRef<number | null>(null);

  const CHECK_COOLDOWN = 60;

  const [cooldown, setCooldown] = useState(CHECK_COOLDOWN);
  const [isCooldownActive, setIsCooldownActive] = useState(true);
  const [activationConfirmed, setActivationConfirmed] = useState(false);

  const { lastEvent } = useSSE();

  useEffect(() => {
    if (!lastEvent) return;
    if (activationConfirmed) return;

    if (
      lastEvent.type === "activate" &&
      lastEvent.sn === serialNumber &&
      (lastEvent.message === "Success" || lastEvent.result === "processed")
    ) {
      localStorage.setItem(
        "ira-cpe-serial-number",
        lastEvent.sn ?? "SN not found"
      );
      localStorage.setItem(
        "ira-cpe-cell-id",
        lastEvent.data?.cell_id ?? "Cell ID not found"
      );
      toast.success("Berhasil aktivasi perangkat");
      console.log("✅ Aktivasi sukses via SSE", lastEvent);

      // stop progress
      if (progressTimer.current) {
        window.clearInterval(progressTimer.current);
        progressTimer.current = null;
      }

      setProgress(100);
      resetAttempt();
      setActivationConfirmed(true);
      setScreen("success");
    }
  }, [lastEvent, serialNumber]);

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

  useEffect(() => {
    if (!isCooldownActive) return;

    if (cooldown <= 0) {
      setIsCooldownActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown, isCooldownActive]);

  function handleCheckAgain() {
    // reset cooldown
    setCooldown(CHECK_COOLDOWN);
    setIsCooldownActive(true);

    // kalau mau trigger ulang aktivasi, bisa:
    startActivation();

    toast.success("Mengecek ulang status aktivasi...");
  }

  // restore attempt dari sessionStorage
  useEffect(() => {
    const key = `activation_attempt:${serialNumber || "default"}`;
    const saved = Number(sessionStorage.getItem(key) || "0"); // jumlah gagal
    setAttempt(saved + 1); // attempt yang sedang berjalan (1..3)
  }, [serialNumber]);

  useEffect(() => {
    if (screen !== "loading") return;

    const timeout = setTimeout(() => {
      if (!activationConfirmed) {
        const failedSoFar = attempt;

        if (failedSoFar >= MAX_ATTEMPT) {
          saveFailedAttempt(MAX_ATTEMPT);
          setScreen("failedFinal");
        } else {
          saveFailedAttempt(failedSoFar);
          setScreen("failed");
        }
      }
    }, 60_000); // 60 detik

    return () => clearTimeout(timeout);
  }, [screen, activationConfirmed, attempt]);

  function saveFailedAttempt(countFailed: number) {
    const key = `activation_attempt:${serialNumber || "default"}`;
    sessionStorage.setItem(key, String(countFailed));
  }

  function resetAttempt() {
    const key = `activation_attempt:${serialNumber || "default"}`;
    sessionStorage.removeItem(key);
  }

  async function startActivation() {
    if (!serialNumber || activationConfirmed) return;

    setScreen("loading");
    setProgress(0);

    // progress animation
    if (progressTimer.current) window.clearInterval(progressTimer.current);
    progressTimer.current = window.setInterval(() => {
      setProgress((p) => Math.min(94, p + Math.max(1, (100 - p) * 0.03)));
    }, 80);
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
    const url = `https://wa.me/${phone}?text=${msg}`;

    window.open(url, "_blank");
  }

  // ---- UI ----
  if (screen === "loading") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-old-primary">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-10 flex flex-col items-center justify-center px-6 py-12 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          {/* <ProgressRing percent={progress} /> */}
          <div className="mb-8 relative flex justify-center items-center">
            {/* Kiri */}
            <div className="absolute -left-22.5 top-1/2 transform -translate-y-1/2 z-0">
              <SignalArc isLeft={true} />
            </div>

            {/* Gambar CPE */}
            <Image
              src={CPEIRA}
              alt="Activating CPE"
              className="w-auto h-auto max-w-37.5 sm:max-w-50 z-10 relative"
            />

            {/* Kanan */}
            <div className="absolute -right-22.5 top-1/2 transform -translate-y-1/2 z-0">
              <SignalArc isLeft={false} />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="font-bold text-old-primary">
            Hooray! Aktivasi CPE Sedang Berlangsung
          </div>
          <p className="text-black max-w-4xl mx-auto mt-2">
            Aktivasi CPE membutuhkan waktu sekitar 1 menit. Jangan khawatir,
            setelah selesai kamu akan dapat notifikasi lewat WhatsApp atau bisa
            langsung cek statusnya di aplikasi Internet Rakyat. Jika kamu punya
            pertanyaan silakan hubungi customer service kami.
          </p>
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-6">
          <button
            onClick={contactCS}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
          </button>

          <button
            onClick={handleCheckAgain}
            disabled={isCooldownActive}
            className={`w-full border-2 font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]
            ${
              isCooldownActive
                ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-primary text-primary hover:bg-red-50 cursor-pointer"
            }`}
            type="button"
          >
            {isCooldownActive ? `Cek ulang (${cooldown}s)` : "Cek ulang"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "success") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-old-primary">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-8 flex justify-center items-center">
          {/* ikon wifi sederhana */}
          <FaWifi size={40} />
        </div>

        <div className="my-6">
          <div className="text-old-primary font-bold">
            Proses Aktivasi
            <Badge color="green">Berhasil</Badge>
          </div>
          <p className="max-w-170 mx-auto mt-2">
            Perangkat Anda telah berhasil diaktifkan dan terhubung ke jaringan
            inti. Internet sekarang sudah siap digunakan.
          </p>
        </div>

        <div className="pt-6 flex flex-col gap-6 max-w-120 mx-auto">
          <button
            onClick={goNextSetting}
            className="w-full bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
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
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-old-primary">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-8">
          <div className="text-old-primary font-bold">
            Proses Aktivasi
            <Badge color="red">Tidak Berhasil</Badge>
          </div>
          <p className="text-[#666] max-w-170 mx-auto mt-2">
            Aktivasi perangkat tidak berhasil dilakukan. Silakan coba kembali
            atau hubungi Customer Service kami untuk bantuan lebih lanjut.
          </p>
          <div className="text-old-primary font-bold mt-1">(3/3)</div>
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-6">
          <button
            onClick={contactCS}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
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
        <div className="text-old-primary font-bold">
          Proses Aktivasi
          <Badge color="red">Tidak Berhasil</Badge>
        </div>
        <p className="text-[#666] max-w-[680px] mx-auto mt-2">
          Aktivasi perangkat tidak berhasil dilakukan. Silakan coba kembali atau
          hubungi Customer Service kami untuk bantuan lebih lanjut.
        </p>
        <div className="text-old-primary font-bold mt-1">
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
