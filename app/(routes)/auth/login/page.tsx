"use client";

import React, { useState } from "react";
import { Figtree } from "next/font/google";
import Link from "next/link";
import toast from "react-hot-toast";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import { verifyOtp, loginUser } from "@/app/_api/Auth/Auth";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;

const Page = () => {
  const router = useRouter();

  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");

  const validPhoneNumber = PHONE_REGEX.test(phone);
  const validOtpLength = otp.length === 6;
  const canLogin = validPhoneNumber && otpStatus === "valid";

  async function handleVerifyOtp(val: string) {
    if (!validPhoneNumber) {
      toast.error("Nomor handphone belum valid");
      return;
    }
    try {
      setOtpStatus("verifying");
      const payload = { phone_number: phone, otp: val, type: "login" };
      const res = await verifyOtp(payload);
      setCookie("token", res.data.data);
      // kalau backend pakai kode sukses tertentu, bisa dicek di sini
      // contoh:
      // if (res?.data?.statusCode !== 200) throw new Error("OTP tidak valid");

      setOtpStatus("valid");
      toast.success("OTP terverifikasi ✔");
    } catch (err: any) {
      setOtpStatus("invalid");
      toast.error(
        err?.response?.data?.message || "Verifikasi OTP gagal. Coba lagi."
      );
    }
  }

  async function handleLogin() {
    if (!canLogin) {
      toast.error("Pastikan nomor handphone & OTP sudah valid");
      return;
    }
    try {
      const res = await loginUser({ phone_number: phone });
      toast.success("Login berhasil");
      window.location.href = "/customer-area";
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login gagal");
    }
  }

  return (
    <div className="flex w-full items-start justify-center px-5 my-22">
      <div className="w-full max-w-xl ">
        <h1 className="mb-8 text-center text-dark-primary font-extrabold text-[32px]">
          Login Starlite
        </h1>

        <div className="flex flex-col gap-7">
          {/* Nomor Handphone */}
          <div>
            <PhoneOTPForm
              storageKey={`otp:login:phone`}
              otpDurationSec={60}
              label="Nomor Handphone"
              name="phone"
              onChange={(value: string) => {
                const onlyDigits = value.replace(/[^0-9]/g, "");
                setPhone(onlyDigits);
                // reset status OTP kalau user ganti nomor
                if (otpStatus !== "idle") setOtpStatus("idle");
              }}
              isImportant
              value={phone}
              placeholder="Masukkan nomor handphone yang terdaftar"
            />
            {!validPhoneNumber && phone.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Nomor handphone tidak valid
              </p>
            )}
          </div>

          {/* OTP */}
          <div className="col-span-1">
            <GroupedOTP
              label="Masukkan OTP yang dikirim via Whatsapp"
              isImportant
              name="otp"
              isInvalid={otpStatus === "invalid"}
              onChange={(value: string) => {
                setOtp(value);
                if (value.length === 6) {
                  handleVerifyOtp(value);
                } else if (otpStatus !== "idle") {
                  setOtpStatus("idle");
                }
              }}
              onComplete={(val) => handleVerifyOtp(val)}
            />
            {otpStatus === "verifying" && (
              <p className="text-primary mt-1 text-sm italic">
                Memverifikasi OTP…
              </p>
            )}
            {otpStatus === "valid" && (
              <p className="text-green-600 mt-1 text-sm">OTP valid ✔</p>
            )}
            {otpStatus === "invalid" && (
              <p className="text-red-500 mt-1 text-sm">
                Kode OTP tidak valid / kedaluwarsa
              </p>
            )}
          </div>

          {/* Login */}
          <div>
            <button
              disabled={!canLogin}
              onClick={handleLogin}
              className={`w-full text-[22px] rounded-xl py-3 font-medium text-white transition ${
                canLogin
                  ? "bg-primary hover:bg-dark-primary-2 cursor-pointer"
                  : "bg-slate-400 cursor-not-allowed"
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
