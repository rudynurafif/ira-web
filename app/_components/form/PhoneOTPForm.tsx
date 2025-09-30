import { sendOtp } from "@/app/_api/Auth/Auth";
import { formatTimer } from "@/app/_shared/utils";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function PhoneOTPForm({
  label,
  name,
  type = "text",
  value,
  isImportant,
  onChange,
  error,
  // ✅ props baru untuk kustomisasi
  storageKey, // mis: `otp:${name}` atau `otp:${userId}:${name}`
  otpDurationSec = 60, // default 60 detik
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  isImportant: boolean;
  onChange: (value: string) => void;
  error?: string;
  storageKey?: string;
  otpDurationSec?: number;
  [key: string]: any;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timerReset, setTimerReset] = useState(0);

  // ✅ key dinamis (fallback ke name)
  const key = storageKey ?? `otp:${name}`;

  // simpan ref interval agar aman dibersihkan
  const intervalRef = useRef<number | null>(null);

  // Restore timer dari localStorage saat mount / key berubah
  useEffect(() => {
    if (typeof window === "undefined") return;
    const expiryTimestamp = localStorage.getItem(key);
    if (!expiryTimestamp) return;

    const expiry = parseInt(expiryTimestamp, 10);
    const now = Date.now();
    const timeLeft = Math.floor((expiry - now) / 1000);

    if (timeLeft > 0) {
      setTimerReset(timeLeft);
    } else {
      localStorage.removeItem(key);
      setTimerReset(0);
    }
  }, [key]);

  // Timer countdown
  useEffect(() => {
    if (timerReset <= 0) return;

    intervalRef.current = window.setInterval(() => {
      setTimerReset((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(key);
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [timerReset, key]);

  // (Opsional) sync antar tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const expiry = Number(e.newValue ?? 0);
      const now = Date.now();
      const left = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimerReset(left);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  // Mulai timer
  const startOtpTimer = (duration = otpDurationSec) => {
    const expiry = Date.now() + duration * 1000;
    localStorage.setItem(key, String(expiry));
    setTimerReset(duration);
  };

  async function SendOTP() {
    setIsLoading(true);
    try {
      const body = { phone_number: value };
      const res_sendOTP = await sendOtp(body);
      toast.success("OTP telah dikirim!");
      startOtpTimer();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error.message ??
          "Terjadi kesalahan saat mengirim OTP"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isRunning = timerReset > 0;
  const PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
  const isFilled = PHONE_REGEX.test(value);

  return (
    <div>
      <label htmlFor={name} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>

      <div className="flex gap-2  w-full mt-2">
        <div className="grow">
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`px-5 py-3 bg-primary-spectrum rounded-xl w-full border ${
              error ? "border-red-500" : "border-[#D5D5D5]"
            }`}
            {...props}
          />
          <span className="text-xs text-muted">
            *Pastikan nomor HP Anda tidak salah
          </span>
        </div>

        <div>
          <button
            type="button"
            disabled={isLoading || isRunning || !isFilled}
            className={`text-white py-3 px-3 rounded-xl  ${
              isLoading || isRunning || !isFilled
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-primary cursor-pointer"
            }`}
            onClick={SendOTP}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-1">
                <div className="loading w-[20px] h-[20px]"></div>
                <span className="italic">Loading...</span>
              </div>
            ) : isRunning ? (
              <span className="font-bold p-2">{formatTimer(timerReset)}</span>
            ) : (
              <span className="whitespace-nowrap">Kirim OTP</span>
            )}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 p-0 m-0">{error}</p>}
    </div>
  );
}

export default PhoneOTPForm;
