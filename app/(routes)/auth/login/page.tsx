"use client";

import React, { useState } from "react";
import OtpInput from "./_components/OTPInput";
import { Figtree } from "next/font/google";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import Link from "next/link";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const Page = () => {
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const sendOtp = async () => {
    // TODO: sambungkan ke API kirim OTP via WhatsApp
    alert(`Kirim OTP ke ${phone}`);
  };

  const handleLogin = async () => {
    // TODO: verifikasi OTP & login
    alert(`Login dengan OTP: ${otp}`);
  };

  const validOtp = otp.length === 6
  const validPhoneNumber = phone.length >= 7

  return (
    <div className="flex w-full items-start justify-center px-5 my-22">
      <div className="w-full max-w-xl ">
        <h1 className="mb-8 text-center text-dark-primary font-extrabold text-[32px]">
          Login Starlite
        </h1>

        {/* Phone input + Send OTP */}
        <div className="flex flex-col gap-7">
          <div>
            <PhoneOTPForm
              storageKey={`otp:login:phone`} // ✅ key unik per use-case
              otpDurationSec={60}
              label="Nomor Handphone"
              name="phone"
              onChange={(value: string) => {
                setPhone(value.replace(/[^0-9]/g, "")); // Hanya angka
              }}
              isImportant
              value={phone}
              placeholder="Masukkan nomor handphone yang terdaftar"
              // error={errors.phone}
            />
          </div>

          <div className="col-span-1">
            <GroupedOTP
              label="Masukkan OTP yang dikirim via Whatsapp"
              isImportant
              name="otp"
              onChange={(value: string) => {
                setOtp(value);
              }}
            />
          </div>

          {/* Login */}
          <div>
            <button
              disabled={!validOtp}
              onClick={handleLogin}
              className={`w-full text-[22px] rounded-xl bg-primary py-3 font-medium text-white transition  ${
                !validOtp || !validPhoneNumber
                  ? "cursor-not-allowed bg-slate-400"
                  : "cursor-pointer hover:bg-dark-primary-2"
              }`}
            >
              Login
            </button>
          </div>

          <p className="text-center text-md text-primary-text">
            Belum punya akun Starlite?{" "}
            <Link
              href="/auth/register"
              className="underline-animation-register font-semibold text-dark-primary"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
