"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import PhoneNumberForm from "@/app/_components/form/PhoneForm";
import DynamicPasswordForm from "@/app/_components/form/FieldPassword";

import { checkTemplate, setPassword } from "@/app/_api/Auth/Auth";
import {
  PASSWORD_ALLOWED_CHARS_REGEX,
  PASSWORD_INPUT_FILTER_REGEX,
  PHONE_LIVE_REGEX,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import Loader from "@/app/_components/Loader";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");

  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplateValid, setIsTemplateValid] = useState<boolean>(false);

  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (!code) {
      router.replace("/");
      return;
    }

    const checkTemp = async () => {
      try {
        const res = await checkTemplate({ code });

        const sc = res?.data?.statusCode;

        if (sc === 200 || sc === 201) {
          setIsTemplateValid(true);
          toast.success(res.data?.message);
          return;
        }

        setIsTemplateValid(false);
        toast.error(res.data?.message || "Link tidak valid");
        router.replace("/");
      } catch (err: any) {
        setIsTemplateValid(false);

        toastErrorFromAPI(
          err || "Link reset password tidak valid atau sudah kedaluwarsa",
        );
        router.replace("/");
      }
    };

    checkTemp();
  }, [code, router]);

  // ===============================
  // VALIDATION
  // ===============================
  const validatePhone = (val: string) => {
    if (!val) return "Nomor handphone wajib diisi";
    if (!val.startsWith("08") && !val.startsWith("62"))
      return "Nomor harus diawali 08 atau 62";
    if (val.length < 7 || val.length > 15) return "Nomor harus 7–15 digit";
    if (!PHONE_LIVE_REGEX.test(val))
      return "Format nomor handphone tidak valid";
    return "";
  };

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
    // jangan ganggu sebelum user mulai isi konfirmasi
    if (!confirmPassword) {
      setConfirmError("");
      return;
    }

    // kalau password belum valid, fokusin error password dulu
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
  // SUBMIT RESET PASSWORD
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error("Link reset password tidak valid atau sudah kedaluwarsa");
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

      const resSetPassword = await setPassword({
        password,
        code,
      });

      toast.success(
        resSetPassword?.data?.message ||
          "Password berhasil diperbarui, silakan login",
      );

      router.replace("/auth/login");
    } catch (err: any) {
      toastErrorFromAPI(err, "Gagal reset password");
    } finally {
      setIsLoading(false);
      setPasswordValue("");
      setConfirmPassword("");
    }
  };

  const isPasswordValid = !validatePassword(password);
  const isConfirmValid =
    !!confirmPassword && !confirmError && password === confirmPassword;

  const isFormValid = !!code && isPasswordValid && isConfirmValid;

  // ===============================
  // RENDER
  // ===============================

  return (
    <div className="mx-auto max-w-xl my-10 px-6">
      {isTemplateValid ? (
        <div>
          <h1 className="text-old-primary text-2xl font-bold text-center mb-6">
            Reset Password
          </h1>

          {!code && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
              Link reset password tidak valid atau sudah kedaluwarsa.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* PASSWORD */}
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
                <span className="font-bold text-primary">6 karakter</span> dan
                mudah Anda ingat.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
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
              className={`py-4 font-bold text-white text-xl rounded-xl
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
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default Page;
