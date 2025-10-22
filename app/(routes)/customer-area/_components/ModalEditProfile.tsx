"use client";

import { Figtree } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import OtpInput from "../../auth/login/_components/OTPInput";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import DynamicForm from "@/app/_components/form/DynamicForm";
import toast from "react-hot-toast";
import { verifyOtp } from "@/app/_api/Auth/Auth";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import { updateProfileInfo } from "@/app/_api/Customer/CustomerArea";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (v: {
    name: string;
    phone_number: string;
    email: string;
    actual_address: string;
  }) => void;
  initial?: Partial<{
    name: string;
    phone_number: string;
    email: string;
    actual_address: string;
  }>;
};

type Editable = {
  name?: string;
  phone_number?: string;
  email?: string;
  actual_address?: string;
};

function normalize(v: unknown) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  return String(v);
}

function buildDiffPayload(prev: Editable, next: Editable, otp?: string) {
  const changed: Record<string, string> = {};

  (["name", "phone_number", "email", "actual_address"] as const).forEach(
    (k) => {
      const before = normalize(prev[k]);
      const after = normalize(next[k]);
      if (after !== before) {
        if (k === "email") {
          if (after !== "") changed[k] = after as string;
        } else {
          changed[k] = after as string;
        }
      }
    }
  );

  return changed;
}

export default function ModalEditProfile({ open, onClose, initial }: Props) {
  const [name, setName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [actualAddress, setActualAddress] = useState("");
  const otpCacheRef = useRef<Record<string, string>>({});
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [otp, setOtp] = useState<string>("");
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const baselineRef = useRef<Editable>({});

  useEffect(() => {
    if (!open) return;

    // isi form dari initial
    setName(initial?.name ?? "");
    setPhoneNumber(initial?.phone_number ?? "");
    setEmail(initial?.email ?? "");
    setActualAddress(initial?.actual_address ?? "");

    // freeze baseline untuk diff
    baselineRef.current = {
      name: initial?.name ?? "",
      phone_number: initial?.phone_number ?? "",
      email: initial?.email ?? "",
      actual_address: initial?.actual_address ?? "",
    };

    setOtp("");
    setOtpStatus("idle");
    setVerifiedPhone(null);
    otpCacheRef.current = {};
    setErrors({});
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    if (!phone_number) {
      setOtpStatus("idle");
      setOtp("");
      return;
    }

    if (verifiedPhone && normalize(phone_number) === normalize(verifiedPhone)) {
      // kembali ke nomor yang sudah diverifikasi
      setOtpStatus("valid");
    } else {
      // nomor baru / berbeda => wajib verifikasi ulang
      if (otpStatus !== "idle") setOtpStatus("idle");
      if (otp) setOtp("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone_number, verifiedPhone, open]);

  const needsOtp =
    normalize(phone_number) !== normalize(baselineRef.current.phone_number);

  async function handleVerifyOtp(val: string) {
    if (!phone_number) {
      setErrors((e) => ({
        ...e,
        phone: "Isi nomor handphone terlebih dahulu",
      }));
      toast.error("Nomor handphone wajib diisi sebelum verifikasi OTP");
      return;
    }

    try {
      setOtpStatus("verifying");
      const payload = { phone_number, otp: val };
      const res = await verifyOtp(payload);

      if (res?.data?.statusCode === 200) {
        toast.success(res.data.message ?? "OTP terverifikasi ✔");
        setOtpStatus("valid");
        setVerifiedPhone(phone_number);
        otpCacheRef.current[normalize(phone_number)] = val;
        setOtp(val);
      }

      setErrors((e) => ({ ...e, otp: "" }));
    } catch (err: any) {
      setOtpStatus("invalid");
      setErrors((e) => ({
        ...e,
        otp:
          err?.response?.data?.message ||
          "Kode OTP tidak valid atau sudah kedaluwarsa",
      }));
      toast.error(err?.response?.data?.message || "Verifikasi OTP gagal");
    }
  }

  useEffect(() => {
    if (!open) return;

    const key = normalize(phone_number);
    if (!key) {
      setOtpStatus("idle");
      setOtp("");
      return;
    }

    // Kembali ke nomor yang sudah diverifikasi
    if (verifiedPhone && key === normalize(verifiedPhone)) {
      setOtpStatus("valid");
      // pulihkan OTP yang sebelumnya diverifikasi untuk nomor ini (kalau mau tampil)
      const cached = otpCacheRef.current[key];
      if (typeof cached === "string") setOtp(cached);
      return;
    }

    // Nomor berubah dan belum diverifikasi: reset status & OTP (atau isi dari cache biasa)
    const cached = otpCacheRef.current[key];
    setOtpStatus("idle");
    setOtp(cached ?? ""); // kalau mau benar2 kosong, pakai setOtp("")
  }, [phone_number, verifiedPhone, open]);

  const validate = () => {
    const newErrors: {
      name?: string;
      phone_number?: string;
      actual_address?: string;
      otp?: string;
    } = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 huruf";
    }

    console.log(phone_number);

    if (!phone_number || phone_number.length < 8 || phone_number.length > 15) {
      newErrors.phone_number = "Nomor HP harus 8-15 digit angka";
    }

    if (!actualAddress || actualAddress.trim().length < 5) {
      newErrors.actual_address = "Alamat lengkap terlalu pendek";
    }

    if (needsOtp && otpStatus !== "valid") {
      newErrors.otp = "Verifikasi OTP diperlukan untuk mengganti nomor HP";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const diff = buildDiffPayload(
      baselineRef.current,
      { name, phone_number, email, actual_address: actualAddress },
      otp
    );

    if (Object.keys(diff).length === 0) {
      toast.error("Tidak ada perubahan data untuk disimpan.");
      return;
    }

    if (!validate()) return;

    try {
      setIsLoading(true);

      const res = await updateProfileInfo(diff);

      if (res?.data?.statusCode === 200) {
        onClose();
        toast.success(res.data.message || "Profil berhasil diperbarui");

        setTimeout(() => {
          // reload page
          window.location.href = window.location.href;
        }, 2000);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <ModalTemplate
        closeModal={onClose}
        classNameModal="sm:min-w-[50%] max-sm:mx-4"
      >
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh] max-sm:max-h-[80vh]"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center my-6">
            <h3 className="text-2xl font-bold text-dark-primary">
              Edit Profile
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-6 grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-hidden space-y-4 px-6 py-5">
            {/* Nama */}
            <div>
              <DynamicForm
                label="Nama Lengkap"
                isImportant={true}
                name="name"
                value={name}
                onChange={(value: string) => {
                  setName(value);
                  setErrors({ ...errors, name: "" });
                }}
                placeholder="contoh: nama@mail.com"
                error={errors.name}
              />
            </div>

            {/* HP + Kirim OTP */}
            <div>
              <PhoneOTPForm
                mode=""
                storageKey={`otp:change-profile:phone_number`}
                otpDurationSec={0}
                label="Nomor Handphone"
                name="phone_number"
                onChange={(value: string) => {
                  setPhoneNumber(value.replace(/[^0-9]/g, ""));
                }}
                isImportant
                value={phone_number}
                placeholder="Masukkan nomor handphone yang terdaftar"
                error={errors.phone_number}
              />
              <p className="text-xs text-muted mt-1">
                *Kirim OTP untuk verifikasi jika ingin mengganti nomor
                handphone.
              </p>
            </div>

            {/* OTP */}
            {needsOtp && (
              <div>
                <GroupedOTP
                  isInvalid={!!errors.otp || otpStatus === "invalid"}
                  label="Masukkan OTP yang dikirim via Whatsapp atau SMS"
                  isImportant
                  value={otp}
                  isDisabled={otpStatus === "valid"}
                  name="otp"
                  onChange={(value: string) => {
                    setOtp(value);
                  }}
                  onComplete={(val) => {
                    handleVerifyOtp(val);
                  }}
                />

                {otpStatus === "verifying" && (
                  <p className="text-primary mt-1 text-sm italic">
                    Memverifikasi OTP...
                  </p>
                )}

                {otpStatus === "valid" && (
                  <p className="text-green-600 mt-1 text-sm flex items-center gap-1">
                    <FaCircleCheck className="text-green-600" />
                    OTP berhasil diverifikasi! Anda bisa melanjutkan registrasi.
                  </p>
                )}

                {otpStatus === "invalid" && !errors.otp && (
                  <p className="text-red-500 mt-1 text-sm flex items-center gap-1">
                    <FaCircleExclamation className="text-red-500" />
                    Kode OTP tidak valid atau sudah kedaluwarsa.
                  </p>
                )}

                {errors.otp && (
                  <p className="text-red-500 mt-1 text-sm flex items-center gap-1">
                    <FaCircleExclamation className="text-red-500" />
                    {errors.otp}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="max-sm:col-span-2 col-span-1">
              <DynamicForm
                label="Email (opsional)"
                isImportant={false}
                name="email"
                value={email}
                onChange={(value: string) => {
                  setEmail(value);
                  setErrors({ ...errors, email: "" });
                }}
                placeholder="contoh: nama@mail.com"
                error={errors.email}
              />
            </div>

            {/* Alamat */}
            <div>
              <DynamicForm
                label="Alamat Lengkap"
                type="textarea"
                isImportant
                rows={3}
                name="actual_address"
                value={actualAddress}
                onChange={(value: string) => {
                  setActualAddress(value);
                  setErrors({ ...errors, actualAddress: "" });
                }}
                placeholder="Masukkan Alamat Lengkap"
                error={errors.actual_address}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              type="submit"
              disabled={isLoading || (needsOtp && otpStatus !== "valid")}
              className="cursor-pointer w-full rounded-lg bg-primary px-4 py-4 text-xl max-sm:text-lg font-semibold text-white hover:bg-[#0a58a4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </ModalTemplate>
      {/* Card */}
    </div>
  );
}
