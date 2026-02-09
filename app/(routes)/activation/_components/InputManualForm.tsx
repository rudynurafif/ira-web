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
import iconScan from "@/public/assets/Icons/icon-scan.svg";
import Image from "next/image";

function InputManualForm() {
  const params = useSearchParams();
  const [serialNumber, setSerialNumber] = useState<string | null>(
    params.get("serial_number") ? params.get("serial_number") : "",
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [openModalFailed, setOpenModalFailed] = useState<boolean>(false);
  const [isSNUsed, setIsSNUsed] = useState(false);
  const savedSN = JSON.parse(
    localStorage.getItem("savedSerialNumbers") || "[]",
  );
  const [isSNNotFound, setIsSNNotFound] = useState(false);

  const router = useRouter();

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

      if (res.data.statusCode === 200 || res.data.statusCode === 201) {
        toast.loading(
          res.data.message ||
            "Sedang proses aktivasi, silakan cek status secara berkala",
        );
      } else {
        errors.serial_number =
          res.data.message || "Serial Number tidak valid. Silakan coba lagi.";
        throw new Error(
          res?.data?.message || "Serial Number tidak valid. Silakan coba lagi.",
        );
      }

      // jika ada error
      if (Object.keys(errors).length > 0) {
        setErrors(errors);

        return;
      } else {
        // jika berhasil
        setErrors({});

        addUrlParam("section", "connect");
        addUrlParam("serial_number", serialNumber);
      }
    } catch (error: any) {
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
        serial_number:
          error.response?.data?.message ||
          "Terjadi kesalahan saat aktivasi Serial Number. Silakan coba lagi.",
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
        </form>
      </div>

      <LoadingModal isOpen={isSubmitting} />

      {openModalFailed && (
        <ModalTemplate
          closeModal={() => {
            setOpenModalFailed(false);
            setIsSNNotFound(false);
            setIsSNUsed(false);
          }}
          classNameModal="p-6 max-w-lg w-full mx-4 text-center"
        >
          {/* Modal Content */}
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
            {errors.serial_number ?? "Serial Number salah atau tidak ditemukan"}
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
        </ModalTemplate>
      )}
    </div>
  );
}

export default InputManualForm;
