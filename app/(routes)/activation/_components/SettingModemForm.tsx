import DynamicForm from "@/app/_components/form/DynamicForm";
import { addUrlParam, resetUrlParam } from "@/app/_shared/utils";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

interface FormType {
  ssid_24ghz: string;
  password_24ghz: string;
  ssid_5ghz: string;
  password_5ghz: string;
}

function SettingModemForm() {
  const params = useSearchParams();
  const [formData, setFormData] = useState<FormType>({
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

      addUrlParam("section", "check_signal");
      // addUrlParam("ssid_24", formData.ssid_24ghz);
      // addUrlParam("password_24", formData.password_24ghz);
      // addUrlParam("ssid_5", formData.ssid_5ghz);
      // addUrlParam("password_5", formData.password_5ghz);
    }
  }

  useEffect(() => {
    const spSsid24 = params.get("ssid_24");
    const spPassword24 = params.get("password_24");
    const spSsid5 = params.get("ssid_5");
    const spPassword5 = params.get("password_5");

    if (spSsid24) {
      setFormData((prevData: any) => ({
        ...prevData,
        ssid_24ghz: spSsid24 || "",
      }));
    }

    if (spPassword24) {
      setFormData((prevData: any) => ({
        ...prevData,
        password_24ghz: spPassword24 || "",
      }));
    }

    if (spSsid5) {
      setFormData((prevData: any) => ({
        ...prevData,
        ssid_5ghz: spSsid5 || "",
      }));
    }

    if (spPassword5) {
      setFormData((prevData: any) => ({
        ...prevData,
        password_5ghz: spPassword5 || "",
      }));
    }
  }, []);

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
              // if (value) {
              //   addUrlParam("ssid_24", value);
              // } else {
              //   resetUrlParam("ssid_24");
              // }
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
                // if (value) {
                //   addUrlParam("password_24", value);
                // } else {
                //   resetUrlParam("password_24");
                // }
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

              // if (value) {
              //   addUrlParam("ssid_5", value);
              // } else {
              //   resetUrlParam("ssid_5");
              // }
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

                // if (value) {
                //   addUrlParam("password_5", value);
                // } else {
                //   resetUrlParam("password_5");
                // }
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
                  addUrlParam("section", "check_signal");
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
