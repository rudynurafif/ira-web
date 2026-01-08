"use client";

import { Figtree } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import DynamicForm from "@/app/_components/form/DynamicForm";
import toast from "react-hot-toast";
import { verifyOtp } from "@/app/_api/Auth/Auth";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import {
  getProfileInfo,
  updateProfileInfo,
} from "@/app/_api/Customer/CustomerArea";
import { useRouter } from "next/navigation";
import {
  EMAIL_REGEX,
  NAME_REGEX,
  PHONE_REGEX,
  PHONE_REGEX2,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { getUser } from "@/app/store/slice/authSlice";
import { useAppDispatch } from "@/app/store/store";

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

const FIELDS = ["name", "phone_number", "email", "actual_address"] as const;

function buildDiffPayload(prev: Editable, next: Editable, otp?: string) {
  const changed: Record<string, string> = {};

  FIELDS.forEach((k) => {
    const before = normalize(prev[k]);
    const after = normalize(next[k]);

    if (after !== before) {
      if (k === "email") {
        // if (after !== "") {
        changed[k] = after;
        // }
      } else {
        changed[k] = after;
      }
    }
  });

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
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setPhoneNumber(initial?.phone_number ?? "");
      setEmail(initial?.email ?? "");
      setActualAddress(initial?.actual_address ?? "");

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
    } else {
      // ✅ Opsional: reset juga saat ditutup (good hygiene)
      // Tapi tidak wajib karena tidak dipakai
    }
  }, [
    open,
    initial?.name,
    initial?.phone_number,
    initial?.email,
    initial?.actual_address,
  ]);

  useEffect(() => {
    if (!open) return;

    const key = normalize(phone_number);
    const verifiedKey = normalize(verifiedPhone);

    // Jika tidak ada nomor → reset
    if (!key) {
      setOtpStatus("idle");
      setOtp("");
      return;
    }

    // Jika kembali ke nomor yang sudah diverifikasi
    if (verifiedPhone && key === verifiedKey) {
      setOtpStatus("valid");
      const cached = otpCacheRef.current[key];
      if (typeof cached === "string") setOtp(cached);
      return;
    }

    // Nomor baru / beda → wajib verifikasi ulang
    setOtpStatus("idle");
    const cached = otpCacheRef.current[key];
    setOtp(cached ?? "");
  }, [open, phone_number, verifiedPhone]);

  const needsOtp = useMemo(
    () =>
      normalize(phone_number) !== normalize(baselineRef.current.phone_number),
    [phone_number]
  );

  const verifyAbortRef = useRef<AbortController | null>(null);

  async function handleVerifyOtp(val: string) {
    if (otpStatus === "verifying" || otpStatus === "valid") return;

    if (!phone_number) {
      setErrors((e) => ({
        ...e,
        phone_number: "Isi nomor handphone terlebih dahulu",
      }));
      toast.error("Nomor handphone wajib diisi sebelum verifikasi OTP");
      return;
    }

    verifyAbortRef.current?.abort();
    const ac = new AbortController();
    verifyAbortRef.current = ac;

    try {
      setOtpStatus("verifying");
      const res = await verifyOtp({
        phone_number,
        otp: val,
        signal: ac.signal,
      } as any);
      if (res?.data?.statusCode === 200) {
        toast.success(res.data.message ?? "OTP terverifikasi ✔");
        setOtpStatus("valid");
        setVerifiedPhone(phone_number);
        otpCacheRef.current[normalize(phone_number)] = val;
        setOtp(val);
        setErrors((e) => ({ ...e, otp: "" }));
      } else {
        throw new Error("Verifikasi OTP gagal");
      }
    } catch (err: any) {
      if (ac.signal.aborted) return; // komponen tutup / request dibatalkan
      setOtpStatus("invalid");
      setErrors((e) => ({
        ...e,
        otp:
          err?.response?.data?.message ||
          "Kode OTP tidak valid atau sudah kedaluwarsa",
      }));
      toastErrorFromAPI(err, "Verifikasi OTP gagal");
    }
  }

  const validate = () => {
    const newErrors: {
      name?: string;
      phone_number?: string;
      otp?: string;
      email?: string;
      actual_address?: string;
    } = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 huruf";
    }

    if (!phone_number || phone_number.length < 8 || phone_number.length > 15) {
      newErrors.phone_number = "Nomor HP harus 8-15 digit angka";
    }

    if (!actualAddress || actualAddress.trim().length < 5) {
      newErrors.actual_address = "Alamat lengkap terlalu pendek";
    }

    if (!email && initial?.email) {
      newErrors.email = "Email tidak bisa dihapus, hanya bisa diganti.";
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
      toast.success("Tidak ada perubahan data untuk disimpan.");
      onClose();
      return;
    }

    if (!validate()) return;

    try {
      setIsLoading(true);

      const res = await updateProfileInfo(diff);

      if (res?.data?.statusCode === 200) {
        const updatedProfile = await getProfileInfo({});
        dispatch(getUser(updatedProfile.data.data.customer));
        toast.success(res.data.message || "Profil berhasil diperbarui");

        onClose();
      }
    } catch (error: any) {
      toastErrorFromAPI(error, "Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e as any).isComposing) return;
      if (e.key === "Escape" || e.key === "Esc") onClose();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, {
        capture: true,
      } as any);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <ModalTemplate
        closeModal={onClose}
        classNameModal="lg:min-w-[50%] md:min-w-[70%] max-sm:mx-4"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.25)] flex flex-col max-h-[90vh] max-sm:max-h-[80vh]"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center my-6">
            <h3 className="text-2xl font-bold text-black">Edit Profile</h3>
          </div>

          <div className="flex-1 overflow-y-auto overflow-hidden space-y-4 p-6">
            {/* Nama */}
            <div>
              <DynamicForm
                label="Nama Lengkap"
                isImportant={true}
                name="name"
                value={name}
                onChange={(value: string) => {
                  const filtered = value.replace(/[^a-zA-Z\s.\-]/g, "");
                  setName(filtered);

                  if (!NAME_REGEX.test(filtered)) {
                    setErrors((e) => ({
                      ...e,
                      name: "Nama hanya boleh huruf, spasi, titik, atau tanda hubung",
                    }));
                  } else if (filtered.length < 2) {
                    setErrors((e) => ({ ...e, name: "Nama minimal 2 huruf" }));
                  } else {
                    setErrors((e) => ({ ...e, name: "" }));
                  }
                }}
                placeholder="Masukkan nama lengkap Anda"
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
                  const digitsOnly = value.replace(/\D/g, "").slice(0, 15);
                  setPhoneNumber(digitsOnly);

                  if (digitsOnly && !PHONE_REGEX2.test(digitsOnly)) {
                    setErrors((e) => ({
                      ...e,
                      phone_number: "Masukkan nomor HP yang valid",
                    }));
                  } else if (
                    digitsOnly.length > 0 &&
                    (digitsOnly.length < 8 || digitsOnly.length > 15)
                  ) {
                    setErrors((e) => ({
                      ...e,
                      phone_number: "Nomor HP harus 8-15 digit",
                    }));
                  } else {
                    setErrors((e) => ({ ...e, phone_number: "" }));
                  }
                }}
                isImportant
                value={phone_number}
                placeholder="Pastikan nomor handphone Anda benar dan aktif"
                error={errors.phone_number}
                isDisabledInput={!needsOtp}
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
                label="Email"
                isImportant={false}
                name="email"
                value={email}
                onChange={(value: string) => {
                  setEmail(value);

                  if (value && !EMAIL_REGEX.test(value)) {
                    setErrors((e) => ({
                      ...e,
                      email: "Format email tidak valid",
                    }));
                  } else if (initial?.email && !value) {
                    setErrors((e) => ({
                      ...e,
                      email: "Email tidak bisa dihapus, hanya bisa diganti",
                    }));
                  } else {
                    setErrors((e) => ({ ...e, email: "" }));
                  }
                }}
                placeholder={
                  initial?.email
                    ? "Email tidak bisa dihapus. Untuk mengganti, masukkan email baru."
                    : "contoh: nama@mail.com (opsional)"
                }
                error={errors.email}
              />
              <p className="text-xs text-muted mt-1">
                {!initial?.email &&
                  "Opsional: tambahkan email untuk notifikasi dan pemulihan akun."}
              </p>
            </div>

            {/* Alamat */}
            <div>
              <DynamicForm
                label="Alamat Lengkap"
                type="textarea"
                isImportant
                rows={4}
                name="actual_address"
                value={actualAddress}
                onChange={(value: string) => {
                  setActualAddress(value);

                  if (value.trim().length > 0 && value.trim().length < 5) {
                    setErrors((e) => ({
                      ...e,
                      actual_address: "Alamat terlalu pendek",
                    }));
                  } else if (value.trim().length === 0) {
                    setErrors((e) => ({
                      ...e,
                      actual_address: "Alamat wajib diisi",
                    }));
                  } else {
                    setErrors((e) => ({ ...e, actual_address: "" }));
                  }
                }}
                placeholder="Masukkan Alamat Lengkap"
                error={errors.actual_address}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex max-md:flex-col gap-3 md:gap-6 px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer border-2 border-primary w-full rounded-lg bg-white hover:bg-red-50 p-2 text-lg font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                (needsOtp && otpStatus !== "valid") ||
                Object.values(errors).some((v) => v && v.trim() !== "")
              }
              className="cursor-pointer w-full rounded-lg bg-primary p-2 text-lg font-semibold text-white hover:bg-dark-primary-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </ModalTemplate>
    </div>
  );
}
