import { activation } from "@/app/_api/Activation/Activation";
import DynamicForm from "@/app/_components/form/DynamicForm";
import LoadingModal from "@/app/_components/modal/LoadingModal";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { addUrlParam } from "@/app/_shared/utils";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";

function InputManualForm() {
  const params = useSearchParams();
  const [serialNumber, setSerialNumber] = useState<string | null>(
    params.get("serial_number") ? params.get("serial_number") : ""
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [openModalFailed, setOpenModalFailed] = useState<boolean>(false);

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    try {
      setIsSubmitting(true);
      if (!serialNumber) {
        errors.serial_number = "Serial Number harus diisi";
      }

      const res = await activation({ serial_number: serialNumber });

      if (res.data.statusCode === 200) {
        toast.success(
          res.data.message || "Serial Number berhasil diverifikasi"
        );
      } else {
        errors.serial_number =
          res.data.message || "Serial Number tidak valid. Silakan coba lagi.";
        throw new Error(
          res?.data?.message || "Serial Number tidak valid. Silakan coba lagi."
        );
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);

        return;
      } else {
        setErrors({});

        addUrlParam("section", "connect");
        addUrlParam("serial_number", serialNumber);
      }
    } catch (error: any) {
      setOpenModalFailed(true);
      setErrors({
        serial_number:
          error.response?.data?.message ||
          "Terjadi kesalahan saat aktivasi Serial Number. Silakan coba lagi.",
      });
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat aktivasi Serial Number. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-[480px] max-sm:px-8">
      <h2 className="text-[#001D47] font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-center">
        Input Manual Serial Number
      </h2>

      <div className="pt-5">
        <form onSubmit={submitForm}>
          <DynamicForm
            labelClass="text-[#666]"
            label="Serial Number"
            isImportant
            name="serialNumber"
            value={serialNumber ? serialNumber : ""}
            onChange={(value: string) => {
              setSerialNumber(value.toUpperCase());
              setErrors({ ...errors, serial_number: "" });
            }}
            placeholder="Masukkan Serial Number"
            error={errors.serial_number}
          />

          <div className="pt-4">
            <button
              type="submit"
              className="w-full hover:brightness-[1.05] cursor-pointer bg-[#005FB8] shadow-[0_6px_45px_0_rgba(0,48,120,0.10)] text-white px-2 py-3 font-bold rounded-[12px]"
            >
              Submit
            </button>

            <div className="mx-auto flex justify-center">
              <button
                onClick={() => {
                  addUrlParam("section", "scan");
                }}
                type="button"
                className="w-fit hover:font-bold underline-animation-activation cursor-pointer text-[#005FB8] font-semibold text-center pt-5"
              >
                Pindai Barcode
              </button>
            </div>
          </div>
        </form>
      </div>

      <LoadingModal isOpen={isSubmitting} />

      {openModalFailed && (
        <ModalTemplate closeModal={() => setOpenModalFailed(false)}
        classNameModal="p-6 max-w-lg w-full mx-4 text-center"
        >
          {/* Modal Content */}
          <h3 className="text-dark-primary font-bold text-lg">
            {errors.serial_number ?? "Aktivasi Gagal!"}
          </h3>
          <p className="mt-5 font-medium text-sm text-black">
            Maaf, aktivasi Serial Number Anda gagal. Silakan periksa kembali
            Serial Number yang Anda masukkan atau coba metode pemindaian
            barcode.
          </p>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setOpenModalFailed(false)}
              className="inline-flex w-full items-center justify-center rounded-xl bg-button hover:bg-dark-primary-2 px-6 py-3 text-white text-sm font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </ModalTemplate>
      )}
    </div>
  );
}

export default InputManualForm;
