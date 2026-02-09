"use client";
import { useEffect, useMemo, useState } from "react";
import FAQPage from "./Homepage/FAQPage";
import MainPage from "./Homepage/MainPage";
import PackagePage from "./Homepage/PackagePage";
import WhyFWAPage from "./Homepage/WhyFWAPage";
import { verifyOtp } from "@/app/_api/Auth/Auth";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import CookieHandler from "./_components/CookieHandler";
import DownloadApp from "./Homepage/DownloadApp";
import { Notification } from "./_components/Notification";
import { useFCM } from "./hooks/useFCM";
import { useAppContext } from "./_shared/context/AppContext";
import { platform } from "os";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const { fcmToken } = useAppContext();

  const bodyToken = useMemo(
    () => ({
      fcm_token: fcmToken,
      platform: "web",
    }),
    [fcmToken],
  );

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
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        "Kode OTP tidak valid atau telah kedaluwarsa.";
      toast.error(errorMsg, {
        duration: 7500,
        position: "top-center",
      });
    } finally {
      setIsVerifying(false);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("code");
      newUrl.searchParams.delete("phone_number");
      router.replace(newUrl.toString(), { scroll: false });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode, phone]);

  return (
    <div>
      <Notification mode="store" body={bodyToken} />

      <CookieHandler />

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
      <DownloadApp />
      {/* <PackagePage /> */}
      <FAQPage />
    </div>
  );
}
