import DynamicForm from "@/app/_components/form/DynamicForm";
import { addUrlParam, resetUrlParam } from "@/app/_shared/utils";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import eyeClose from "@/public/assets/Icons/eye-close.png";
import eye from "@/public/assets/Icons/eye.png";
import { getDetailCPE, setSSID } from "@/app/_api/CoreNetwork/CoreNetwork";
import { CpeSimBinding, SetSSIDBody } from "@/app/_shared/types/CoreNetwork";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import toast from "react-hot-toast";
import { useSSE } from "@/app/_context/SSEContext";

interface FormType {
  ssid_24ghz: string;
  password_24ghz: string;
  ssid_5ghz: string;
  password_5ghz: string;
}

function SettingModemForm() {
  const params = useSearchParams();
  const [cpeDetail, setCpeDetail] = useState<CpeSimBinding | null>(null);
  const [formData, setFormData] = useState<FormType>({
    ssid_24ghz: "",
    password_24ghz: "",
    ssid_5ghz: "",
    password_5ghz: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword5, setShowPassword5] = useState(false);
  const { wifiConfig } = useSSE();
  const sn =
    typeof window !== "undefined"
      ? localStorage.getItem("ira-cpe-serial-number")
      : null;

  useEffect(() => {
    async function fetchCPE() {
      try {
        const res = await getDetailCPE();
        setCpeDetail(res?.data?.data ?? null);
      } catch (e) {
        toastErrorFromAPI(e);
      }
    }

    fetchCPE();
  }, []);

  useEffect(() => {
    if (!cpeDetail?.cpe_id || Object.keys(wifiConfig).length > 0) return;

    setFormData((prev) => ({
      ...prev,
      ssid_24ghz: cpeDetail.cpe_id.ssid ?? "",
      password_24ghz: cpeDetail.cpe_id.password ?? "",
      ssid_5ghz: cpeDetail.cpe_id.ssid5 ?? "",
      password_5ghz: cpeDetail.cpe_id.password5 ?? "",
    }));
  }, [cpeDetail, wifiConfig]);

  useEffect(() => {
    if (!wifiConfig) return;

    setFormData((prev) => ({
      ...prev,
      ssid_24ghz: wifiConfig.ssid ?? prev.ssid_24ghz,
      password_24ghz: wifiConfig.password ?? prev.password_24ghz,
      ssid_5ghz: wifiConfig.ssid5 ?? prev.ssid_5ghz,
      password_5ghz: wifiConfig.password5 ?? prev.password_5ghz,
    }));
  }, [wifiConfig]);

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    setIsSubmitting(true);

    try {
      if (!formData.ssid_24ghz.trim()) {
        errors.ssid_24ghz = "SSID 2.4GHz tidak boleh kosong";
      } else if (
        formData.ssid_24ghz.length < 2 ||
        formData.ssid_24ghz.length > 32
      ) {
        errors.ssid_24ghz = "SSID harus 2–32 karakter";
      }

      if (!formData.password_24ghz.trim()) {
        errors.password_24ghz = "Password 2.4GHz tidak boleh kosong";
      } else if (
        formData.password_24ghz.length < 8 ||
        formData.password_24ghz.length > 63
      ) {
        errors.password_24ghz = "Password harus 8–63 karakter";
      }

      if (!formData.ssid_5ghz.trim()) {
        errors.ssid_5ghz = "SSID 5GHz tidak boleh kosong";
      } else if (
        formData.ssid_5ghz.length < 2 ||
        formData.ssid_5ghz.length > 32
      ) {
        errors.ssid_5ghz = "SSID harus 2–32 karakter";
      }

      if (!formData.password_5ghz.trim()) {
        errors.password_5ghz = "Password 5GHz tidak boleh kosong";
      } else if (
        formData.password_5ghz.length < 8 ||
        formData.password_5ghz.length > 63
      ) {
        errors.password_5ghz = "Password harus 8–63 karakter";
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);

        return;
      } else {
        if (!sn) {
          toast.error("Serial number CPE tidak ditemukan");
          return;
        }

        const body: SetSSIDBody = {
          sn,
          ssid: formData.ssid_24ghz,
          password: formData.password_24ghz,
          ssid5: formData.ssid_5ghz,
          password5: formData.password_5ghz,
        };

        const setSSIDRes = await setSSID(body);

        // optional: simpan lokal untuk fallback
        sessionStorage.setItem(
          "wifi-config",
          JSON.stringify({
            ssid: formData.ssid_24ghz,
            password: formData.password_24ghz,
            ssid5: formData.ssid_5ghz,
            password5: formData.password_5ghz,
          })
        );

        if (
          setSSIDRes.data.statusCode === 201 ||
          setSSIDRes.data.statusCode === 200
        ) {
          toast.success("Setting SSID berhasil disimpan");
        }

        // lanjut ke step berikutnya
        addUrlParam("section", "check_signal");
      }
    } catch (err: any) {
      toastErrorFromAPI(err);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-120 max-sm:px-8">
      <h2 className="text-old-primary font-bold text-[20px] sm:text-[25px] md:text-[27px] lg:text-[32px] text-center">
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
            isImportant={true}
            name="ssid_24ghz"
            value={formData.ssid_24ghz}
            onChange={(value: string) => {
              setFormData((prevData: any) => ({
                ...prevData,
                ssid_24ghz: value,
              }));
              setErrors((prev) => ({ ...prev, ssid_24ghz: "" }));
            }}
            placeholder="Masukkan SSID 2.4Ghz"
            error={errors.ssid_24ghz}
          />
          <p className="text-xs text-gray-500 mt-1">
            SSID (2-32 karakter) dapat berisi huruf, angka, spasi, dan simbol.
          </p>

          <div className="pt-2 relative">
            <DynamicForm
              label="Kata Sandi"
              type={showPassword2 ? "text" : "password"}
              labelClass="text-[#666] text-sm"
              isImportant={true}
              name="password_24ghz"
              value={formData.password_24ghz}
              onChange={(value: string) => {
                const noSpacesValue = value.replace(/\s/g, "");
                setFormData((prevData: any) => ({
                  ...prevData,
                  password_24ghz: noSpacesValue,
                }));
                setErrors((prev) => ({ ...prev, password_24ghz: "" }));
              }}
              placeholder="Masukkan kata sandi 2.4Ghz "
              error={errors.password_24ghz}
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute right-3 top-[53px] text-gray-500 hover:text-gray-700"
            >
              {showPassword2 ? (
                <Image
                  src={eye}
                  className="w-6 h-6 cursor-pointer"
                  alt="showPassword"
                />
              ) : (
                <Image
                  src={eyeClose}
                  className="w-6 h-6 cursor-pointer"
                  alt="hidePassword"
                />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password (8-63 karakter) dapat berisi huruf, angka, dan simbol.
          </p>

          <label htmlFor="ssid_24ghz" className="font-medium py-2 block mt-6">
            Setting SSID 5 Ghz
          </label>

          <DynamicForm
            label="SSID"
            labelClass="text-[#666] text-sm"
            isImportant={true}
            name="ssid_5ghz"
            value={formData.ssid_5ghz}
            onChange={(value: string) => {
              setFormData((prevData: any) => ({
                ...prevData,
                ssid_5ghz: value,
              }));
              setErrors((prev) => ({ ...prev, ssid_5ghz: "" }));
            }}
            placeholder="Masukkan SSID 5Ghz"
            error={errors.ssid_5ghz}
          />
          <p className="text-xs text-gray-500 mt-1">
            SSID (2-32 karakter) dapat berisi huruf, angka, spasi, dan simbol.
          </p>

          <div className="pt-2 relative">
            <DynamicForm
              label="Kata Sandi"
              labelClass="text-[#666] text-sm"
              type={showPassword5 ? "text" : "password"}
              isImportant={true}
              name="password_5ghz"
              value={formData.password_5ghz}
              onChange={(value: string) => {
                const noSpacesValue = value.replace(/\s/g, "");

                setFormData((prevData: any) => ({
                  ...prevData,
                  password_5ghz: noSpacesValue,
                }));
                setErrors((prev) => ({ ...prev, password_5ghz: "" }));

                // if (value) {
                //   addUrlParam("password_5", value);
                // } else {
                //   resetUrlParam("password_5");
                // }
              }}
              placeholder="Masukkan kata sandi 5Ghz"
              error={errors.password_5ghz}
            />
            <button
              type="button"
              onClick={() => setShowPassword5(!showPassword5)}
              className="absolute right-3 top-[53px] text-gray-500 hover:text-gray-700"
            >
              {showPassword5 ? (
                <Image
                  src={eye}
                  className="w-6 h-6 cursor-pointer"
                  alt="showPassword"
                />
              ) : (
                <Image
                  src={eyeClose}
                  className="w-6 h-6 cursor-pointer"
                  alt="hidePassword"
                />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password (8-63 karakter) dapat berisi huruf, angka, dan simbol.
          </p>

          <div className="mt-8">
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
                  ? "bg-primary/50"
                  : "cursor-pointer bg-primary hover:bg-dark-primary-2"
              }    shadow-[0_6px_45px_0_rgba(0,48,120,0.10)] text-white px-2 py-3 font-bold rounded-[12px]`}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>

            <div className="mx-auto flex justify-center pt-2">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Apakah Anda yakin ingin melewati pengaturan modem? Pengaturan modem akan menggunakan pengaturan default."
                    )
                  )
                    addUrlParam("section", "check_signal");
                }}
                type="button"
                className="w-full hover:brightness-[1.05] hover:bg-gray-200 cursor-pointer border border-primary text-primary shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]  px-2 py-3 font-bold rounded-[12px]"
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
