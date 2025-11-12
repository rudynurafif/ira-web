"use client";
import { useEffect, useState } from "react";
import FAQPage from "./Homepage/FAQPage";
import MainPage from "./Homepage/MainPage";
import PackagePage from "./Homepage/PackagePage";
import WhyFWAPage from "./Homepage/WhyFWAPage";
import { verifyOtp } from "@/app/_api/Auth/Auth";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);

  const otpCode = searchParams.get("code");
  const phone = searchParams.get("phone_number");

  const handleVerify = async (body: any) => {
    setIsVerifying(true);
    try {
      const res = await verifyOtp(body);

      if (res?.data?.statusCode === 200) {
        toast.success(res?.data?.message ?? "Verifikasi OTP berhasil", {
          duration: 7500,
          position: "top-center",
        });

        // const token = res.data.data;
        // if (token) {
        //   localStorage.setItem("token-fwa", token);
        // }

        // setTimeout(() => {
        //   router.push("/customer-area");
        // }, 1500);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        "Kode OTP tidak valid atau telah kedaluwarsa.";
      toast.error(errorMsg, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (otpCode && otpCode.length === 6 && !isNaN(Number(otpCode))) {
      const body = {
        otp: otpCode,
        phone_number: phone,
        type: null,
      };
      handleVerify(body);
    }
  }, [otpCode, phone]);

  return (
    <div>
      {isVerifying && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg">
            <div className="loading w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-700">Memverifikasi OTP...</p>
          </div>
        </div>
      )}

      <MainPage />
      <WhyFWAPage />
      {/* <PackagePage /> */}
      <FAQPage />
    </div>
  );
}
