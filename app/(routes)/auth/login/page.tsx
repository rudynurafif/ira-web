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

  return (
    <div className="">
      <main className="flex w-full items-start justify-center px-10">
        <div className="w-full max-w-[543px] pt-16">
          <h1 className="mb-8 text-center text-dark-primary font-extrabold text-[32px]">
            Login Starlite
          </h1>

          {/* Phone input + Send OTP */}
          <div className="flex flex-col gap-7">
            {/* <div>
              <p className={`${figtree.className} text-secondary text-sm`}>
                Nomor Handphone*
              </p>
              <div className="flex items-center gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nomor Handphone*"
                  className={`${figtree.className} w-full text-lg bg-primary-spectrum rounded-xl border border-gray-border px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100`}
                />
                <button
                  onClick={sendOtp}
                  className="whitespace-nowrap rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white  transition hover:bg-primary-700"
                >
                  Kirim OTP
                </button>
              </div>
            </div> */}

            <div>
              <PhoneOTPForm
                storageKey={`otp:login:phone`} // ✅ key unik per use-case
                otpDurationSec={60}
                label="Nomor Handphone"
                name="phone"
                isImportant
                value={phone}
                onChange={(value: string) => {
                  setPhone(value);
                }}
                placeholder="Masukkan nomor handphone yang terdaftar"
                // error={errors.phone}
              />
            </div>

            {/* OTP */}
            {/* <div>
              <p className={`${figtree.className} text-sm text-gray-500`}>
                Masukkan OTP yang dikirim via Whatsapp
              </p>
              <div className="mt-2">
                <OtpInput length={6} onChange={setOtp} />
              </div>
            </div> */}

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
                onClick={handleLogin}
                className="w-full text-[22px] rounded-xl bg-primary py-3 font-medium text-white transition hover:bg-dark-primary-2 cursor-pointer"
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
      </main>
    </div>
  );
};

export default Page;
