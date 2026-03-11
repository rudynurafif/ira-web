"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { setCookie } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";

import PhoneNumberForm from "@/app/_components/form/PhoneForm";
import DynamicPasswordForm from "@/app/_components/form/FieldPassword";

import {
  PASSWORD_ALLOWED_CHARS_REGEX,
  PHONE_BEST_REGEX,
  toastErrorFromAPI,
} from "@/app/_shared/utils";

import { useAppDispatch } from "@/app/store/store";
import { login } from "@/app/store/slice/authSlice";

import {
  loginUser,
  checkPassword,
  setPassword,
  forgotPassword,
} from "@/app/_api/Auth/Auth";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useGeoPermission } from "@/app/hooks/useGeoPermission";
import { Notification } from "@/app/_components/Notification";
import { useAppContext } from "@/app/_shared/context/AppContext";

/**
 * STEP FLOW
 * CHECK_PHONE  -> cek apakah password ada
 * SET_PASSWORD -> buat password baru
 * LOGIN        -> login normal
 */
type AuthStep = "CHECK_PHONE" | "SET_PASSWORD" | "LOGIN";

const Page = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<AuthStep>("CHECK_PHONE");

  const [phone, setPhone] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string>("");
  const { status, requestLocation, refresh } = useGeoPermission();
  const { fcmToken } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const [isOpenModalReqLoc, setIsOpenModalReqLoc] = useState(false);

  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
  }>({});

  const [location, setLocation] = useState<{
    latitude: string;
    longitude: string;
  } | null>(null);

  const [locationError, setLocationError] = useState<string | null>(null);

  const bodyToken = useMemo(
    () => ({
      fcm_token: fcmToken,
      platform: "web",
    }),
    [fcmToken],
  );

  useEffect(() => {
    const regPhone = localStorage.getItem("registration_phone");

    if (regPhone) {
      setPhone(regPhone);

      const phoneError = validatePhone(regPhone);
      if (!phoneError) {
        setStep("SET_PASSWORD");
        toast.success("Silakan buat password untuk akun baru Anda");

        localStorage.removeItem("registration_phone");
      } else {
        console.error("Invalid phone format:", phoneError);
        localStorage.removeItem("registration_phone");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "denied") setIsOpenModalReqLoc(true);
  }, [status]);

  // ===============================
  // LOCATION
  // ===============================
  useEffect(() => {
    // if (!navigator.geolocation) {
    //   setLocationError("Browser tidak mendukung lokasi");
    //   return;
    // }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        });
      },
      () => {
        setLocationError("Izin lokasi ditolak");
      },
      { enableHighAccuracy: true },
    );
  }, []);

  // ===============================
  // VALIDATION
  // ===============================
  const validatePhone = (val: string) => {
    if (!val) return "Nomor handphone wajib diisi";
    if (!val.startsWith("08") && !val.startsWith("62"))
      return "Nomor harus diawali 08 atau 62";
    if (val.length < 7 || val.length > 15) return "Nomor harus 7–15 digit";
    if (!PHONE_BEST_REGEX.test(val))
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

  // validasi konfirmasi password
  useEffect(() => {
    if (step !== "SET_PASSWORD") return;

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
  }, [step, password, confirmPassword]);

  // ===============================
  // STEP 1 — CHECK PASSWORD
  // ===============================
  const handleCheckPassword = async () => {
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }

    try {
      setIsLoading(true);

      const resCheckPassword = await checkPassword({ phone_number: phone });

      if (resCheckPassword.data?.statusCode === 400) {
        setStep("SET_PASSWORD");
        toast.success(resCheckPassword?.data?.message || "");
      } else if (resCheckPassword.data?.statusCode === 200) {
        setStep("LOGIN");
        toast.success(resCheckPassword?.data?.message || "");
      }
    } catch (err: any) {
      if (err?.response?.status === 400) {
        toast("Akun belum memiliki password");
      } else {
        toastErrorFromAPI(err, "Gagal cek password");
      }
    } finally {
      setPasswordValue("");
      setConfirmPassword("");
      setIsLoading(false);
    }
  };

  // ===============================
  // STEP 2 — SET PASSWORD
  // ===============================
  const handleSetPassword = async () => {
    const passError = validatePassword(password);

    if (passError) {
      setErrors({ password: passError });
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("Password dan konfirmasi tidak sama");
      return;
    }

    try {
      setIsLoading(true);

      const resSetPW = await setPassword({
        phone_number: phone,
        password,
      });

      toast.success(resSetPW.data?.message || "Password berhasil dibuat");
      setStep("LOGIN");
    } catch (err: any) {
      toastErrorFromAPI(err, "Gagal set password");
    } finally {
      setIsLoading(false);
      setPasswordValue("");
      setConfirmPassword("");
    }
  };

  // ===============================
  // STEP 3 — LOGIN
  // ===============================
  const handleLogin = async () => {
    // SO FAR JADI NYA OPSIONAL
    // if (!location) {
    //   toast.error("Akses lokasi wajib diizinkan");
    //   return;
    // }

    try {
      setIsLoading(true);

      const res = await loginUser({
        phone_number: phone,
        password,
        ...(location?.latitude && { latitude: location.latitude }),
        ...(location?.longitude && { longitude: location.longitude }),
        platform: "web",
      });

      const token = res?.data?.data ?? res?.data?.token;
      if (!token) throw new Error("Token tidak ditemukan");

      dispatch(login({ token }));
      setCookie("token-ira", token);

      toast.success(res.data?.message ?? "Login berhasil");
      window.location.href = "/customer-area";
      // router.push("/customer-area");
    } catch (err) {
      toastErrorFromAPI(err, "Login gagal");
    } finally {
      setIsLoading(false);
      setPasswordValue("");
      setConfirmPassword("");
    }
  };

  const handleForgotPassword = async () => {
    if (!phone) {
      toast.error("Nomor handphone tidak valid");
      return;
    }

    try {
      setIsLoading(true);

      const confirm = window.confirm(
        `Apakah Anda yakin ingin mereset password untuk nomor ${phone}?`,
      );

      if (!confirm) return;

      const resForgotPassword = await forgotPassword({
        phone_number: phone,
      });

      toast.success(
        resForgotPassword.data?.message ||
          "Link reset password telah dikirim ke Nomor WhatsApp Anda. Silakan cek pesan WhatsApp Anda.",
      );
      setStep("CHECK_PHONE");
      // router.push("forgot-password");
      // window.location.href = "/forgot-password";
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsLoading(false);
      setPasswordValue("");
      setConfirmPassword("");
    }
  };

  useEffect(() => {
    setPasswordValue("");
    setConfirmPassword("");
    setConfirmError("");
  }, [step]);

  const isPhoneValid = !validatePhone(phone);

  const isSetPasswordValid =
    !validatePassword(password) &&
    password === confirmPassword &&
    !!password &&
    !!confirmPassword;

  const isLoginValid = !!password && !validatePassword(password);

  const isFormValid = (() => {
    if (step === "CHECK_PHONE") return isPhoneValid;
    if (step === "SET_PASSWORD") return isSetPasswordValid;
    if (step === "LOGIN") return isLoginValid;
    return false;
  })();

  const goToRegisterPage = () => {
    if (step === "SET_PASSWORD" || step === "LOGIN") {
      const confirm = window.confirm(
        "Proses login akan dibatalkan jika pindah ke halaman pendaftaran. Lanjutkan?",
      );

      if (!confirm) return;
    }

    router.push("/auth/register");
  };

  // ===============================
  // FORM SUBMIT
  // ===============================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "CHECK_PHONE") handleCheckPassword();
    if (step === "SET_PASSWORD") handleSetPassword();
    if (step === "LOGIN") handleLogin();
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="flex w-full justify-center px-6 my-10">
      <div className="w-full max-w-xl">
        <Notification mode="store" body={bodyToken} />

        {step !== "CHECK_PHONE" && (
          <div className="">
            <button
              onClick={() => {
                setStep("CHECK_PHONE");
                setPasswordValue("");
                setConfirmPassword("");
              }}
              className=" py-2 mb-5 flex items-center gap-2 rounded-lg text-xl cursor-pointer hover:underline"
            >
              <IoMdArrowRoundBack /> <span>Kembali</span>
            </button>
          </div>
        )}

        <h1 className="mb-8 text-center text-old-primary font-extrabold text-2xl sm:text-[32px]">
          <span>
            {step === "SET_PASSWORD" ? "Buat Password Baru" : "Login IRA"}
          </span>
        </h1>

        {step === "SET_PASSWORD" && (
          <div className="my-6 text-center">
            Demi keamanan akun Anda, silakan buat password baru sebelum
            melanjutkan menggunakan layanan Internet Rakyat.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <PhoneNumberForm
            label="Nomor Handphone"
            name="phone"
            isImportant
            value={phone}
            disabled={step !== "CHECK_PHONE"}
            onChange={(val) => {
              setPhone(val);
              setErrors({});
            }}
            error={errors.phone}
          />

          {step !== "CHECK_PHONE" && (
            <div>
              <DynamicPasswordForm
                label={step === "SET_PASSWORD" ? "Password Baru" : "Password"}
                name="password"
                isImportant
                value={password}
                onChange={(val) => {
                  setPasswordValue(val);
                  setErrors({});
                }}
              />
              {step === "SET_PASSWORD" && (
                <p className="text-xs text-gray-spectrum py-1 px-2 mt-2 bg-[#FEFAEE] rounded-lg">
                  Password minimal{" "}
                  <span className="font-bold text-primary">6 karakter</span> dan
                  mudah Anda ingat.
                </p>
              )}
            </div>
          )}

          {step === "SET_PASSWORD" && (
            <DynamicPasswordForm
              label="Konfirmasi Password Baru"
              name="confirm_password"
              isImportant
              value={confirmPassword}
              onChange={(val) => {
                setConfirmPassword(val);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={confirmError}
            />
          )}

          {/* {locationError && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
              <b>Akses lokasi diperlukan untuk login.</b>
              <div>
                {locationError}, refresh halaman jika sudah mengizinkan akses
                lokasi browser
              </div>
              <button
                className="bg-primary hover:bg-dark-primary-2 py-2 px-4 rounded-xl text-white mt-2"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          )} */}

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`py-3 flex items-center justify-center gap-2 font-bold text-white text-xl rounded-xl
            ${
              isLoading || !isFormValid
                ? "bg-slate-400 cursor-not-allowed!"
                : "bg-primary hover:bg-dark-primary-2 cursor-pointer"
            }`}
          >
            <div className={`loading w-5 h-5 ${isLoading ? "block" : "hidden"}`}></div>
            <span>
              {isLoading
                ? "Loading..."
                : step === "SET_PASSWORD"
                  ? "Submit"
                  : step === "LOGIN"
                    ? "LOGIN"
                    : "Lanjutkan"}
            </span>
          </button>
        </form>

        {step === "LOGIN" && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary mt-3 cursor-pointer underline-animation-register text-right"
          >
            Lupa password?
          </button>
        )}

        <div className="mt-12 text-center text-sm text-primary-text">
          Belum punya akun?{" "}
          <button
            disabled={isLoading}
            onClick={goToRegisterPage}
            className="font-bold text-primary underline-animation-register"
          >
            Daftar disini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
