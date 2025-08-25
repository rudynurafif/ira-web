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

  useEffect(() => {
    if (timerReset > 0) {
      setTimeout(() => {
        setTimerReset(timerReset - 1);
      }, 1000);
    }
  }, [timerReset]);

  async function SendOTP() {
    setIsLoading(true);
    try {
      const body = {
        phone_number: value,
      };

      // const res_sendOTP = await SendDataOTP(body)

      setTimerReset(60);
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

      <div className="flex gap-2 items-center mt-2">
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`px-5 py-3 bg-primary-spectrum rounded-xl w-[80%] border ${
            error ? "border-red-500" : "border-[#D5D5D5]"
          }`}
          {...props}
        />
        <button
          type="button"
          disabled={isLoading || timerReset > 0}
          className={`w-[20%] text-white py-3 rounded-xl cursor-pointer ${
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
            <span>{timerReset} detik kirim ulang OTP</span>
          ) : (
            <span>Kirim OTP</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default PhoneOTPForm;
