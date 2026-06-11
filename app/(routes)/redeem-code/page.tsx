"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { addUrlParam, toastErrorFromAPI } from "@/app/_shared/utils";
import { checkRedeemCode } from "@/app/_api/RedeemCode/RedeemCode";
import RegistrationWizard from "../auth/register/_components/RegistrationWizard";
import { dmSans } from "@/app/_shared/font/font";

// =========================================
// KOMPONEN INPUT (MIRIP DENGAN FORM DI LOGIN)
// =========================================
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  isImportant?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  isImportant = false,
  placeholder = "",
  type = "text",
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {isImportant && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// =========================================
// HALAMAN KODE VOUCHER
// =========================================
const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState(false);
  const [duration, setDuration] = useState<number>(0); // State untuk menyimpan durasi voucher

  //   useEffect(() => {
  //     setCode("TESTQA1VZNB278MEF");
  //     setCodeAvailable(true);
  //     setDuration(getVoucherDuration("TESTQA1VZNB278MEF")); // Hitung dan set durasi setelah API sukses
  //   }, []);

  // Fungsi untuk menentukan durasi gratis berdasarkan karakter akhir kode
  const getVoucherDuration = (voucherCode: string) => {
    if (!voucherCode || voucherCode.length < 2) return 0;
    const lastChar = voucherCode[voucherCode.length - 1].toUpperCase();
    const secondLastChar = voucherCode[voucherCode.length - 2].toUpperCase();

    // Cek karakter paling belakang
    if (lastChar === "F") return 2;
    if (lastChar === "W") return 1;

    // Jika bukan F atau W, mundur 1 kali (cek karakter kedua dari belakang)
    if (secondLastChar === "F") return 2;
    if (secondLastChar === "W") return 1;

    return 0;
  };

  // ===============================
  // CEK URL PARAMETER
  // - `code`: jika ada, langsung tampilkan RegistrationWizard
  // - `referral_code`: wajib ada untuk bisa mengakses halaman voucher
  // ===============================

  // Validasi sederhana untuk kode voucher
  const validateCode = (val: string) => {
    if (!val.trim()) return "Kode voucher wajib diisi";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const codeError = validateCode(code);

    if (codeError) {
      setError(codeError);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const body = {
        code: code,
      };

      const res_checkRedeem = await checkRedeemCode(body);

      if (res_checkRedeem?.data?.statusCode === 200) {
        toast.success(res_checkRedeem?.data?.message);
        setDuration(getVoucherDuration(code)); // Hitung dan set durasi setelah API sukses
        // addUrlParam("code", code);
        setCodeAvailable(true);
      }
    } catch (err: any) {
      toastErrorFromAPI(err, "Gagal menukarkan kode voucher");
      setCodeAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !validateCode(code);

  // ===============================
  // TAMPILAN JIKA TIDAK ADA REFERRAL CODE
  // ===============================
  //   if (!hasReferral) {
  //     return (
  //       <div className="flex w-full justify-center px-6 my-10">
  //         <div className="w-full max-w-xl text-center">
  //           <h1 className="mb-4 text-old-primary font-extrabold text-2xl sm:text-[32px]">
  //             Akses Ditolak
  //           </h1>
  //           <p className="text-gray-600 text-sm sm:text-base">
  //             Halaman ini memerlukan{" "}
  //             <span className="font-semibold text-primary">referral code</span>{" "}
  //             yang valid.
  //             <br />
  //             Silakan gunakan link voucher yang diberikan.
  //           </p>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <>
      {!codeAvailable ? (
        <div className="flex w-full justify-center px-6 my-10">
          <div className="w-full max-w-xl">
            <h1 className="mb-4 text-center text-old-primary font-extrabold text-2xl sm:text-[32px]">
              Tukar Kode Voucher
            </h1>

            <p className="mb-8 text-center text-gray-600 text-sm sm:text-base">
              Masukkan kode voucher Anda
              {/* untuk mendapatkan{" "}
              <span className="font-semibold text-primary">
                paket internet gratis selama 3 bulan
              </span>
              . */}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <InputField
                label="Kode Voucher"
                name="voucher_code"
                isImportant
                value={code}
                onChange={(val) => {
                  // Auto uppercase agar sesuai format kode voucher
                  setCode(val.toUpperCase());
                  setError("");
                }}
                error={error}
                placeholder="Masukkan Kode Voucher"
              />

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`py-3 flex items-center justify-center gap-2 font-bold text-white text-xl rounded-xl transition-colors
            ${
              isLoading || !isFormValid
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-primary hover:bg-dark-primary-2 cursor-pointer"
            }`}
              >
                <div
                  className={`loading w-5 h-5 ${isLoading ? "block" : "hidden"}`}
                ></div>
                <span className={isLoading ? "hidden" : "block"}>Tukarkan</span>
                <span className={isLoading ? "block" : "hidden"}>
                  Loading...
                </span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div
          className={`bg-white min-h-screen w-full relative overflow-x-hidden ${dmSans.className}`}
        >
          {/* Red background - covers entire height */}
          <div
            className="absolute top-0 left-0 w-full h-[85vh] bg-cover bg-left bg-no-repeat"
            style={{ backgroundImage: "url('/assets/Images/bg-register.png')" }}
          />

          {/* Content on top */}
          <div className="relative z-10">
            <div className="px-4 md:px-6 pt-5 pb-10">
              {/* CARD INFO VOUCHER BERHASIL */}
              <div className="max-w-xl mx-auto mb-8 p-6 bg-white border border-green-200 rounded-2xl shadow-lg text-center">
                <h2 className="text-xl font-bold text-green-600">
                  Voucher Berhasil Diredeem!
                </h2>
                {/* <p className="text-gray-600 mb-4">
                  Anda berhak mendapatkan paket internet gratis selama
                </p>
                <div className="inline-block px-6 py-3 bg-primary/10 text-primary font-bold text-2xl rounded-xl">
                  {duration > 0 ? `${duration} Bulan` : "Periode Khusus"}
                </div> */}
              </div>

              <RegistrationWizard
                redeemCode={code}
                title="Registrasi IRA"
                mode="register"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
