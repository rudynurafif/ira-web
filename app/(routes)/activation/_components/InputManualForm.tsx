import DynamicForm from "@/app/_components/form/DynamicForm";
import React, { FormEvent, useState } from "react";

function InputManualForm({
  setActiveSection,
  serialNumberScan,
}: {
  serialNumberScan: string;
  setActiveSection: (val: string) => void;
}) {
  const [serialNumber, setSerialNumber] = useState(
    serialNumberScan ? serialNumberScan : ""
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!serialNumber) {
      errors.serial_number = "Serial Number harus diisi";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);

      return;
    } else {
      setErrors({});

      setActiveSection("setting");
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
            value={serialNumber}
            onChange={(value: string) => {
              setSerialNumber(value.toUpperCase());
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
                  setActiveSection("scan");
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
    </div>
  );
}

export default InputManualForm;
