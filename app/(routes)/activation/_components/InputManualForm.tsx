import { Activation } from "@/app/_api/Activation/Activation";
import DynamicForm from "@/app/_components/form/DynamicForm";
import LoadingModal from "@/app/_components/modal/LoadingModal";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { addUrlParam, toastErrorFromAPI } from "@/app/_shared/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import noSN from "@/public/assets/Images/no-sn.svg";
import SNUsed from "@/public/assets/Images/sn-used.svg";
import maxAttemptImage from "@/public/assets/Images/maxAttempFailed.png";
import successImage from "@/public/assets/Images/activate-success.png";

import iconScan from "@/public/assets/Icons/icon-scan.svg";
import Image from "next/image";
import {
  incrementFailedAttempt,
  resetFailedAttempt,
  hasReachedMaxAttempts,
  getFailedAttemptData,
} from "@/app/_shared/utils/failedAttemptCounter";
import { getDealerSuppPhone } from "@/app/_api/Customer/CustomerArea";
import { getSetting } from "@/app/_api/Settings/Settings";
import { useAppSelector } from "@/app/store/store";

function InputManualForm() {
  const params = useSearchParams();
  const [serialNumber, setSerialNumber] = useState<string | null>(
    params.get("serial_number") ? params.get("serial_number") : "",
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [openModalFailed, setOpenModalFailed] = useState<boolean>(false);
  const [openModalSuccess, setOpenModalSuccess] = useState(false);
  const [isSNUsed, setIsSNUsed] = useState(false);
  const savedSN = JSON.parse(
    localStorage.getItem("savedSerialNumbers") || "[]",
  );
  const [isSNNotFound, setIsSNNotFound] = useState(false);
  const [phoneCSIRA, setPhoneCSIRA] = useState<string>("");
  const { userInfo } = useAppSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    const loadCSPhone = async () => {
      try {
        const resSetting = await getSetting("cs_phone");
        setPhoneCSIRA(
          resSetting.data?.data?.value ||
            process.env.NEXT_PUBLIC_PHONE_CS ||
            "6281110689111",
        );
      } catch (error) {
        console.error("Failed to load CS phone:", error);
      }
    };

    loadCSPhone();
  }, []);

  async function contactCS() {
    if (!serialNumber) {
      toast.error("Pastikan SN sudah diinput");
      return;
    }

    const failedData = getFailedAttemptData();
    const count =
      failedData.attempts.length > 0
        ? failedData.attempts.length
        : failedData.count;

    // Format detail kendala
    const attemptLogs = failedData.attempts
      .map(
        (log, idx) => `* *Percobaan ${idx + 1}*: ${log.message} (SN: ${log.sn})`,
      )
      .join("\n");

    // Format Waktu Percobaan Terakhir
    let lastTimeLog = "";
    if (failedData.lastFailedAt) {
      const date = new Date(failedData.lastFailedAt);
      const formattedDate = date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });
      lastTimeLog = `\n* *Waktu Percobaan Terakhir*: ${formattedDate} WIB`;
    }

    const msg = encodeURIComponent(
      `Halo Customer Service IRA 👋

Saya mengalami kendala *gagal aktivasi layanan* setelah mencoba sebanyak *${count} kali*.

Berikut detail data pelanggan saya:

* *ID Pelanggan*: ${userInfo?.customer_code || "-"}
* *Nama Pelanggan*: ${userInfo?.name || "-"}
* *Nomor HP*: ${userInfo?.phone_number || "-"}
* *SN CPE Saat Ini*: ${serialNumber}

*Detail Kendala Percobaan Aktivasi:*

${attemptLogs || "* *Tidak ada riwayat error tercatat*"}${lastTimeLog}

Mohon bantuannya untuk dilakukan pengecekan dan proses aktivasi lanjutan.`,
    );

    try {
      const resPhone = await getDealerSuppPhone();

      if (resPhone.data.statusCode === 200) {
        const phone = resPhone.data?.data?.cs_phone_number ?? phoneCSIRA;
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      } else {
        window.open(`https://wa.me/${phoneCSIRA}?text=${msg}`, "_blank");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Gagal membuka WhatsApp Customer Service",
      );
    }
  }

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors: { [key: string]: string } = {};

    try {
      setIsSubmitting(true);

      if (!serialNumber) {
        errors.serial_number = "Serial Number harus diisi";
      }

      localStorage.setItem("ira-cpe-serial-number", serialNumber!);

      // trigger SSE
      const res = await Activation({ sn: serialNumber });

      if (res.data.data?.status === "Success") {
        setOpenModalSuccess(true);
        return;
      } else if (res.data.data?.status === "pending") {
        // resetFailedAttempt();

        toast.loading(
          res.data.message ||
            "Sedang proses aktivasi, silakan cek status secara berkala",
        );
      } else {
        const errorMessage =
          res.data.message || "Serial Number tidak valid. Silakan coba lagi.";
        errors.serial_number = errorMessage;
        throw new Error(errorMessage);
      }

      // jika ada error
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      } else {
        // jika berhasil
        setErrors({});
        // resetFailedAttempt();
        addUrlParam("section", "connect");
        addUrlParam("serial_number", serialNumber);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat aktivasi Serial Number. Silakan coba lagi.";

      incrementFailedAttempt(serialNumber!, errorMessage);
      setOpenModalFailed(true);

      const statusCode = error?.response?.data?.statusCode;

      switch (statusCode) {
        case 409:
          setIsSNUsed(true);
          break;
        case 404:
        case 400:
          setIsSNNotFound(true);
          break;
        default:
          setIsSNNotFound(true);
          break;
      }

      setErrors({
        serial_number: errorMessage,
      });
      toastErrorFromAPI(error);
    } finally {
      setIsSubmitting(false);
      const saved = JSON.parse(
        localStorage.getItem("savedSerialNumbers") || "[]",
      );
      const updated = [
        serialNumber,
        ...saved.filter((s: any) => s !== serialNumber),
      ].slice(0, 5);
      localStorage.setItem("savedSerialNumbers", JSON.stringify(updated));
    }
  }

  return (
    <div className="container mx-auto max-w-120 max-sm:px-8">
      <h2 className="text-old-primary font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-center">
        Input Manual Serial Number
      </h2>

      <div className="pt-5">
        <form onSubmit={submitForm}>
          <DynamicForm
            labelClass="text-[#666]"
            label="Serial Number"
            isImportant
            name="serialNumber"
            savedOptions={savedSN}
            datalist="saved-serials"
            value={serialNumber ? serialNumber : ""}
            onChange={(value: string) => {
              const sanitizedValue = value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              setSerialNumber(sanitizedValue);
              setErrors({ ...errors, serial_number: "" });
            }}
            placeholder="Masukkan Serial Number"
            error={errors.serial_number}
          />

          <div className="mt-6">
            <button
              disabled={isSubmitting || !serialNumber}
              type="submit"
              className="w-full disabled:bg-slate-400 hover:bg-dark-primary-2 cursor-pointer bg-primary shadow-[0_6px_45px_0_rgba(0,48,120,0.10)] text-white px-2 py-3 font-bold rounded-xl border border-primary hover:border-dark-primary-2 disabled:border-slate-400 disabled:cursor-not-allowed!"
            >
              Submit
            </button>

            <div className="mx-auto flex justify-center">
              <button
                onClick={() => {
                  addUrlParam("section", "scan");
                }}
                type="button"
                className="w-full flex items-center justify-center hover:font-bold cursor-pointer bg-white hover:bg-red-50 rounded-xl px-2 py-3 font-medium text-primary border border-primary mt-2"
              >
                <Image
                  src={iconScan}
                  alt="icon scan"
                  className="inline-block mr-2"
                />
                Scan Barcode
              </button>
            </div>
          </div>

          {hasReachedMaxAttempts() && (
            <div className="mt-10 flex flex-col items-center w-full">
              <div className="text-sm">Mengalami Kendala?</div>
              <div className="mt-3">
                <button
                  onClick={contactCS}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Hubungi Customer Service
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <LoadingModal isOpen={isSubmitting} />

      {openModalSuccess && (
        <ModalTemplate
          closeModal={() => {
            setOpenModalSuccess(false);
            window.location.href = "/customer-area";
          }}
          classNameModal="p-6 max-w-lg w-full mx-4 text-center"
        >
          <div className="flex justify-center items-center mb-6">
            <Image
              src={successImage}
              width={200}
              height={200}
              alt="Aktivasi Berhasil"
            />
          </div>

          <h3 className="text-dark-primary font-bold text-2xl mb-2">
            Aktivasi Berhasil! 🎉
          </h3>

          <p className="text-gray-600 font-medium mb-4">
            Layanan internet Anda sudah aktif dan siap digunakan
          </p>

          <button
            type="button"
            onClick={() => {
              setOpenModalSuccess(false);
              window.location.href = "/customer-area";
            }}
            className="w-full bg-primary hover:bg-dark-primary-2 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Kembali ke Customer Area
          </button>
        </ModalTemplate>
      )}

      {openModalFailed && (
        <ModalTemplate
          closeModal={() => {
            setOpenModalFailed(false);
            setIsSNNotFound(false);
            setIsSNUsed(false);
          }}
          classNameModal="p-6 max-w-lg w-full mx-4 text-center"
        >
          {hasReachedMaxAttempts() ? (
            <>
              <div className="flex justify-center items-center mb-4">
                <Image
                  src={maxAttemptImage}
                  width={200}
                  height={200}
                  alt="Percobaan Mencapai 3 kali"
                />
              </div>
              <h3 className="text-dark-primary font-bold text-xl mt-4">
                {errors.serial_number ??
                  "Serial Number salah atau tidak ditemukan"}
              </h3>
              <p className="mt-5 font-medium text-sm text-black">
                Proses Aktivasi masih membutuhkan waktu. Silakan hubungi
                Customer Service untuk bantuan lebih lanjut.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenModalFailed(false);
                    contactCS();
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary border-2 border-primary hover:bg-dark-primary-2 px-6 py-3 text-white text-sm font-semibold cursor-pointer"
                >
                  Hubungi Customer Service
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModalFailed(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white border-2 border-primary hover:bg-red-50 px-6 py-3 text-primary text-sm font-semibold cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center items-center">
                {isSNNotFound && (
                  <Image
                    src={noSN}
                    width={200}
                    height={200}
                    alt="Nomor SN Invalid w-full"
                  />
                )}
                {isSNUsed && (
                  <Image
                    src={SNUsed}
                    width={200}
                    height={200}
                    alt="Nomor SN Invalid w-full"
                  />
                )}
              </div>

              <h3 className="text-dark-primary font-bold text-xl mt-6">
                {errors.serial_number ??
                  "Serial Number salah atau tidak ditemukan"}
              </h3>
              <p className="mt-5 font-medium text-sm text-black">
                Silakan input ulang Serial Number Anda
              </p>

              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setOpenModalFailed(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-button hover:bg-dark-primary-2 px-6 py-3 text-white text-sm font-semibold cursor-pointer"
                >
                  Input Ulang
                </button>
              </div>
            </>
          )}
        </ModalTemplate>
      )}
    </div>
  );
}

export default InputManualForm;
