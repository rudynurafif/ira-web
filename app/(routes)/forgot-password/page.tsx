"use client";

import React, { useEffect, useState, Suspense } from "react"; // 👈 Tambah Suspense
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import DynamicPasswordForm from "@/app/_components/form/FieldPassword";

import { checkTemplate, setPassword } from "@/app/_api/Auth/Auth";
import {
  PASSWORD_ALLOWED_CHARS_REGEX,
  PASSWORD_INPUT_FILTER_REGEX,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import Loader from "@/app/_components/Loader";
import { PiDotsThreeCircle } from "react-icons/pi";
import { FaApple } from "react-icons/fa6";

// 👇 Rename jadi ResetPasswordContent (isi tetap sama persis)
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isReady, setIsReady] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isWhatsApp, setIsWhatsApp] = useState(false);

  const code = searchParams.get("code");

  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplateValid, setIsTemplateValid] = useState<boolean | null>(null);

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // 1. Deteksi Device di useEffect agar aman di WKWebView
  useEffect(() => {
    setIsReady(true);

    // Safe access to navigator
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      const isAppleDevice =
        /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      const isWA =
        ua.toLowerCase().includes("whatsapp") ||
        ua.toLowerCase().includes("wkwk");

      setIsIOS(isAppleDevice);
      setIsWhatsApp(isWA);
    }
  }, []);

  // 2. Logic Validasi Link (Hanya dipanggil SEKALI)
  useEffect(() => {
    if (!isReady) return;

    if (!code) {
      const timer = setTimeout(() => {
        try {
          toast.error("Link reset password tidak ditemukan (Code missing).");
          router.replace("/");
        } catch (e) {
          window.location.href = "/";
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    const checkTemp = async () => {
      try {
        const res = await checkTemplate({ code });
        const sc = res?.data?.statusCode;

        if (sc === 200 || sc === 201) {
          setIsTemplateValid(true);
          setTimeout(
            () => toast.success(res.data?.message || "Link valid."),
            100,
          );
        } else {
          setIsTemplateValid(false);
          setTimeout(() => {
            toast.error(
              res.data?.message || "Link tidak valid atau kedaluwarsa.",
            );
            router.replace("/");
          }, 3000);
        }
      } catch (err: any) {
        console.error("Forgot Password Check Error:", err);
        setIsTemplateValid(false);

        const errorMsg =
          err?.response?.data?.message ||
          "Gagal memverifikasi link. Pastikan koneksi internet stabil.";

        setTimeout(() => {
          toastErrorFromAPI(err, errorMsg);
          router.replace("/");
        }, 3000);
      }
    };

    checkTemp();
  }, [code, router, isReady]);

  // ===============================
  // VALIDATION LOGIC
  // ===============================
  const validatePassword = (val: string) => {
    if (!val) return "Password wajib diisi";
    if (val.length < 6) return "Password minimal 6 karakter";
    if (!PASSWORD_ALLOWED_CHARS_REGEX.test(val)) {
      return "Password hanya boleh berisi huruf, angka, #, !, atau _";
    }
    return "";
  };

  const handlePasswordChange = (rawValue: string) => {
    const filteredValue =
      rawValue.match(PASSWORD_INPUT_FILTER_REGEX)?.join("") || "";
    setPasswordValue(filteredValue);
  };

  const handleConfirmPasswordChange = (rawValue: string) => {
    const filteredValue =
      rawValue.match(PASSWORD_INPUT_FILTER_REGEX)?.join("") || "";
    setConfirmPassword(filteredValue);
  };

  useEffect(() => {
    if (!confirmPassword) {
      setConfirmError("");
      return;
    }
    const passError = validatePassword(password);
    if (passError) {
      setConfirmError("");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Password dan konfirmasi tidak sama");
    } else {
      setConfirmError("");
    }
  }, [password, confirmPassword]);

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error("Sesi tidak valid");
      return;
    }

    const passError = validatePassword(password);

    if (passError || password !== confirmPassword) {
      setErrors({
        password: passError,
        confirmPassword:
          password !== confirmPassword ? "Konfirmasi password tidak sama" : "",
      });
      return;
    }

    try {
      setIsLoading(true);
      const resSetPassword = await setPassword({ password, code });

      toast.success(
        resSetPassword?.data?.message || "Password berhasil diperbarui",
      );

      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } catch (err: any) {
      toastErrorFromAPI(err, "Gagal reset password");
    } finally {
      setIsLoading(false);
      // Opsional: Reset form jika perlu
      // setPasswordValue("");
      // setConfirmPassword("");
    }
  };

  const isPasswordValid = !validatePassword(password);
  const isConfirmValid =
    !!confirmPassword && !confirmError && password === confirmPassword;
  const isFormValid = !!code && isPasswordValid && isConfirmValid;

  // Loading State
  if (!isReady || isTemplateValid === null) {
    return <Loader />;
  }

  // Invalid Link State
  if (!code || isTemplateValid === false) {
    return (
      <div className="mx-auto max-w-xl my-10 px-6 text-center">
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-6 text-red-600">
          <h2 className="text-xl font-bold mb-2">Link Tidak Valid</h2>
          <p>
            Maaf, tautan reset password ini sudah kedaluwarsa, tidak valid, atau
            telah digunakan.
          </p>
          <p className="mt-4 text-sm">
            Anda akan dialihkan ke halaman utama...
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl my-10 px-6">
      {/* Tampilkan alert hanya jika terdeteksi iOS, tanpa mengakses navigator langsung di JSX */}
      {isIOS && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-bold flex items-center gap-1">
            <FaApple className="inline-block align-middle" />
            <span className="align-middle">Pengguna iPhone</span>
          </p>
          <p className="mt-1">
            Jika mengalami error, silakan klik tombol{" "}
            <PiDotsThreeCircle className="inline-block align-middle" /> di pojok
            kanan atas atau kanan bawah, lalu pilih{" "}
            <strong>Buka di Browser Chrome/Safari</strong>.
          </p>
        </div>
      )}

      <div>
        <h1 className="text-old-primary text-2xl font-bold text-center mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <DynamicPasswordForm
              label="Password Baru"
              name="password"
              isImportant
              value={password}
              placeholder="Masukkan password baru"
              onChange={(val) => {
                setPasswordValue(val);
                setErrors((e) => ({ ...e, password: "" }));
                handlePasswordChange(val);
              }}
              error={errors.password}
            />
            <p className="text-xs text-gray-spectrum py-1 px-2 mt-2 bg-[#FEFAEE] rounded-lg">
              Password minimal{" "}
              <span className="font-bold text-primary">6 karakter</span>.
            </p>
          </div>

          <DynamicPasswordForm
            label="Konfirmasi Password"
            name="confirm_password"
            isImportant
            value={confirmPassword}
            placeholder="Ulangi password baru"
            onChange={(val) => {
              setConfirmPassword(val);
              setErrors((e) => ({ ...e, confirmPassword: "" }));
              handleConfirmPasswordChange(val);
            }}
            error={confirmError}
          />

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`py-4 font-bold text-white text-xl rounded-xl transition-colors duration-200
              ${
                isLoading || !isFormValid
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-dark-primary-2 cursor-pointer"
              }`}
          >
            {isLoading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 👇 Export Page dengan Suspense wrapper (ini fix utamanya)
export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
