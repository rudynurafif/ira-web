"use client";

import { Figtree } from "next/font/google";
import { useEffect, useState } from "react";
import OtpInput from "../../auth/login/_components/OTPInput";

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

  // lock scroll saat modal open
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
      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
      >
        {/* Header */}
        <div className="relative flex items-center justify-center my-6">
          <h3 className="text-2xl font-bold text-dark-primary">Edit Profile</h3>
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
        <div className="space-y-4 px-6 py-5">
          {/* Nama */}
          <div>
            <label
              className={`${figtree.className} mb-1 block text-sm text-secondary`}
            >
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
              } w-full bg-primary-spectrum rounded-lg font-medium border px-5 py-3 text-[16px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
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
            <label className="mb-1 block text-sm text-secondary">
              Nomor Handphone*
            </label>
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => {
                  const onlyNums = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 13);
                  setPhone(onlyNums);
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                inputMode="numeric"
                className={`${
                  figtree.className
                } w-full bg-primary-spectrum rounded-lg border px-5 py-3 text-[16px] outline-none font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="08xxxxxxxxxx"
              />
              <button
                type="button"
                onClick={() => onSendOtp?.(phone)}
                disabled={sendingOtp}
                className={`${figtree.className} whitespace-nowrap rounded-lg bg-primary px-5 py-3 text-[16px] font-medium text-white hover:bg-[#0a58a4] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer`}
              >
                {sendingOtp ? "Mengirim..." : "Kirim OTP"}
              </button>
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* OTP */}
          <div>
            <label className="mb-1 block text-sm text-secondary">
              Masukkan OTP yang dikirim via Whatsapp atau SMS
            </label>
            <OtpInput length={6} onChange={setOtp} />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm text-secondary">Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${figtree.className} w-full bg-primary-spectrum rounded-lg border border-gray-300 px-5 py-3 text-[16px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium`}
              placeholder="email@domain.com"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="mb-1 block text-sm text-secondary">Alamat*</label>
            <textarea
              value={address}
              readOnly
              disabled
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className={`${figtree.className} w-full bg-primary-spectrum resize-y rounded-lg border border-gray-300 px-5 py-3 text-[16px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-not-allowed font-medium`}
              placeholder="Alamat lengkap"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full rounded-lg bg-primary px-4 py-4 text-xl font-semibold text-white hover:bg-[#0a58a4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
