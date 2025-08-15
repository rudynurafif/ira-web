"use client";

import React, { useState } from "react";
import OtpInput from "./components/OTPInput";
import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const Page = () => {
  const [phone, setPhone] = useState("081234889012");
  const [otp, setOtp] = useState("");

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
            <div>
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
            </div>

            {/* OTP */}
            <div>
              <p className={`${figtree.className} text-sm text-gray-500`}>
                Masukkan OTP yang dikirim via Whatsapp
              </p>
              <div className="mt-2">
                <OtpInput length={6} onChange={setOtp} />
              </div>
            </div>

            {/* Login */}
            <div>
              <button
                onClick={handleLogin}
                className="w-full text-[22px] rounded-xl bg-primary py-3 font-semibold text-white shadow-soft transition hover:bg-primary-700"
              >
                Login
              </button>
            </div>

            <p className="text-center text-md text-primary-text">
              Belum punya akun Starlite?{" "}
              <a
                href="#"
                className="font-semibold text-dark-primary hover:underline"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;
