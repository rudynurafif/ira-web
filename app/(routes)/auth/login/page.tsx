"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import { verifyOtp, sendOtpLogin } from "@/app/_api/Auth/Auth";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import {
  PHONE_REGEX,
  formatTimer,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useAppDispatch } from "@/app/store/store";
import { login } from "@/app/store/slice/authSlice";
import { sanitizeAlphanumeric } from "@/app/_shared/utils/formatter";

type Step = "enterPhone" | "enterOtp" | "blocked";
const MAX_ATTEMPT = 4;

const Page = () => {
  const router = useRouter();

  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");
  const [successVerifyMessage, setSuccessVerifyMessage] = useState<string>("");
  const [errorVerifyOtp, setErrorVerifyOtp] = useState<string>("");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [apiCooldownSec, setApiCooldownSec] = useState<number | null>(null);

  const [step, setStep] = useState<Step>("enterPhone");
  const [requestCount, setRequestCount] = useState<number>(0);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);
  const [resendLeft, setResendLeft] = useState<number>(0);
  const [blockLeft, setBlockLeft] = useState<number>(0);

  const [userLocation, setUserLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });

  const getUserLocation = (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          resolve(null);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const validPhoneNumber = PHONE_REGEX.test(phone);
  const storageKeys = useMemo(() => {
    const p = phone || "__none__";
    return {
      // ✅ jadikan per-nomor
      resendTimer: `otp:login:phone:${p}`,
      reqCount: `otp_request_count:${p}`,
      blockUntil: `otp_block_until:${p}`,
    };
  }, [phone]);

  const dispatch = useAppDispatch();

  // Restore state dari sessionStorage saat nomor berubah
  useEffect(() => {
    const cnt = parseInt(
      sessionStorage.getItem(storageKeys.reqCount) || "0",
      10
    );
    const blk = sessionStorage.getItem(storageKeys.blockUntil);
    setRequestCount(Number.isFinite(cnt) ? cnt : 0);
    setBlockUntil(blk ? parseInt(blk, 10) : null);
  }, [storageKeys.reqCount, storageKeys.blockUntil]);

  useEffect(() => {
    // Jangan paksa ke "blocked" kalau user sedang di layar "enterPhone"
    if (blockUntil && Date.now() < blockUntil && step !== "enterPhone") {
      setStep("blocked");
    } else if (
      step === "blocked" &&
      (!blockUntil || Date.now() >= blockUntil)
    ) {
      // Jika masa blokir habis, balikkan ke enterPhone
      setStep("enterPhone");
    }
  }, [blockUntil, step]);

  // ---- Hook ringan untuk membaca sisa detik dari sessionStorage (resend timer)
  useEffect(() => {
    const readLeft = () => {
      const exp = parseInt(
        sessionStorage.getItem(storageKeys.resendTimer) || "0",
        10
      );
      const left =
        exp > 0 ? Math.max(0, Math.floor((exp - Date.now()) / 1000)) : 0;
      setResendLeft(left);
    };
    readLeft();
    const id = setInterval(readLeft, 1000);
    return () => clearInterval(id);
  }, [storageKeys.resendTimer]);

  const startResendTimer = (durationSec: number) => {
    if (!Number.isFinite(durationSec) || durationSec <= 0) return;
    const expiry = Date.now() + durationSec * 1000;
    sessionStorage.setItem(storageKeys.resendTimer, String(expiry));
    setResendLeft(durationSec);
    setOtpExpiry(expiry);
  };

  useEffect(() => {
    if (!blockUntil) return;

    const tick = () => {
      const left = Math.max(0, Math.floor((blockUntil - Date.now()) / 1000));
      setBlockLeft(left);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [blockUntil]);

  useEffect(() => {
    if (!blockUntil) return;

    const tick = () => {
      const left = Math.max(0, Math.floor((blockUntil - Date.now()) / 1000));
      setBlockLeft(left);
      if (left === 0) {
        sessionStorage.removeItem(storageKeys.blockUntil);
        setBlockUntil(null);
        if (step === "blocked") setStep("enterPhone");
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [blockUntil, step, storageKeys.blockUntil]);

  // Dipanggil setiap kali tombol Kirim OTP / Kirim Ulang OTP ditekan dari PhoneOTPForm.
  const handleAfterSendOtp = async () => {
    if (!validPhoneNumber) {
      toast.error("Nomor handphone belum valid");
      return;
    }

    // jika masih ada blok dari API sebelumnya, jangan paksa kirim
    if (blockUntil && Date.now() < blockUntil) {
      setStep("blocked");
      return;
    }

    try {
      const res = await sendOtpLogin({ phone_number: phone });

      if (res?.data?.statusCode !== 200) {
        throw new Error(res?.data?.message || "Gagal mengirim OTP");
      }

      const apiData = res.data.data ?? {};
      const attemptFromApi = Number(apiData.attempt ?? 0);
      // simpan attempt dari API
      sessionStorage.setItem(storageKeys.reqCount, String(attemptFromApi));
      setRequestCount(attemptFromApi);

      // === Cooldown setelah sukses kirim (DINAMIS):
      let cooldownSec: number | null = null;

      if (Number.isFinite(apiData.cooldownSec)) {
        cooldownSec = Number(apiData.cooldownSec);
      } else {
        const retryAfter =
          res?.headers?.["retry-after"] || res?.headers?.["Retry-After"];
        if (retryAfter && /^\d+$/.test(String(retryAfter))) {
          cooldownSec = parseInt(String(retryAfter), 10);
        }
      }

      setApiCooldownSec(cooldownSec ?? null);
      if (cooldownSec) startResendTimer(cooldownSec);

      setStep("enterOtp");
      toast.success(`${res?.data?.message ?? "OTP terkirim"} ke ${phone}`);
    } catch (error: any) {
      const seconds = error?.response?.data?.data?.second;

      const lastAttempt = Number(
        sessionStorage.getItem(storageKeys.reqCount) ?? requestCount ?? 0
      );

      if (lastAttempt >= MAX_ATTEMPT) {
        // attempt sudah 4 atau resend sudah 3 kali → request berikutnya memicu tampilan blokir
        if (Number.isFinite(seconds) && seconds! > 0) {
          const until = Date.now() + seconds! * 1000;
          sessionStorage.setItem(storageKeys.blockUntil, String(until));
          setBlockUntil(until);
        }
        setStep("blocked");
        toastErrorFromAPI(error, "Gagal mengirim OTP");
        return;
      } else {
        if (Number.isFinite(seconds) && seconds! > 0) {
          startResendTimer(seconds!);
        }
        toastErrorFromAPI(error, "Gagal mengirim OTP");
        return;
      }
    }
  };

  useEffect(() => {
    if (!blockUntil) return;
    if (Date.now() >= blockUntil) {
      sessionStorage.removeItem(storageKeys.blockUntil);
      setBlockUntil(null);
      if (step === "blocked") setStep("enterPhone");
    }
  }, [blockUntil, step, storageKeys.blockUntil]);

  // Reset counter kalau user ganti nomor
  const resetCountersForNewPhone = () => {
    sessionStorage.removeItem(storageKeys.reqCount);
    sessionStorage.removeItem(storageKeys.resendTimer);
    sessionStorage.removeItem(storageKeys.blockUntil);
    setRequestCount(0);
    setBlockUntil(null);
    setStep("enterPhone");
    setOtpStatus("idle");
    setSuccessVerifyMessage("");
    setErrorVerifyOtp("");
  };

  async function handleVerifyOtp(val: string) {
    if (!validPhoneNumber) {
      toast.error("Nomor handphone belum valid");
      return;
    }

    try {
      setOtpStatus("verifying");

      let locationPayload = { longitude: "", latitude: "" };

      try {
        const location = await getUserLocation();
        if (location) {
          locationPayload = {
            longitude: location.longitude.toString(),
            latitude: location.latitude.toString(),
          };
          setUserLocation(location);
        }
      } catch (geoErr) {
        console.warn("Gagal dapatkan lokasi:", geoErr);
      }

      const payload = {
        phone_number: phone,
        ...locationPayload,
        platform: "web",
        otp: val,
        type: "login",
      };

      const res = await verifyOtp(payload);

      if (res?.data?.statusCode === 200) {
        const { data, message } = res.data;

        dispatch(login({ token: data }));
        setCookie("token-ira", data);

        setOtpStatus("valid");
        setSuccessVerifyMessage(message || "OTP terverifikasi ✔");
        toast.success(message || "OTP terverifikasi ✔");
        toast.success("Login Berhasil!");

        window.location.href = "/customer-area";
        // router.push("/customer-area");
      }
    } catch (err: any) {
      setOtpStatus("invalid");
      toastErrorFromAPI(err, "Verifikasi OTP gagal. Silahkan coba lagi.");
      setErrorVerifyOtp(
        err?.response?.data?.message ?? "Verifikasi OTP gagal. Coba lagi."
      );
    }
  }

  const renderEnterPhone = () => (
    <div className="flex w-full items-start justify-center px-5 sm:my-22 my-6">
      <div className="w-full max-w-xl">
        <h1 className="mb-8 text-center text-old-primary font-extrabold sm:text-[32px] text-2xl">
          Login Internet Rakyat (IRA)
        </h1>

        <div className="flex flex-col gap-7">
          <div>
            <PhoneOTPForm
              storageKey={storageKeys.resendTimer}
              otpDurationSec={60}
              label="Nomor Handphone"
              inputMode="numeric"
              name="phone"
              mode="login"
              hint
              onChange={(value: string) => {
                const onlyDigits = value.replace(/[^0-9]/g, "");
                // Jika user ganti nomor → reset counter dan block
                if (phone && onlyDigits !== phone) resetCountersForNewPhone();
                setPhone(onlyDigits);
              }}
              isImportant
              value={phone}
              placeholder="Masukkan nomor handphone yang terdaftar"
              onSendOTP={handleAfterSendOtp}
              externalExpiry={otpExpiry}
            />
            {!validPhoneNumber && phone.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Nomor handphone tidak valid
              </p>
            )}
          </div>

          {/* <p className="text-center text-md text-primary-text">
            Belum punya akun IRA?{" "}
            <Link
              href="/auth/register"
              className="underline-animation-register font-semibold text-primary"
            >
              Daftar disini
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );

  const renderEnterOtp = () => (
    <div className="flex w-full items-start justify-center px-5 my-10">
      <div className="w-full max-w-xl">
        <div className="">
          <button
            onClick={() => setStep("enterPhone")}
            className="px-4 py-2 mb-5 flex items-center gap-2 rounded-lg text-xl cursor-pointer hover:underline"
          >
            <IoMdArrowRoundBack /> Kembali
          </button>
        </div>

        <h1 className="mb-5 text-center font-extrabold text-[28px]">
          Masukkan Kode OTP Anda
        </h1>

        <div className="text-sm text-center  mb-2">
          Kode OTP sudah dikirim ke nomor <b>{phone}</b>. Anda dapat meminta
          ulang OTP maksimal <b>3 kali</b>, apabila kode OTP ke WhatsApp/SMS
          tidak masuk.
        </div>

        <div className="mb-3">
          <div className="text-center">
            <GroupedOTP
              label="Masukkan OTP yang dikirim via Whatsapp/SMS"
              isImportant
              name="otp"
              value={otp}
              isInvalid={otpStatus === "invalid"}
              onChange={(value: string) => {
                const cleaned = sanitizeAlphanumeric(value);
                setOtp(cleaned);
                if (otpStatus !== "idle") setOtpStatus("idle");
              }}
              onComplete={(val) => handleVerifyOtp(val)}
              classNameStyle="flex justify-center items-center"
            />
          </div>

          {otpStatus === "verifying" && (
            <p className="text-primary mt-2 text-sm italic text-center">
              Memverifikasi OTP…
            </p>
          )}
          {otpStatus === "valid" && (
            <p className="text-green-600 mt-2 text-sm text-center">
              {successVerifyMessage ?? "OTP valid ✔"}
            </p>
          )}
          {otpStatus === "invalid" && (
            <p className="text-red-500 mt-2 text-sm text-center">
              {errorVerifyOtp ?? "Kode OTP tidak valid / kedaluwarsa"}
            </p>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-700">
          Tidak menerima OTP?{" "}
          {resendLeft > 0 ? (
            <span className="inline-flex cursor-not-allowed items-center gap-1 font-semibold">
              Tunggu ⏳ {formatTimer(resendLeft)} untuk kirim ulang
            </span>
          ) : (
            <button
              onClick={handleAfterSendOtp}
              className="text-primary font-semibold underline-animation-register cursor-pointer transition"
            >
              Klik Kirim Ulang OTP
            </button>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Maksimal 3 kali pengiriman ulang. ({Math.min(requestCount - 1, 3)}/
            {3})
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlocked = () => {
    return (
      <div className="flex w-full items-start justify-center px-5 my-11">
        <div className="w-full max-w-3xl text-center">
          <div className="">
            <button
              onClick={() => setStep("enterPhone")}
              className="px-4 py-2 mb-5 flex items-center gap-2 rounded-lg text-xl cursor-pointer hover:underline"
            >
              <IoMdArrowRoundBack /> Kembali
            </button>
          </div>

          <h1 className="mb-3 text-dark-primary font-extrabold text-2xl md:text-[30px]">
            Tunggu 30 Menit Sebelum Kirim OTP Lagi
          </h1>
          <p className="text-gray-600 sm:text-base text-sm">
            Anda sudah melakukan <b>3 kali permintaan OTP</b>. Untuk keamanan
            akun, sistem akan mengunci permintaan OTP selama 30 menit.
          </p>

          <div className="mt-6 text-[34px] font-extrabold text-nokia-blue flex items-center justify-center gap-3">
            ⏳ {formatTimer(blockLeft)}
          </div>

          <button
            className="mt-8 w-full max-w-md mx-auto bg-gray-400 text-white py-3 rounded-xl cursor-not-allowed"
            disabled
          >
            Coba Lagi
          </button>

          {/* Otomatis kembali ke enterPhone ketika blokir habis */}
          {blockLeft === 0 && (
            <div className="mt-6">
              <button
                onClick={() => {
                  // bersihkan blokir dan counter
                  sessionStorage.removeItem(storageKeys.blockUntil);
                  sessionStorage.removeItem(storageKeys.reqCount);
                  setBlockUntil(null);
                  setRequestCount(0);
                  setStep("enterPhone");
                }}
                className="text-dark-primary font-semibold hover:underline"
              >
                Masa tunggu habis — Kirim OTP lagi
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== Main render
  if (step === "blocked") return renderBlocked();
  if (step === "enterOtp") return renderEnterOtp();
  return renderEnterPhone();
};

export default Page;

function formatPhoneMask(p: string) {
  if (!p) return "-";
  if (p.length <= 4) return p;
  const head = p.slice(0, 4);
  const tail = p.slice(-4);
  return `${head}****${tail}`;
}
