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
import { getDealerSuppPhone } from "@/app/_api/Customer/CustomerArea";
import { Activation } from "@/app/_api/Activation/Activation";
import { getSetting } from "@/app/_api/Settings/Settings";
import {
  incrementFailedAttempt,
  resetFailedAttempt,
  hasReachedMaxAttempts,
  getCurrentAttemptCount,
  FAILED_ATTEMPT_CONFIG,
} from "@/app/_shared/utils/failedAttemptCounter";
import { useAppSelector } from "@/app/store/store";

type Screen = "loading" | "failed" | "failedFinal" | "success" | "timedOut";
type StepStatus = "idle" | "loading" | "success" | "failed";

const MAX_ATTEMPT = 3;
const CHECK_COOLDOWN_SEC = 120; // refresh task
const SSE_TIMEOUT_MS = 10 * 60 * 1000; // sse timeout 10 menit

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
      <span className="w-4.5 h-4.5 rounded-full bg-gray-300 inline-block" />
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
        {/* {badge} */}
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
  const [attempt, setAttempt] = useState(0);

  // cooldown
  const [cooldown, setCooldown] = useState(0);
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  // status SSE sederhana untuk UI
  const [sseStatus, setSseStatus] = useState<"connecting" | "open" | "error">(
    "connecting",
  );

  // step status terpisah
  const [activateStatus, setActivateStatus] = useState<StepStatus>("loading");
  const [internetStatus, setInternetStatus] = useState<StepStatus>("loading");

  // refs
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activationConfirmedRef = useRef(false);

  const { userInfo } = useAppSelector((state) => state.auth);

  const [phoneCSIRA, setPhoneCSIRA] = useState<string | null>("");

  const activateSuccessRef = useRef(false);

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

  const clearSse = useCallback((id?: string) => {
    if (eventSourceRef.current) {
      console.log(`CloseOperation: Closing SSE connection via clearSse ${id}`);
      try {
        eventSourceRef.current.close();
      } catch (err) {
        console.warn("CloseOperation: Error while closing SSE", err);
      }
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
    [attemptKey],
  );

  const startCooldown = useCallback(
    (seconds: number) => {
      const endAt = Date.now() + seconds * 1000;
      sessionStorage.setItem(cooldownKey, String(endAt));
      setCooldown(seconds);
      setIsCooldownActive(true);
    },
    [cooldownKey],
  );

  const stopCooldown = useCallback(() => {
    sessionStorage.removeItem(cooldownKey);
    setCooldown(0);
    setIsCooldownActive(false);
  }, [cooldownKey]);

  const handleActivationSuccess = useCallback(
    (source: "sse" | "api" | "timeout") => {
      if (activationConfirmedRef.current) return;
      activationConfirmedRef.current = true;

      resetFailedAttempt();

      resetAttemptStorage();
      stopCooldown();
      clearTimeoutSafe();
      clearSse("1 from activate success");

      // pastikan status step 2 success
      setActivateStatus("success");
      setInternetStatus("success");

      setScreen("success");

      if (source === "sse") {
        toast.success("Aktivasi berhasil! Konektivitas terjamin.");
      } else {
        toast.success("Perangkat berhasil diaktivasi.");
      }
    },
    [resetAttemptStorage, stopCooldown, clearTimeoutSafe, clearSse],
  );

  const handleTimeout = useCallback(() => {
    clearSse("2 from timeout 10 min");
    clearTimeoutSafe();

    // ✅ Jika aktivasi sudah sukses, langsung success (Case 2)
    if (activateStatus === "success" || activateSuccessRef.current) {
      handleActivationSuccess("timeout");
    } else {
      setScreen("timedOut");
    }
  }, [activateStatus, clearSse, clearTimeoutSafe, handleActivationSuccess]);

  // blok refresh/tab close saat loading dan belum sukses
  useEffect(() => {
    if (screen === "loading" && !activationConfirmedRef.current) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
        // return "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [screen]);

  // Cegah back navigation saat loading
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Batalkan navigasi mundur
      window.history.pushState(null, "", window.location.href);

      // Tampilkan konfirmasi
      const confirmed = window.confirm(
        "Proses aktivasi sedang berlangsung.\nJika Anda meninggalkan halaman, proses akan dibatalkan.\n\nYakin ingin kembali?",
      );

      if (confirmed) {
        // Arahkan ke /activation (bukan kembali ke halaman sebelumnya)
        window.location.href = "/activation";
      }
      // Jika tidak dikonfirmasi, user tetap di halaman (karena pushState di atas)
    };

    // Push state awal
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [screen]);

  // restore attempt
  useEffect(() => {
    const savedFailedStr = sessionStorage.getItem(attemptKey);
    if (savedFailedStr !== null) {
      const savedFailed = Number(savedFailedStr);
      // Hanya set attempt jika ada data tersimpan (artinya pernah gagal)
      setAttempt(Math.min(MAX_ATTEMPT, savedFailed + 1));
    }
    // Jika tidak ada di sessionStorage, biarkan attempt = 0 (default dari useState)
  }, [attemptKey]);

  // restore cooldown
  useEffect(() => {
    const savedEndAt = sessionStorage.getItem(cooldownKey);
    if (!savedEndAt) return;

    const remaining = Math.ceil((Number(savedEndAt) - Date.now()) / 1000);
    if (remaining > 0) {
      setCooldown(remaining);
      setIsCooldownActive(true);
    } else {
      sessionStorage.removeItem(cooldownKey);
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
      sessionStorage.removeItem(cooldownKey);
    }
  }, [cooldown, isCooldownActive, cooldownKey]);

  // auto start cooldown saat masuk loading (disabled awal)
  useEffect(() => {
    if (screen !== "loading") return;
    if (activationConfirmedRef.current) return;

    if (!sessionStorage.getItem(cooldownKey)) {
      startCooldown(CHECK_COOLDOWN_SEC);
    }
  }, [screen, cooldownKey, startCooldown]);

  // SSE subscription
  useEffect(() => {
    if (screen !== "loading") return;
    if (!customer_id || !serialNumber) return;
    if (activationConfirmedRef.current) return;

    if (eventSourceRef.current) return;

    setSseStatus("connecting");
    clearTimeoutSafe();

    const es = new EventSourcePolyfill(
      `${
        process.env.NEXT_PUBLIC_API_URL_SSE
      }/sse/events?clientName=${encodeURIComponent(
        `${customer_id}-web`,
      )}&replace=true`,
      {
        headers: { "x-sse-token": "LOCALWEAVE" },
        heartbeatTimeout: 600_000,
      },
    );

    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("SSE Open");
      setSseStatus("open");
    };
    es.onerror = () => {
      console.log("SSE Close");
      setSseStatus("error");
    };

    es.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);

        if (data?.sn !== serialNumber) return;

        // Handle activate
        if (data?.type === "activate") {
          setActivateStatus("loading");
          if (data?.message === "Success") {
            activateSuccessRef.current = true;
            setActivateStatus("success");
            setInternetStatus("loading");
            toast.success(
              "Aktivasi jaringan berhasil. Mengecek koneksi internet...",
            );
          } else {
            activateSuccessRef.current = false;
            incrementFailedAttempt(serialNumber);

            stopCooldown();
            setActivateStatus("failed");
            setInternetStatus("failed");
            setScreen("failed");
            clearSse("4");
            clearTimeoutSafe();
            const currentAttempt = attempt;
            saveFailedAttemptStorage(currentAttempt);
          }
        }

        if (data?.type === "ping-test-activate" && activateSuccessRef.current) {
          if (data?.message === "Success") {
            setInternetStatus("success");
            setTimeout(() => {
              if (!activationConfirmedRef.current) {
                handleActivationSuccess("sse");
              }
            }, 2000);
          } else {
            incrementFailedAttempt(serialNumber);
            setInternetStatus("success");
            setTimeout(() => {
              if (!activationConfirmedRef.current) {
                handleActivationSuccess("sse");
              }
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    timeoutRef.current = setTimeout(handleTimeout, SSE_TIMEOUT_MS);

    return () => {
      try {
        es.close();
      } catch {}
      eventSourceRef.current = null;
      clearTimeoutSafe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer_id, serialNumber, screen, clearTimeoutSafe, handleTimeout]);

  async function handleCheckStatus() {
    if (!serialNumber) return;
    if (activationConfirmedRef.current) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error(
        "Tidak ada koneksi internet. Silakan periksa jaringan Anda dan silahkan input Serial Number CPE ulang.",
      );
      addUrlParam("section", "input");
      return;
    }

    startCooldown(CHECK_COOLDOWN_SEC);

    try {
      toast.loading("Mengecek ulang status aktivasi...", { id: "refresh" });

      // 🔹 1. Tunggu ACTIVATE dulu
      const resActivate = await refreshTask({ type: "activate" });
      const activateSuccess = resActivate?.data?.code === 0;
      const activatePending = resActivate?.data?.code === 2;

      // 🔹 2. Jika ACTIVATE gagal → langsung handle failure
      if (!activateSuccess && !activatePending) {
        setActivateStatus("failed");
        setInternetStatus("failed");
        setScreen("failed");

        toast.error(
          resActivate?.data?.data?.error_message ??
            "Aktivasi gagal. Silakan coba lagi.",
          { id: "refresh" },
        );
        return;
      }

      // 🔹 3a. Jika aktivasi sukses → abaikan ping test, LANJUT KE SETTING
      if (activateSuccess) {
        activateSuccessRef.current = true;
        setActivateStatus("success");

        // di force, ga peduli hasil ping test
        setInternetStatus("success");

        // ⏳ kasih jeda 2 detik biar icon centang sempat terlihat
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // guard kalau user sudah sukses duluan via SSE selama jeda
        if (!activationConfirmedRef.current) {
          handleActivationSuccess("api");
        }

        return;
      }

      // 🔹 4. Jika activate pending → tetap di loading (tunggu SSE)
      setActivateStatus("loading");
      setInternetStatus("loading");
      setScreen("loading");
      toast.loading("Permintaan aktivasi dikirim. Menunggu konfirmasi...", {
        id: "refresh",
      });
    } catch (err: any) {
      incrementFailedAttempt(serialNumber);
      toastErrorFromAPI(err, "refresh");
      setActivateStatus("failed");
      setInternetStatus("failed");
      setScreen("failed");
    }
  }

  async function handleFailed() {
    if (!serialNumber) return;
    if (activationConfirmedRef.current) return;

    // Cek batas percobaan
    if (attempt >= MAX_ATTEMPT || hasReachedMaxAttempts()) {
      setScreen("failedFinal");
      return;
    }

    const nextAttempt = Math.min(MAX_ATTEMPT, attempt + 1);
    setAttempt(nextAttempt);
    startCooldown(CHECK_COOLDOWN_SEC);

    try {
      toast.loading("Mengirim permintaan aktivasi...", { id: "activate" });

      // 🔥 Panggil API aktivasi seperti di InputManualForm
      const res = await Activation({ sn: serialNumber });

      if (res.data.statusCode === 200 || res.data.statusCode === 201) {
        toast.loading(
          res.data.message ||
            "Permintaan aktivasi dikirim. Menunggu respons dari sistem...",
          { id: "activate" },
        );

        // Set status ke loading karena SSE akan menangani update selanjutnya
        setActivateStatus("loading");
        setInternetStatus("loading"); // atau "loading" jika langsung cek ping
        setScreen("loading");

        // Tidak perlu panggil refreshTask — biarkan SSE handle update
      } else {
        throw new Error(res.data.message || "Aktivasi gagal.");
      }
    } catch (err: any) {
      toast.dismiss("activate");
      toastErrorFromAPI(
        err,
        "Gagal mengirim permintaan aktivasi. Silakan coba lagi.",
      );

      // Simpan percobaan gagal
      saveFailedAttemptStorage(nextAttempt - 1);

      if (nextAttempt >= MAX_ATTEMPT || hasReachedMaxAttempts()) {
        setScreen("failedFinal");
      } else {
        setScreen("failed");
      }

      setActivateStatus("failed");
      setInternetStatus("failed");
    }
  }

  function goNextSetting() {
    window.location.href = "/customer-area";
    // addUrlParam("section", "setting");
  }

  useEffect(() => {
    const getPhoneCS = async () => {
      const resSetting = await getSetting("cs_phone");

      setPhoneCSIRA(
        resSetting.data?.data?.value ||
          process.env.NEXT_PUBLIC_PHONE_CS ||
          "6281110689111",
      );
    };

    if (screen === "failedFinal" || screen === "timedOut") getPhoneCS();
  }, [screen]);

  useEffect(() => {
    const handleOnline = () => {
      toast.success("Koneksi internet telah pulih.", { id: "offline-toast" });
    };

    const handleOffline = () => {
      toast.error(
        "Koneksi internet terputus. Segera pastikan Anda memiliki koneksi internet yang baik.",
        {
          id: "offline-toast",
          duration: 10000,
        },
      );
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  async function contactCS() {
    const msg = encodeURIComponent(
      `Halo Customer Service IRA 👋
      \n\nSaya mengalami kendala *gagal aktivasi layanan* setelah mencoba sebanyak *3 kali*, dan memerlukan bantuan lebih lanjut.
      \nBerikut detail data pelanggan saya:
      \n* *ID Pelanggan*: ${userInfo?.customer_code || "-"}
      \n* *Nama Pelanggan*: ${userInfo?.name || "-"}
      \n* *Nomor Telepon*: ${userInfo?.phone_number || "-"}
      \n* *SN CPE*: ${serialNumber}

      \n\nMohon bantuannya untuk dilakukan pengecekan dan proses aktivasi lanjutan.`,
    );
    try {
      const resPhone = await getDealerSuppPhone();

      if (resPhone.data.statusCode === 200) {
        const phone = resPhone.data?.data?.cs_phone_number ?? phoneCSIRA;

        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      }
    } catch (err: any) {
      toastErrorFromAPI(err ?? "Gagal mendapatkan nomor Customer Service");
    }
  }

  const handleRestart = () => {
    activationConfirmedRef.current = false;
    activateSuccessRef.current = false;

    setSseStatus("connecting");
    setScreen("loading");
    setAttempt(0);

    setActivateStatus("loading");
    setInternetStatus("loading");

    resetAttemptStorage();
    stopCooldown();

    clearSse("5");
    clearTimeoutSafe();

    startCooldown(CHECK_COOLDOWN_SEC);
  };

  const sseHint =
    sseStatus === "open"
      ? "Terhubung ke server aktivasi"
      : sseStatus === "error"
        ? "Koneksi server tidak stabil — kamu masih bisa cek status manual"
        : "Menyambungkan ke server aktivasi...";

  // ---- UI 10 menit ----
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
            className="w-full border-2 border-primary flex items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
          </button>

          <button
            onClick={handleRestart}
            className="w-full font-bold border-2 rounded-xl py-3 bg-white border-primary text-primary hover:bg-red-50 cursor-pointer"
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

          {/* <div className="text-[12px] text-[#666]">{sseHint}</div> */}
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
            Aktivasi biasanya selesai dalam ±5 menit. Mohon jangan menutup
            halaman ini. Jika koneksi internet belum terverifikasi, kamu bisa
            cek status aktivasi secara manual.
          </p>
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-4">
          <button
            onClick={handleCheckStatus}
            disabled={isCooldownActive}
            className={`w-full border-2 font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]
            ${
              isCooldownActive
                ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed!"
                : "bg-white border-primary text-primary hover:bg-red-50 cursor-pointer"
            }`}
            type="button"
          >
            {isCooldownActive
              ? `Cek Status Aktivasi (${formatTime(cooldown)})`
              : "Cek Status Aktivasi"}
          </button>

          {/* <div className="text-[12px] text-[#666]">
            Percobaan: <span className="font-semibold">{attempt}</span>/
            {MAX_ATTEMPT}
          </div> */}
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
          {/* <p className="max-w-170 mx-auto mt-2">
            Perangkat sudah terhubung ke jaringan inti dan konektivitas internet
            sudah terverifikasi. Kamu bisa lanjut ke pengaturan WiFi.
          </p> */}
          <p className="max-w-170 mx-auto mt-2">
            Perangkat Anda telah berhasil diaktifkan dan terhubung ke jaringan
            inti. Internet sekarang sudah siap digunakan.
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
            Proses aktivasi masih membutuhkan waktu silahkan coba kembali
          </p>
          {/* <div className="text-old-primary font-bold mt-1">
            ({attempt}/{MAX_ATTEMPT})
          </div> */}
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-4">
          <button
            onClick={handleFailed}
            className="w-full bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Ulangi Proses Aktivasi
          </button>

          {/* <button
            onClick={contactCS}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-red-50 cursor-pointer font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
          </button> */}
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
            Aktivasi perangkat tidak berhasil setelah beberapa saat. Hubungi
            Customer Service untuk bantuan lebih lanjut.
          </p>
          <div className="text-old-primary font-bold mt-1">
            ({getCurrentAttemptCount()}/{FAILED_ATTEMPT_CONFIG.MAX_ATTEMPTS})
          </div>
          {/* <div className="text-old-primary font-bold mt-1">
            ({MAX_ATTEMPT}/{MAX_ATTEMPT})
          </div> */}
        </div>

        <div className="pt-6 max-w-120 mx-auto flex flex-col gap-4">
          <button
            onClick={contactCS}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 cursor-pointer text-white font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Hubungi Customer Service <MdHeadsetMic size={20} />
          </button>

          {/* <button
            onClick={handleRestart}
            className="w-full bg-white border-2 border-primary text-primary hover:bg-red-50 cursor-pointer font-bold rounded-xl py-3 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]"
            type="button"
          >
            Coba Ulang dari Awal
          </button> */}
        </div>
      </div>
    );
  }

  return null;
}
