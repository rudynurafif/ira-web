import DynamicForm from "@/app/_components/form/DynamicForm";
import { addUrlParam, decodeJwt, resetUrlParam } from "@/app/_shared/utils";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import eyeClose from "@/public/assets/Icons/eye-close.png";
import eye from "@/public/assets/Icons/eye.png";
import { getDetailCPE, setSSID } from "@/app/_api/CoreNetwork/CoreNetwork";
import {
  CpeSimBinding,
  SetSSIDBody,
  SSEPayload,
} from "@/app/_shared/types/CoreNetwork";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import toast from "react-hot-toast";
import { getCookie } from "cookies-next";
import { DecodedToken } from "@/app/_context/sse.type";
import Loader from "@/app/_components/Loader";
import { useSSEOneTime } from "@/app/hooks/useSSEOneTime";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
  const [isLoadingCPE, setIsLoadingCPE] = useState(true);
  const [isWaitingForSetWifi, setIsWaitingForSetWifi] = useState(false);

  const sn = params.get("serial_number")
    ? params.get("serial_number")
    : typeof window !== "undefined"
      ? localStorage.getItem("ira-cpe-serial-number")
      : null;

  const token = getCookie("token-ira");
  const decodedToken = useMemo(() => {
    if (!token) return null;
    return decodeJwt(token as string) as DecodedToken | null;
  }, [token]);
  const customer_id = decodedToken?.customer_id;

  const hasNullWifiConfig = (cpe: CpeSimBinding | null): boolean => {
    if (!cpe?.cpe_id) return true;
    const { ssid, ssid5, password, password5 } = cpe.cpe_id;
    return (
      ssid === null && ssid5 === null && password === null && password5 === null
    );
  };

  useEffect(() => {
    if (isSubmitting || isWaitingForSetWifi) {
      // Pasang event handler
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ""; // Diperlukan untuk beberapa browser
        return ""; // Meski diabaikan, tetap diperlukan
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isSubmitting, isWaitingForSetWifi]);

  // 🔥 1. Dengarkan SSE untuk `get_wifi` jika API null
  useSSEOneTime(
    customer_id || "",
    (payload: SSEPayload) => {
      // Simulasikan struktur CpeSimBinding dari payload SSE
      const fakeCpeDetail: CpeSimBinding = {
        cpe_id: {
          ssid: payload.data?.ssid ?? "",
          password: payload.data?.password ?? "",
          ssid5: payload.data?.ssid5 ?? "",
          password5: payload.data?.password5 ?? "",
        },
      };
      setCpeDetail(fakeCpeDetail);
      setIsLoadingCPE(false);
    },
    isLoadingCPE && hasNullWifiConfig(cpeDetail), // hanya dengarkan jika belum dapat data
    (payload: SSEPayload) => payload.type === "get_wifi" && payload.sn === sn // filter event
  );

  // 🔥 2. Dengarkan SSE untuk `set wifi` setelah submit
  useSSEOneTime(
    customer_id || "",
    (payload: SSEPayload) => {
      const { message } = payload;

      setIsWaitingForSetWifi(false);

      if (message === "Success") {
        toast.success("SSID berhasil diperbarui!");
        addUrlParam("section", "check_signal");
      } else {
        toast.error(message || "Gagal memperbarui SSID. Silakan coba lagi.");
      }
    },
    isWaitingForSetWifi,
    (payload: SSEPayload) => payload.type === "set_wifi" && payload.sn === sn
  );

  useEffect(() => {
    const fetchCPE = async () => {
      try {
        const res = await getDetailCPE();
        const data = res?.data?.data;
        if (data) {
          setCpeDetail(data);
        }
        // Tetap lanjut ke SSE jika data kosong
      } catch (err: any) {
        toastErrorFromAPI(err);
      } finally {
        setIsLoadingCPE(false);
      }
    };

    fetchCPE();
  }, []);

  // Cegah back navigation & redirect ke /customer-area jika dipaksa
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Dorong kembali ke halaman ini agar tidak benar-benar keluar
      window.history.pushState(null, "", window.location.href);

      // Tampilkan konfirmasi
      const confirmed = window.confirm(
        "Anda sedang mengatur modem.\nJika Anda meninggalkan halaman ini, perubahan belum tersimpan akan hilang.\n\nYakin ingin kembali?"
      );

      if (confirmed) {
        // Redirect ke /customer-area
        window.location.href = "/customer-area";
      }
      // Jika tidak dikonfirmasi, user tetap di halaman (karena pushState di atas)
    };

    // Push state saat komponen mount
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // useEffect(() => {
  //   if (!cpeDetail?.cpe_id || Object.keys(wifiConfig).length > 0) return;

  //   setFormData((prev) => ({
  //     ...prev,
  //     ssid_24ghz: cpeDetail.cpe_id.ssid ?? "",
  //     password_24ghz: cpeDetail.cpe_id.password ?? "",
  //     ssid_5ghz: cpeDetail.cpe_id.ssid5 ?? "",
  //     password_5ghz: cpeDetail.cpe_id.password5 ?? "",
  //   }));
  // }, [cpeDetail, wifiConfig]);

  // useEffect(() => {
  //   if (!wifiConfig) return;

  //   setFormData((prev) => ({
  //     ...prev,
  //     ssid_24ghz: wifiConfig.ssid ?? prev.ssid_24ghz,
  //     password_24ghz: wifiConfig.password ?? prev.password_24ghz,
  //     ssid_5ghz: wifiConfig.ssid5 ?? prev.ssid_5ghz,
  //     password_5ghz: wifiConfig.password5 ?? prev.password_5ghz,
  //   }));
  // }, [wifiConfig]);

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    setIsSubmitting(true);

    const ssid24 = formData.ssid_24ghz.trim();
    if (!ssid24) {
      errors.ssid_24ghz = "SSID 2.4GHz tidak boleh kosong";
    } else if (ssid24.length < 5 || ssid24.length > 32) {
      errors.ssid_24ghz = "SSID harus 5–32 karakter";
    }

    if (!formData.password_24ghz.trim()) {
      errors.password_24ghz = "Password 2.4GHz tidak boleh kosong";
    } else if (
      formData.password_24ghz.length < 8 ||
      formData.password_24ghz.length > 63
    ) {
      errors.password_24ghz = "Password harus 8–63 karakter";
    }

    const ssid5 = formData.ssid_5ghz.trim();
    if (!ssid5) {
      errors.ssid_5ghz = "SSID 5GHz tidak boleh kosong";
    } else if (ssid5.length < 5 || ssid5.length > 32) {
      errors.ssid_5ghz = "SSID harus 5–32 karakter";
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
    }

    if (!sn) {
      toast.error("Serial number CPE tidak ditemukan");
      return;
    }

    try {
      const body: SetSSIDBody = {
        sn,
        ssid: formData.ssid_24ghz,
        password: formData.password_24ghz,
        ssid5: formData.ssid_5ghz,
        password5: formData.password_5ghz,
      };

      const setSSIDRes = await setSSID(body);

      if (
        setSSIDRes.data.statusCode === 201 ||
        setSSIDRes.data.statusCode === 200
      ) {
        toast.success(
          setSSIDRes.data.message ??
            "Permintaan pengaturan SSID dikirim. Menunggu konfirmasi..."
        );
        setIsWaitingForSetWifi(true);
      } else {
        throw new Error(setSSIDRes?.data?.message || "Gagal menyimpan SSID");
      }

      // lanjut ke step berikutnya
      // addUrlParam("section", "check_signal");
    } catch (err: any) {
      setIsWaitingForSetWifi(false);
      toastErrorFromAPI(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!cpeDetail?.cpe_id) return;

    setFormData({
      ssid_24ghz: (cpeDetail.cpe_id.ssid ?? "").trim(),
      password_24ghz: (cpeDetail.cpe_id.password ?? "").replace(/\s/g, ""),
      ssid_5ghz: (cpeDetail.cpe_id.ssid5 ?? "").trim(),
      password_5ghz: (cpeDetail.cpe_id.password5 ?? "").replace(/\s/g, ""),
    });

    setErrors({});
  }, [cpeDetail]);

  const isFormValid =
    formData.ssid_24ghz.trim().length >= 3 &&
    formData.ssid_24ghz.trim().length <= 32 &&
    formData.password_24ghz.length >= 8 &&
    formData.password_24ghz.length <= 63 &&
    formData.ssid_5ghz.trim().length >= 3 &&
    formData.ssid_5ghz.trim().length <= 32 &&
    formData.password_5ghz.length >= 8 &&
    formData.password_5ghz.length <= 63;
  // && Object.keys(errors).length === 0;

  if (isLoadingCPE) {
    return <Loader />;
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
            SSID (3-32 karakter) dapat berisi huruf, angka, spasi, dan simbol.
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
              className="absolute right-3 top-13.25 text-primary hover:text-dark-primary-2"
            >
              {showPassword2 ? (
                <IoEyeSharp className="w-6 h-6 cursor-pointer" />
              ) : (
                <FaEyeSlash className="w-6 h-6 cursor-pointer" />
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
            SSID (3-32 karakter) dapat berisi huruf, angka, spasi, dan simbol.
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
              }}
              placeholder="Masukkan kata sandi 5Ghz"
              error={errors.password_5ghz}
            />
            <button
              type="button"
              onClick={() => setShowPassword5(!showPassword5)}
              className="absolute right-3 top-13.25 text-primary hover:text-dark-primary-2"
            >
              {showPassword5 ? (
                <IoEyeSharp className="w-6 h-6 cursor-pointer" />
              ) : (
                <FaEyeSlash className="w-6 h-6 cursor-pointer" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password (8-63 karakter) dapat berisi huruf, angka, dan simbol.
          </p>

          <div className="mt-8">
            <button
              disabled={!isFormValid || isSubmitting || isWaitingForSetWifi}
              type="submit"
              className={`w-full ${
                !isFormValid || isSubmitting || isWaitingForSetWifi
                  ? "bg-primary/50 cursor-not-allowed"
                  : "cursor-pointer bg-primary hover:bg-dark-primary-2"
              } flex items-center gap-1 shadow-[0_6px_45px_0_rgba(0,48,120,0.10)] text-white px-2 py-3 font-bold rounded-xl`}
            >
              {isWaitingForSetWifi || isSubmitting}
              <AiOutlineLoading3Quarters
                className="animate-spin text-primary"
                size={18}
              />
              {isWaitingForSetWifi
                ? "Menunggu konfirmasi"
                : isSubmitting
                  ? "Menyimpan..."
                  : "Simpan"}
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
                className="w-full hover:brightness-[1.05] hover:bg-red-50 cursor-pointer border border-primary text-primary shadow-[0_6px_45px_0_rgba(0,48,120,0.10)]  px-2 py-3 font-bold rounded-xl"
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
