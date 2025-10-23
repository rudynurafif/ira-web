import { formatTimer } from "@/app/_shared/utils";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function PhoneOTPForm({
  label,
  name,
  type = "text",
  value,
  isImportant,
  onChange,
  error,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  isImportant: boolean;
  onChange: (value: string) => void;
  error?: string;
  [key: string]: any;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [timerReset, setTimerReset] = useState(0);

  // useEffect(() => {
  //   if (timerReset > 0) {
  //     setTimeout(() => {
  //       setTimerReset(timerReset - 1);
  //     }, 1000);
  //   }
  // }, [timerReset]);

  useEffect(() => {
    const expiryTimestamp = localStorage.getItem("otpExpiryTimestamp");

    if (expiryTimestamp) {
      const expiry = parseInt(expiryTimestamp, 10);
      const now = Date.now();
      const timeLeft = Math.floor((expiry - now) / 1000);

      if (timeLeft > 0) {
        setTimerReset(timeLeft);
      } else {
        localStorage.removeItem("otpExpiryTimestamp");
        setTimerReset(0);
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timerReset <= 0) return;

    const interval = setInterval(() => {
      setTimerReset((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("otpExpiryTimestamp");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerReset]);

  // Fungsi untuk memulai timer
  const startOtpTimer = () => {
    const expiry = Date.now() + 60 * 1000; // 60 detik dari sekarang
    localStorage.setItem("otpExpiryTimestamp", String(expiry));
    setTimerReset(60);
  };

  async function SendOTP() {
    setIsLoading(true);
    try {
      const body = {
        phone_number: value,
      };

      // const res_sendOTP = await SendDataOTP(body)

      // setTimerReset(60);
      startOtpTimer();
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim OTP");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div>
      <label htmlFor={name} className="text-muted">
        {label}
        {isImportant && <span>*</span>}
      </label>

      <div className="flex gap-2 items-center w-full mt-2">
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
        </div>

        <div className="">
          <button
            type="button"
            disabled={isLoading || timerReset > 0}
            className={` text-white  py-3 px-1 rounded-xl cursor-pointer ${
              isLoading || timerReset > 0 ? "bg-gray-400" : "bg-primary"
            }`}
            onClick={SendOTP}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-1">
                <div className="loading w-[20px] h-[20px]"></div>
                <span className="italic">Loading...</span>
              </div>
            ) : timerReset > 0 ? (
              <span className="font-bold p-2">{formatTimer(timerReset)}</span>
            ) : (
              <span>Kirim OTP</span>
            )}
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 p-0 m-0">{error}</p>}
    </div>
  );
}

export default PhoneOTPForm;
