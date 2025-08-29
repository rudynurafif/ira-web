import DynamicForm from "@/app/_components/form/DynamicForm";
import React, { FormEvent, useState } from "react";

function SettingModemForm({
  setActiveSection,
}: {
  setActiveSection: (val: string) => void;
}) {
  const [formData, setFormData] = useState<any>({
    ssid_24ghz: "",
    password_24ghz: "",
    ssid_5ghz: "",
    password_5ghz: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // if (!formData.ssid_24ghz) {
    //   errors.ssid_24ghz = "SSID 2.4Ghz harus diisi";
    // }
    // if (!formData.password_24ghz) {
    //   errors.password_24ghz = "Password 2.4Ghz harus diisi";
    // }
    // if (!formData.ssid_5ghz) {
    //   errors.ssid_5ghz = "SSID 5Ghz harus diisi";
    // }
    // if (!formData.password_5ghz) {
    //   errors.password_5ghz = "Password 5Ghz harus diisi";
    // }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);

      return;
    } else {
      setErrors({});

      setActiveSection("check-signal");
    }
  }

  return (
    <div className="container mx-auto max-w-[480px] max-sm:px-8">
      <h2 className="text-[#001D47] font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-center">
        Atur Modem
      </h2>

      <div className="pt-5">
        <form onSubmit={submitForm}>
          <label htmlFor="ssid_24ghz" className="font-medium pb-2 block">
            Setting SSID 2.4 Ghz
          </label>
          <DynamicForm
            label="SSID"
            labelClass="text-[#666] text-sm"
            isImportant={false}
            name="ssid_24ghz"
            value={formData.ssid_24ghz}
            onChange={(value: string) => {
              setFormData((prevData: any) => ({
                ...prevData,
                ssid_24ghz: value,
              }));
            }}
            placeholder="Masukkan SSID 2.4Ghz"
            error={errors.ssid_24ghz}
          />

          <div className="pt-2">
            <DynamicForm
              label="Kata Sandi"
              labelClass="text-[#666] text-sm"
              isImportant={false}
              name="password_24ghz"
              value={formData.password_24ghz}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  password_24ghz: value,
                }));
              }}
              placeholder="Masukkan kata sandi 2.4Ghz"
              error={errors.password_24ghz}
            />
          </div>

          <label htmlFor="ssid_24ghz" className="font-medium py-2 block">
            Setting SSID 5 Ghz
          </label>

          <DynamicForm
            label="SSID"
            labelClass="text-[#666] text-sm"
            isImportant={false}
            name="ssid_5ghz"
            value={formData.ssid_5ghz}
            onChange={(value: string) => {
              setFormData((prevData: any) => ({
                ...prevData,
                ssid_5ghz: value,
              }));
            }}
            placeholder="Masukkan SSID 5Ghz"
            error={errors.ssid_5ghz}
          />

          <div className="pt-2">
            <DynamicForm
              label="Kata Sandi"
              labelClass="text-[#666] text-sm"
              isImportant={false}
              name="password_5ghz"
              value={formData.password_5ghz}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  password_5ghz: value,
                }));
              }}
              placeholder="Masukkan kata sandi 5Ghz"
              error={errors.password_5ghz}
            />
          </div>

          <div className="pt-4">
            <button
              disabled={
                !formData.ssid_24ghz ||
                !formData.password_24ghz ||
                !formData.ssid_5ghz ||
                !formData.password_5ghz
              }
              type="submit"
              className={`w-full ${
                !formData.ssid_24ghz ||
                !formData.password_24ghz ||
                !formData.ssid_5ghz ||
                !formData.password_5ghz
                  ? "bg-[#005FB8]/50"
                  : "cursor-pointer bg-[#005FB8]"
              }    shadow-[0_6px_45px_0_rgba(0,48,120,0.10)] text-white px-2 py-3 font-bold rounded-[12px]`}
            >
              Simpan
            </button>

            <div className="mx-auto flex justify-center pt-2">
              <button
                onClick={() => {
                  setActiveSection("check-signal");
                }}
                type="button"
                className="w-full hover:brightness-[1.05] hover:bg-gray-200 cursor-pointer border border-[#005FB8] text-[#005FB8] shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]  px-2 py-3 font-bold rounded-[12px]"
              >
                Lewati
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingModemForm;
