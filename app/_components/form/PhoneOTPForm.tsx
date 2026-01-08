import { sendOtpLogin, sendOtpRegister } from "@/app/_api/Auth/Auth";
import {
  formatTimer,
  getPhoneHistory,
  PHONE_REGEX,
  savePhoneToHistory,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ModalTemplate from "../modal/ModalTemplate";
import ModalLoginRedirect from "@/app/(routes)/auth/register/_components/ModalLoginRedirect";
import { usePathname } from "next/navigation";

function PhoneOTPForm({
  label,
  name,
  type = "text",
  mode,
  value,
  isImportant,
  onChange,
  error,
  // ✅ props baru untuk kustomisasi
  storageKey, // mis: `otp:${name}` atau `otp:${userId}:${name}`
  otpDurationSec = 60, // default 60 detik
  onSendOTP,
  hint = false,
  externalExpiry,
  isDisabled,
  isDisabledInput,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  mode: string;
  value: string;
  isImportant: boolean;
  onChange: (value: string) => void;
  error?: string;
  storageKey?: string;
  otpDurationSec?: number;
  onSendOTP?: () => void;
  hint?: boolean;
  externalExpiry?: number | null;
  isDisabled?: boolean;
  isDisabledInput?: boolean;
  [key: string]: any;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timerReset, setTimerReset] = useState(0);
  const [openModalLogin, setOpenModalLogin] = useState(false);
  const [phoneHistory, setPhoneHistory] = useState<string[]>([]);

  const pathname = usePathname();

  const key = storageKey ?? `otp:${name}`;
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setPhoneHistory(getPhoneHistory());
  }, []);

  useEffect(() => {
    if (!externalExpiry) return;
    const now = Date.now();
    const left = Math.max(0, Math.floor((externalExpiry - now) / 1000));
    // tulis ulang ke localStorage (supaya konsisten antar tab)
    localStorage.setItem(key, String(externalExpiry));
    setTimerReset(left);
  }, [externalExpiry, key]);

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
      console.log("no hp", value);
      savePhoneToHistory(value);
      setPhoneHistory(getPhoneHistory());

      // ✅ Jika parent menyediakan onSendOTP, delegasikan ke parent dan keluar.
      if (onSendOTP) {
        await Promise.resolve(onSendOTP());
        return;
      }

      const body = { phone_number: value };

      const res_sendOTP =
        mode === "login"
          ? await sendOtpLogin(body)
          : await sendOtpRegister(body);

      toast.success(
        `${res_sendOTP?.data?.message ?? "OTP terkirim"} ke ${value}`
      );
      startOtpTimer();
    } catch (error: any) {
      let seconds = error?.response?.data?.data?.second;

      if (seconds) {
        // toastErrorFromAPI(error);
        startOtpTimer(seconds); // set cooldown sesuai server
      } else {
        if (
          error?.response?.data?.statusCode === 409 &&
          pathname === "/auth/register"
        ) {
          setOpenModalLogin(true);
        }
        toastErrorFromAPI(error, "Terjadi kesalahan saat mengirim OTP");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const isRunning = timerReset > 0;
  const isFilled = PHONE_REGEX.test(value);

  const ONLY_DIGITS = /[^\d]/g;
  const handleNumericChange = (raw: string) => {
    const digitsOnly = raw.replace(ONLY_DIGITS, "");
    onChange(digitsOnly);
  };
  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digitsOnly = pasted.replace(ONLY_DIGITS, "");
    onChange(digitsOnly);
  };

  const disabledButton =
    isLoading || isRunning || !isFilled || isDisabled || isDisabledInput;

  return (
    <div>
      <label htmlFor={name} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>

      <div className="flex gap-2  w-full mt-2">
        <div className="grow relative">
          <input
            type={type}
            name={name}
            value={value}
            disabled={isDisabled}
            list={`ira-phone-history-${name}`}
            onChange={(e) => handleNumericChange(e.target.value)}
            onPaste={handlePaste}
            className={`px-5 py-3 bg-primary-spectrum rounded-xl w-full border ${
              error ? "border-red-500" : "border-[#D5D5D5]"
            } placeholder:text-gray-400 placeholder:text-sm`}
            {...props}
          />

          <datalist id={`ira-phone-history-${name}`}>
            {phoneHistory.map((phone, idx) => (
              <option key={idx} value={phone} />
            ))}
          </datalist>
        </div>

        <div>
          <button
            type="submit"
            disabled={disabledButton}
            className={`text-white py-3 px-3 rounded-xl  ${
              disabledButton
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-primary cursor-pointer"
            }`}
            onClick={SendOTP}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-1">
                <div className="loading w-5 h-5"></div>
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

      {hint && (
        <p className="text-xs md:text-sm mt-1">
          <span className="text-red-500">*</span>Gunakan{" "}
          <span className="font-bold">
            nomor handphone yang sudah terdaftar.
          </span>{" "}
          Jika belum punya akun, klik Register.
        </p>
      )}

      {error && <p className="text-red-500 p-0 m-0">{error}</p>}

      {openModalLogin && (
        <ModalTemplate closeModal={() => setOpenModalLogin(false)}>
          <ModalLoginRedirect onClose={() => setOpenModalLogin(false)} />
        </ModalTemplate>
      )}
    </div>
  );
}

export default PhoneOTPForm;
