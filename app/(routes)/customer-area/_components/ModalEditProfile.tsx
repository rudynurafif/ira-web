"use client";

import { Figtree } from "next/font/google";
import { useEffect, useState } from "react";
import OtpInput from "../../auth/login/_components/OTPInput";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (v: {
    fullName: string;
    phone: string;
    otp: string;
    email: string;
    address: string;
  }) => void;
  initial?: Partial<{
    fullName: string;
    phone: string;
    email: string;
    address: string;
  }>;
  sendingOtp?: boolean;
  onSendOtp?: (phone: string) => void;
  loading?: boolean;
};

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function ModalEditProfile({
  open,
  onClose,
  onSubmit,
  initial,
  sendingOtp,
  onSendOtp,
  loading,
}: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [otp, setOtp] = useState<string>("");
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>(
    {}
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const validate = () => {
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Nama minimal 2 huruf";
    }

    if (!phone || phone.length < 8 || phone.length > 13) {
      newErrors.phone = "Nomor HP harus 8-13 digit angka";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ fullName, phone, otp, email, address });
  };

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

          {/* Body */}
          <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5">
            {/* Nama */}
            <div>
              <label className={` mb-1 block text-base text-secondary`}>
                Nama Lengkap*
              </label>
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                className={`${
                  figtree.className
                } w-full bg-primary-spectrum rounded-lg font-medium border px-5 py-3 text-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nama lengkap"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* HP + Kirim OTP */}
            <div>
              <PhoneOTPForm
                mode=""
                storageKey={`otp:change-profile:phone`} // ✅ key unik per use-case
                otpDurationSec={10}
                label="Nomor Handphone"
                name="phone"
                onChange={(value: string) => {
                  setPhone(value.replace(/[^0-9]/g, "")); // Hanya angka
                }}
                isImportant
                value={phone}
                placeholder="Masukkan nomor handphone yang terdaftar"
                // error={errors.phone}
              />
            </div>

            {/* OTP */}
            <div>
              <GroupedOTP
                label="Masukkan OTP yang dikirim via Whatsapp atau SMS"
                isImportant
                name="otp"
                onChange={(value: string) => {
                  setOtp(value);
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-secondary">Email*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-primary-spectrum rounded-lg border border-gray-300 px-5 py-3 text-[16px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium`}
                placeholder="email@domain.com"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="mb-1 block text-secondary">Alamat*</label>
              <textarea
                value={address}
                readOnly
                disabled
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={`font-secondary w-full bg-primary-spectrum resize-y rounded-lg border border-gray-300 px-5 py-3 text-[16px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-not-allowed font-medium`}
                placeholder="Alamat lengkap"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full rounded-lg bg-primary px-4 py-4 text-xl max-sm:text-lg font-semibold text-white hover:bg-[#0a58a4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </ModalTemplate>
      {/* Card */}
    </div>
  );
}
