"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  addUrlParam,
  decodeJwt,
  formatTime,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaWifi } from "react-icons/fa";
import { MdHeadsetMic } from "react-icons/md";
import { getCookie } from "cookies-next";
import { EventSourcePolyfill } from "event-source-polyfill";

import Badge from "@/app/_components/Badge";
import SignalArc from "./SignalWave";
import CPEIRA from "@/public/assets/Images/cpe-ira.png";

import { refreshTask } from "@/app/_api/CoreNetwork/CoreNetwork";
import { DecodedToken } from "@/app/_context/sse.type";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

type Screen = "loading" | "failed" | "failedFinal" | "success" | "timedOut";
type StepStatus = "idle" | "loading" | "success" | "failed";

const MAX_ATTEMPT = 3;
const CHECK_COOLDOWN_SEC = 120;
const SSE_TIMEOUT_MS = 10 * 60 * 1000;

function StepRow({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: StepStatus;
}) {
  const badge =
    status === "loading" ? (
      <Badge color="green">Proses</Badge>
    ) : status === "success" ? (
      <Badge color="green">Berhasil</Badge>
    ) : status === "failed" ? (
      <Badge color="red">Gagal</Badge>
    ) : (
      <Badge color="green">Menunggu</Badge>
    );

  const icon =
    status === "loading" ? (
      <AiOutlineLoading3Quarters
        className="animate-spin text-primary"
        size={18}
      />
    ) : status === "success" ? (
      <FiCheckCircle className="text-green-600" size={18} />
    ) : status === "failed" ? (
      <FiXCircle className="text-red-600" size={18} />
    ) : (
      <span className="w-[18px] h-[18px] rounded-full bg-gray-300 inline-block" />
    );

  return (
    <div className="w-full rounded-xl border border-[#E7EEF9] bg-white px-4 py-3 text-left shadow-[0_6px_45px_0_rgba(0,48,120,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6">{icon}</div>
          <div>
            <div className="font-bold text-old-primary">{title}</div>
          </div>
        </div>
        {badge}
      </div>
    </div>
  );
}

export default function ConnectToNetwork() {
  const params = useSearchParams();
  const serialNumber = params.get("serial_number") || "";

  const token = getCookie("token-ira");
  const decodedToken = useMemo(() => {
    if (!token) return null;
    return decodeJwt(token as string) as DecodedToken | null;
  }, [token]);

  const customer_id = decodedToken?.customer_id || "";

  const [screen, setScreen] = useState<Screen>("loading");

  // attempt = attempt ke berapa (1..MAX_ATTEMPT)
  const [attempt, setAttempt] = useState(1);

  // cooldown
  const [cooldown, setCooldown] = useState(0);
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  // status SSE sederhana untuk UI
  const [sseStatus, setSseStatus] = useState<"connecting" | "open" | "error">(
    "connecting"
  );

  // ✅ step status terpisah
  const [activateStatus, setActivateStatus] = useState<StepStatus>("idle");
  const [internetStatus, setInternetStatus] = useState<StepStatus>("idle");

  // refs
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activationConfirmedRef = useRef(false);

  // key unik
  const cooldownKey = useMemo(() => {
    const cid = customer_id || "unknown";
    const sn = serialNumber || "unknown";
    return `activation_cooldown_end:${cid}:${sn}`;
  }, [customer_id, serialNumber]);

  const attemptKey = useMemo(() => {
    const sn = serialNumber || "default";
    return `activation_attempt:${sn}`;
  }, [serialNumber]);

  const clearSse = useCallback(() => {
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch {}
      eventSourceRef.current = null;
    }
  }, []);

  const clearTimeoutSafe = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetAttemptStorage = useCallback(() => {
    sessionStorage.removeItem(attemptKey);
  }, [attemptKey]);

  const saveFailedAttemptStorage = useCallback(
    (failedCount: number) => {
      sessionStorage.setItem(attemptKey, String(failedCount));
    },
    [attemptKey]
  );

  const startCooldown = useCallback(
    (seconds: number) => {
      const endAt = Date.now() + seconds * 1000;
      localStorage.setItem(cooldownKey, String(endAt));
      setCooldown(seconds);
      setIsCooldownActive(true);
    },
    [cooldownKey]
  );

  const stopCooldown = useCallback(() => {
    localStorage.removeItem(cooldownKey);
    setCooldown(0);
    setIsCooldownActive(false);
  }, [cooldownKey]);

  const handleActivationSuccess = useCallback(
    (source: "sse" | "api") => {
      if (activationConfirmedRef.current) return;
      activationConfirmedRef.current = true;

      localStorage.setItem(
        "ira-cpe-serial-number",
        serialNumber || "SN not found"
      );

      resetAttemptStorage();
      stopCooldown();
      clearTimeoutSafe();
      clearSse();

      // pastikan status step 2 success
      setInternetStatus("success");

      setScreen("success");

      if (source === "sse") {
        toast.success("Aktivasi berhasil! Konektivitas terjamin.");
      } else {
        toast.success("Perangkat berhasil diaktivasi.");
      }
    },
    [
      serialNumber,
      resetAttemptStorage,
      stopCooldown,
      clearTimeoutSafe,
      clearSse,
    ]
  );

  const handleTimeout = useCallback(() => {
    clearSse();
    clearTimeoutSafe();
    setScreen("timedOut");
  }, [clearSse, clearTimeoutSafe]);

  // blok refresh/tab close saat loading dan belum sukses
  useEffect(() => {
    if (screen === "loading" && !activationConfirmedRef.current) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [screen]);

  // restore attempt
  useEffect(() => {
    const savedFailed = Number(sessionStorage.getItem(attemptKey) || "0");
    const currentAttempt = Math.min(MAX_ATTEMPT, savedFailed + 1);
    setAttempt(currentAttempt);
  }, [attemptKey]);

  // restore cooldown
  useEffect(() => {
    const savedEndAt = localStorage.getItem(cooldownKey);
    if (!savedEndAt) return;

    const remaining = Math.ceil((Number(savedEndAt) - Date.now()) / 1000);
    if (remaining > 0) {
      setCooldown(remaining);
      setIsCooldownActive(true);
    } else {
      localStorage.removeItem(cooldownKey);
      setCooldown(0);
      setIsCooldownActive(false);
    }
  }, [cooldownKey]);

  // cooldown ticker
  useEffect(() => {
    if (!isCooldownActive || cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown, isCooldownActive]);

  // cooldown selesai
  useEffect(() => {
    if (cooldown <= 0 && isCooldownActive) {
      setIsCooldownActive(false);
      localStorage.removeItem(cooldownKey);
    }
  }, [cooldown, isCooldownActive, cooldownKey]);

  // ✅ auto start cooldown saat masuk loading (disabled awal)
  useEffect(() => {
    if (screen !== "loading") return;
    if (activationConfirmedRef.current) return;

    if (!localStorage.getItem(cooldownKey)) {
      startCooldown(CHECK_COOLDOWN_SEC);
    }
  }, [screen, cooldownKey, startCooldown]);

  // ✅ saat loading dimulai/restart, reset status step agar tampil bersih
  useEffect(() => {
    if (screen !== "loading") return;
    if (!serialNumber || !customer_id) return;

    // step 1 langsung dianggap "loading" (karena proses aktivasi sedang berlangsung)
    setActivateStatus("loading");
    setInternetStatus("idle"); // internet test nunggu event ping-test
  }, [screen, serialNumber, customer_id]);

  // SSE subscription
  useEffect(() => {
    if (!customer_id || !serialNumber) return;
    if (screen !== "loading") return;
    if (activationConfirmedRef.current) return;

    setSseStatus("connecting");

    clearSse();
    clearTimeoutSafe();

    const es = new EventSourcePolyfill(
      `${
        process.env.NEXT_PUBLIC_API_URL_SSE
      }/sse/events?clientName=${encodeURIComponent(
        `${customer_id}-web`
      )}&replace=true`,
      {
        headers: { "x-sse-token": "LOCALWEAVE" },
        heartbeatTimeout: 600_000,
      }
    );

    eventSourceRef.current = es;

    es.onopen = () => setSseStatus("open");
    es.onerror = () => setSseStatus("error");

    const onActivate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data?.type !== "activate") return;
        if (data?.sn !== serialNumber) return;

        // selama ada event activate, step 1 tetap proses
        setActivateStatus("loading");

        if (data?.message === "Success" || data?.result === "processed") {
          setActivateStatus("success"); // ✅ aktivasi network sukses
          setInternetStatus((prev) => (prev === "idle" ? "loading" : prev)); // mulai menuju ping test
          toast.success(
            "Aktivasi jaringan berhasil. Mengecek koneksi internet..."
          );
        } else {
          // kalau server kirim event activate tapi bukan success, kita bisa tandai gagal
          setActivateStatus("failed");
        }
      } catch {}
    };

    const onPingTest = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data?.type !== "ping-test-activate") return;
        if (data?.sn !== serialNumber) return;

        // ping test sedang berjalan
        setInternetStatus("loading");

        if (data?.message === "Success") {
          setInternetStatus("success");
          handleActivationSuccess("sse");
          return;
        }

        // ping test gagal / bukan success
        setInternetStatus("failed");
        // screen tetap loading (biar user bisa cek status / retry)
      } catch {}
    };

    es.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);

        // Pastikan ini adalah event untuk serial number ini
        if (data?.sn !== serialNumber) return;

        if (data?.type === "activate") {
          // Handle activate
          setActivateStatus("loading");
          if (data?.message === "Success" || data?.result === "processed") {
            setActivateStatus("success");
            setInternetStatus((prev) => (prev === "idle" ? "loading" : prev));
            toast.success(
              "Aktivasi jaringan berhasil. Mengecek koneksi internet..."
            );
          } else {
            setActivateStatus("failed");
          }
        } else if (data?.type === "ping-test-activate") {
          // Handle ping test
          setInternetStatus("loading");
          if (data?.message === "Success" || data?.result === "processed") {
            setInternetStatus("success");
            handleActivationSuccess("sse");
          } else {
            setInternetStatus("failed");
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    timeoutRef.current = setTimeout(handleTimeout, SSE_TIMEOUT_MS);

    return () => {
      try {
        es.removeEventListener("activate", onActivate as any);
        es.removeEventListener("ping-test-activate", onPingTest as any);
      } catch {}
      try {
        es.close();
      } catch {}
      clearTimeoutSafe();
    };
  }, [
    customer_id,
    serialNumber,
    screen,
    clearSse,
    clearTimeoutSafe,
    handleTimeout,
    handleActivationSuccess,
  ]);

  async function handleCheckAgain() {
    if (!serialNumber) return;
    if (activationConfirmedRef.current) return;

    if (attempt >= MAX_ATTEMPT) {
      setScreen("failedFinal");
      return;
    }

    const nextAttempt = Math.min(MAX_ATTEMPT, attempt + 1);
    setAttempt(nextAttempt);

    startCooldown(CHECK_COOLDOWN_SEC);

    try {
      toast.loading("Mengecek ulang status aktivasi...", { id: "refresh" });

      // Jalankan secara paralel (lebih efisien)
      const [resActivate, resInternet] = await Promise.all([
        refreshTask({ type: "activate" }),
        refreshTask({ type: "ping-test-activate" }),
      ]);

      toast.success("Permintaan cek status dikirim", { id: "refresh" });

      const activateSuccess = resActivate?.data?.code === 0;
      const activatePending = resActivate?.data?.code === 2;

      const internetSuccess = resInternet?.data?.code === 0;
      const internetPending = resInternet?.data?.code === 2;

      // 🔹 Kasus 1: Keduanya sukses → aktivasi selesai
      if (activateSuccess && internetSuccess) {
        setActivateStatus("success");
        setInternetStatus("success");
        handleActivationSuccess("api");
        return;
      }

      // 🔹 Kasus 2: Salah satu/salah dua masih pending → tetap di loading
      if (activatePending || internetPending) {
        // Update status step sesuai respons
        if (activateSuccess) setActivateStatus("success");
        else if (activatePending) setActivateStatus("loading");
        else setActivateStatus("failed");

        if (internetSuccess) setInternetStatus("success");
        else if (internetPending) setInternetStatus("loading");
        else setInternetStatus("failed");

        setScreen("loading");
        return;
      }

      // 🔹 Kasus 3: Tidak ada yang pending, tapi tidak semua sukses → gagal
      setActivateStatus(activateSuccess ? "success" : "failed");
      setInternetStatus(internetSuccess ? "success" : "failed");

      const failedCount = nextAttempt - 1;
      saveFailedAttemptStorage(failedCount);

      if (nextAttempt >= MAX_ATTEMPT) {
        setScreen("failedFinal");
      } else {
        setScreen("failed");
      }
    } catch (err: any) {
      toastErrorFromAPI(err, "refresh");
    }
  }

  function goNextSetting() {
    addUrlParam("section", "setting");
  }

  function contactCS() {
    const msg = encodeURIComponent(
      `Halo CS, saya butuh bantuan aktivasi modem IRA.\nSN: ${serialNumber}`
    );
    const phone = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  const handleRestart = () => {
    activationConfirmedRef.current = false;

    setSseStatus("connecting");
    setScreen("loading");
    setAttempt(1);

    setActivateStatus("loading");
    setInternetStatus("idle");

    resetAttemptStorage();
    stopCooldown();

    clearSse();
    clearTimeoutSafe();

    startCooldown(CHECK_COOLDOWN_SEC);
  };

  const sseHint =
    sseStatus === "open"
      ? "Terhubung ke server aktivasi"
      : sseStatus === "error"
      ? "Koneksi server tidak stabil — kamu masih bisa cek status manual"
      : "Menyambungkan ke server aktivasi...";

  // ---- UI ----
  if (screen === "timedOut") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-old-primary">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-8">
          <div className="text-old-primary font-bold">
            Proses Aktivasi <Badge color="red">Waktu Habis</Badge>
          </div>
          <p className="text-[#666] max-w-170 mx-auto mt-2">
            Proses aktivasi memakan waktu terlalu lama. Coba ulangi aktivasi,
            atau hubungi Customer Service bila tetap tidak berhasil.
          </p>
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-4">
          <button
            onClick={contactCS}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
          </button>

          <button
            onClick={handleRestart}
            className="w-full bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (screen === "loading") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-old-primary">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-8 flex flex-col items-center justify-center px-6 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 relative flex justify-center items-center">
            <div className="absolute -left-22.5 top-1/2 transform -translate-y-1/2 z-0">
              <SignalArc isLeft={true} />
            </div>

            <Image
              src={CPEIRA}
              alt="Activating CPE"
              className="w-auto h-auto max-w-37.5 sm:max-w-50 z-10 relative"
              priority
            />

            <div className="absolute -right-22.5 top-1/2 transform -translate-y-1/2 z-0">
              <SignalArc isLeft={false} />
            </div>
          </div>

          <div className="text-[12px] text-[#666]">{sseHint}</div>
        </div>

        {/* ✅ Dua step terpisah tampil bersamaan */}
        <div className="pt-2 max-w-120 mx-auto flex flex-col gap-3">
          <StepRow
            title="Aktivasi ke Network"
            subtitle="Mengaktifkan perangkat dan mendaftarkan ke jaringan inti."
            status={activateStatus}
          />
          <StepRow
            title="Koneksi ke Internet"
            subtitle="Uji konektivitas internet (ping test) untuk memastikan online."
            status={internetStatus}
          />
        </div>

        <div className="pt-4">
          <p className="text-black max-w-4xl mx-auto mt-2">
            Aktivasi biasanya selesai dalam ±2 menit. Mohon jangan menutup
            halaman ini. Jika koneksi internet belum terverifikasi, kamu bisa
            cek status aktivasi secara manual.
          </p>
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-4">
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
            {isCooldownActive
              ? `Cek Status Aktivasi (${formatTime(cooldown)})`
              : "Cek Status Aktivasi"}
          </button>

          <div className="text-[12px] text-[#666]">
            Percobaan: <span className="font-semibold">{attempt}</span>/
            {MAX_ATTEMPT}
          </div>
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
          <FaWifi size={40} />
        </div>

        <div className="my-6">
          <div className="text-old-primary font-bold">
            Proses Aktivasi <Badge color="green">Berhasil</Badge>
          </div>
          <p className="max-w-170 mx-auto mt-2">
            Perangkat sudah terhubung ke jaringan inti dan konektivitas internet
            sudah terverifikasi. Kamu bisa lanjut ke pengaturan WiFi.
          </p>
        </div>

        <div className="pt-6 flex flex-col gap-4 max-w-120 mx-auto">
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
            Proses Aktivasi <Badge color="red">Tidak Berhasil</Badge>
          </div>
          <p className="text-[#666] max-w-170 mx-auto mt-2">
            Aktivasi tidak berhasil setelah {MAX_ATTEMPT} percobaan. Hubungi
            Customer Service untuk bantuan lebih lanjut.
          </p>
          <div className="text-old-primary font-bold mt-1">
            ({MAX_ATTEMPT}/{MAX_ATTEMPT})
          </div>
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-4">
          <button
            onClick={contactCS}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
          </button>

          <button
            onClick={handleRestart}
            className="w-full bg-white border-2 border-primary text-primary hover:bg-red-50 cursor-pointer font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Coba Ulang dari Awal
          </button>
        </div>
      </div>
    );
  }

  if (screen === "failed") {
    return (
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-dark-primary">
          Menghubungkan Perangkat ke Jaringan
        </h2>

        <div className="pt-8">
          <div className="text-old-primary font-bold">
            Proses Aktivasi <Badge color="red">Tidak Berhasil</Badge>
          </div>
          <p className="text-[#666] max-w-170 mx-auto mt-2">
            Aktivasi belum berhasil. Kamu bisa ulangi cek status, atau hubungi
            Customer Service bila butuh bantuan.
          </p>
          <div className="text-old-primary font-bold mt-1">
            ({attempt}/{MAX_ATTEMPT})
          </div>
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-4">
          <button
            onClick={handleCheckAgain}
            className="w-full bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Ulangi Proses Aktivasi
          </button>

          <button
            onClick={contactCS}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-red-50 cursor-pointer font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
