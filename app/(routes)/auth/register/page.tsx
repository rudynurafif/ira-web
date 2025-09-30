"use client";
import CheckboxAgreeForm from "@/app/_components/form/CheckboxAgreeForm";
import DynamicForm from "@/app/_components/form/DynamicForm";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import DynamicSelectForm from "@/app/_components/form/DynamicSelectForm";
import MapInputForm from "@/app/_components/form/MapInputForm";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { ReactSelectType } from "@/app/_shared/types/form";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import ModalRegister from "./_components/ModalRegister";
import { registerUser, verifyOtp } from "@/app/_api/Auth/Auth";
import {
  getCity,
  getDistrict,
  getProvince,
  getSubDistrict,
} from "@/app/_api/Location/Location";
import { normalizeAddressForBackend } from "@/app/_shared/utils/address";
import toast from "react-hot-toast";
import { setCookie } from "cookies-next";

interface FormType {
  fullname: string;
  email: string;
  phone: string;
  otp: string;
  nik: string;
  nokk: string;
  province: string;
  city: string;
  district: string;
  sub_district: string;
  postal_code: string;
  address_note: string;
  full_address: string;
  address_gmaps?: any;
  lat?: string;
  lng?: string;
}

const initialFormData: FormType = {
  fullname: "",
  email: "",
  phone: "",
  otp: "",
  nik: "",
  nokk: "",
  province: "",
  city: "",
  district: "",
  sub_district: "",
  postal_code: "",
  full_address: "",
  address_note: "",
  address_gmaps: undefined,
  lat: undefined,
  lng: undefined,
};

function Page() {
  const [formData, setFormData] = useState<FormType>(initialFormData);
  const [formKey, setFormKey] = useState(0);

  const [provinceOptions, setProvinceOptions] = useState<ReactSelectType[]>([]);
  const [cityOptions, setCityOptions] = useState<ReactSelectType[]>([]);
  const [districtOptions, setDistrictOptions] = useState<ReactSelectType[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    ReactSelectType[]
  >([]);

  const [agreement, setAgreement] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isModalRegisterSuccess, setIsModalRegisterSuccess] =
    useState<boolean>(false);
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");

  useEffect(() => {
    const loadProvince = async () => {
      try {
        const res = await getProvince();
        const options: ReactSelectType[] = res.data.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setProvinceOptions(options);
      } catch (error) {
        console.error("Gagal muat provinsi:", error);
      }
    };
    loadProvince();
  }, []);

  // Load City berdasarkan Province
  useEffect(() => {
    if (!formData.province) {
      setCityOptions([]);
      setFormData((prev) => ({
        ...prev,
        city: "",
        district: "",
        sub_district: "",
        postal_code: "",
      }));
      return;
    }

    const loadCity = async () => {
      try {
        const res = await getCity({ province_id: formData.province });
        const options: ReactSelectType[] = res.data.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setCityOptions(options);
        setFormData((prev) => ({
          ...prev,
          city: "",
          district: "",
          sub_district: "",
          postal_code: "",
        }));
        setDistrictOptions([]);
        setSubdistrictOptions([]);
      } catch (error) {
        console.error("Gagal muat kota:", error);
        setCityOptions([]);
      }
    };

    loadCity();
  }, [formData.province]);

  // Load District (Kecamatan) berdasarkan City
  useEffect(() => {
    if (!formData.city) {
      setDistrictOptions([]);
      setFormData((prev) => ({
        ...prev,
        district: "",
        sub_district: "",
        postal_code: "",
      }));
      return;
    }

    const loadDistrict = async () => {
      try {
        const res = await getDistrict({ city_id: formData.city });
        const options: ReactSelectType[] = res.data.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setDistrictOptions(options);
        setFormData((prev) => ({
          ...prev,
          district: "",
          sub_district: "",
          postal_code: "",
        }));
        // setSubdistrictOptions([]);
      } catch (error) {
        console.error("Gagal muat kecamatan:", error);
        setDistrictOptions([]);
      }
    };

    loadDistrict();
  }, [formData.city]);

  // Load SubDistrict (Kelurahan) berdasarkan District (Kecamatan)
  useEffect(() => {
    if (!formData.district) {
      setSubdistrictOptions([]);
      setFormData((prev) => ({ ...prev, sub_district: "", postal_code: "" }));
      return;
    }

    const loadSubDistrict = async () => {
      try {
        const res = await getSubDistrict({ district_id: formData.district });
        const options: ReactSelectType[] = res.data.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setSubdistrictOptions(options);
        setFormData((prev) => ({ ...prev, sub_district: "", postal_code: "" }));
      } catch (error) {
        console.error("Gagal muat kelurahan:", error);
        setSubdistrictOptions([]);
      }
    };

    loadSubDistrict();
  }, [formData.district]);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  async function handleVerifyOtp(val: string) {
    if (!formData.phone) {
      setErrors((e) => ({
        ...e,
        phone: "Isi nomor handphone terlebih dahulu",
      }));
      toast.error("Nomor handphone wajib diisi sebelum verifikasi OTP");
      return;
    }

    try {
      setOtpStatus("verifying");
      // payload register
      const payload = { phone_number: formData.phone, otp: val, type: null };
      const res = await verifyOtp(payload);

      // kalau backend punya flag/status, cek di sini
      // misal: if (res?.data?.statusCode === 200)
      toast.success(res.data.message);
      setOtpStatus("valid");
      setErrors((e) => ({ ...e, otp: "" }));
      toast.success("OTP terverifikasi ✔");
    } catch (err: any) {
      setOtpStatus("invalid");
      setErrors((e) => ({
        ...e,
        otp: "Kode OTP tidak valid atau sudah kedaluwarsa",
      }));
      toast.error(err?.response?.data?.message || "Verifikasi OTP gagal");
    }
  }

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);
    const regexPhone = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
    const regexEmail =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const errors: { [key: string]: string } = {};

    if (!formData.fullname) {
      errors.fullname = "Nama Lengkap harus diisi";
    }

    if (!formData.phone) {
      errors.phone = "No handphone harus diisi";
    } else if (!regexPhone.test(formData.phone)) {
      errors.phone = "Nomor handphone tidak valid.";
    }

    if (!formData.email) {
      errors.email = "Email harus diisi";
    } else if (!regexEmail.test(formData.email)) {
      errors.email = "Format email salah";
    }

    if (formData.otp.length !== 6) {
      errors.otp = "Kode OTP harus 6 digit";
    }

    if (!formData.nik) {
      errors.nik = "NIK harus diisi";
    }

    if (!formData.nokk) {
      errors.nokk = "No KK harus diisi";
    }

    if (!formData.province) {
      errors.province = "Provinsi harus diisi";
    }

    if (!formData.city) {
      errors.city = "Kota harus diisi";
    }

    if (!formData.district) {
      errors.sub_district = "Kecamatan harus diisi";
    }

    if (!formData.sub_district) {
      errors.sub_district = "Kelurahan harus diisi";
    }

    // if (!formData.postal_code) {
    //   errors.postal_code = "Kode Pos harus diisi";
    // }

    if (!formData.full_address) {
      errors.address = "Alamat Lengkap harus diisi";
    }

    if (otpStatus !== "valid") {
      errors.otp = "OTP belum terverifikasi";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      toast.error("Lengkapi data Anda terlebih dahulu");
      setIsLoading(false);
      return;
    } else {
      console.log("masuk");
      try {
        const addressArray = formData.address_gmaps
          ? [normalizeAddressForBackend(formData.address_gmaps)]
          : [];

        const body: any = {
          phone_number: formData.phone,
          name: formData.fullname,
          email: formData.email,
          province_id: formData.province,
          city_id: formData.city,
          district_id: formData.district,
          sub_district_id: formData.sub_district,
          nik: formData.nik,
          no_kk: formData.nokk,
          address: addressArray,
        };

        const res = await registerUser(body);
        const token = res.data.data;
        setCookie("token", token);
        setIsModalRegisterSuccess(true);
        resetForm();
        setOtpStatus("idle");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal melakukan registrasi"
        );
      } finally {
        setIsLoading(false);
      }
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setErrors({});
    setAgreement(false);
    setIsLoading(false);
    setFormKey((k) => k + 1);
    setOtpStatus("idle");

    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="container mx-auto px-5 my-22">
      <h1 className="text-center text-[32px] text-[#001D47] font-bold">
        Registrasi Starlite
      </h1>

      <form onSubmit={submitForm} className="mt-7">
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-7">
          {/* Nama */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="Nama Lengkap"
              isImportant
              name="fullname"
              value={formData.fullname}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  fullname: value,
                }));
                setErrors({ ...errors, fullname: "" });
              }}
              placeholder="Masukkan Nama Lengkap"
              error={errors.fullname}
            />
          </div>

          {/* Email */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="Email"
              isImportant
              name="email"
              value={formData.email}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  email: value,
                }));
                setErrors({ ...errors, email: "" });
              }}
              placeholder="Masukkan Email"
              error={errors.email}
            />
          </div>

          {/* Nomor Handphone */}
          <div className="max-sm:col-span-2 col-span-1">
            <PhoneOTPForm
              storageKey={`otp:register:phone`} // ✅ key unik per use-case
              otpDurationSec={60}
              label="Nomor Handphone"
              name="phone"
              isImportant
              value={formData.phone}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  phone: value,
                }));

                setErrors({ ...errors, phone: "" });
              }}
              placeholder="Masukkan Nomor Handphone"
              error={errors.phone}
            />
          </div>

          {/* OTP */}
          <div className="max-sm:col-span-2 col-span-1">
            <GroupedOTP
              isInvalid={!!errors.otp || otpStatus === "invalid"}
              label="Masukkan OTP yang dikirim via Whatsapp atau SMS"
              isImportant
              name="otp"
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, otp: val }));
                if (errors.otp) setErrors((e) => ({ ...e, otp: "" }));
                if (val.length === 6) handleVerifyOtp(val);
                else if (otpStatus !== "idle") setOtpStatus("idle");
              }}
              onComplete={(val) => {
                handleVerifyOtp(val);
              }}
            />
            {otpStatus === "verifying" && (
              <p className="text-primary mt-1 text-sm italic">
                Memverifikasi OTP...
              </p>
            )}
            {errors.otp && <p className="text-red-500 mt-1">{errors.otp}</p>}
          </div>

          {/* NIK */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="NIK"
              isImportant
              name="nik"
              value={formData.nik}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  nik: value,
                }));
                setErrors({ ...errors, nik: "" });
              }}
              placeholder="Masukkan NIK"
              error={errors.nik}
            />
          </div>

          {/* NOKK */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="No KK"
              isImportant
              name="nokk"
              value={formData.nokk}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  nokk: value,
                }));
                setErrors({ ...errors, nokk: "" });
              }}
              placeholder="Masukkan No KK"
              error={errors.nokk}
            />
          </div>

          {/* Provinsi */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              menuPosition="fixed"
              label="Provinsi"
              name="province"
              isImportant
              autocomplete="off"
              options={provinceOptions}
              value={formData.province}
              onChange={(value: ReactSelectType | null) => {
                if (value) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    province: value.value,
                  }));
                } else {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    province: "",
                  }));
                }
                setErrors({ ...errors, province: "" });
              }}
              isClearable
              placeholder="Pilih Provinsi"
              error={errors.province}
            />
          </div>

          {/* Kota */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              menuPosition="fixed"
              label="Kota/Kabupaten"
              name="city"
              isImportant
              isDisabled={!formData.province}
              options={cityOptions}
              value={formData.city}
              onChange={(value: ReactSelectType | null) => {
                if (value) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    city: value.value,
                  }));
                } else {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    city: "",
                  }));
                }
                setErrors({ ...errors, city: "" });
              }}
              isClearable
              placeholder="Pilih Kota/Kabupaten"
              error={errors.city}
            />
          </div>

          {/* Kecamatan */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              menuPosition="fixed"
              label="Kecamatan"
              name="district"
              isImportant
              isDisabled={!formData.city}
              options={districtOptions}
              value={formData.district}
              onChange={(value: ReactSelectType | null) => {
                if (value) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    district: value.value,
                  }));
                } else {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    district: "",
                  }));
                }
                setErrors({ ...errors, district: "" });
              }}
              isClearable
              placeholder="Pilih Kecamatan"
              error={errors.district}
            />
          </div>

          {/* Kelurahan */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              menuPosition="fixed"
              label="Kelurahan"
              name="sub_district"
              isImportant
              isDisabled={!formData.district}
              options={subdistrictOptions}
              value={formData.sub_district}
              onChange={(value: ReactSelectType | null) => {
                if (value) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    sub_district: value.value,
                  }));
                } else {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    sub_district: "",
                  }));
                }
                setErrors({ ...errors, sub_district: "" });
              }}
              isClearable
              placeholder="Pilih Kelurahan"
              error={errors.sub_district}
            />
          </div>

          {/* Kode Pos */}
          {/* <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              menuPosition="fixed"
              label="Kode Pos"
              name="postal_code"
              isImportant
              options={dummySelect}
              value={formData.postal_code}
              onChange={(value: ReactSelectType | null) => {
                if (value) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    postal_code: value.value,
                  }));
                } else {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    postal_code: "",
                  }));
                }
                setErrors({ ...errors, postal_code: "" });
              }}
              isClearable
              placeholder="Pilih Kode Pos"
              error={errors.postal_code}
            />
          </div> */}

          {/* Patokan Alamat */}
          {/* <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="Patokan Alamat (Opsional)"
              isImportant={false}
              name="address_note"
              value={formData.address_note}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  address_note: value,
                }));
              }}
              // isClearable
              placeholder="Masukkan Patokan Alamat (jika ada)"
              error={errors.address_note}
            />
          </div> */}

          {/* Map */}
          <div className="col-span-2">
            <MapInputForm
              getAddress={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  full_address: value,
                }));
                setErrors({ ...errors, full_address: "" });
              }}
              onPlaceChange={(p) => {
                setFormData((prev) => ({
                  ...prev,
                  full_address: p.address,
                  address_gmaps: p.raw_result,
                  lat: String(p.latitude),
                  lng: String(p.longitude),
                }));
              }}
            />
          </div>

          {/* Alamat Lengkap */}
          <div className="col-span-2">
            <DynamicForm
              label="Alamat Lengkap"
              type="textarea"
              isImportant
              rows={4}
              name="full_address"
              value={formData.full_address}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  full_address: value,
                }));
                setErrors({ ...errors, full_address: "" });
              }}
              // isClearable
              placeholder="Masukkan Alamat Lengkap"
              error={errors.full_address}
            />
          </div>
        </div>

        {/* Agreement */}
        <div className="mt-7">
          <CheckboxAgreeForm
            value={agreement}
            onChange={() => setAgreement(!agreement)}
          />
        </div>

        <div className="mt-7 flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !agreement || otpStatus !== "valid"}
            className={`py-[15px] w-1/2 font-bold text-white ${
              isLoading || !agreement
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-primary cursor-pointer"
            } text-xl rounded-xl mx-auto `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading w-[20px] h-[20px]"></div>
                <span className="italic text-white">Loading...</span>
              </div>
            ) : (
              "Registrasi"
            )}
          </button>
        </div>

        <div className="mt-7 text-center">
          <p className="text-primary-text">
            Sudah punya akun Starlite?{" "}
            <span>
              <Link
                href="/auth/login"
                className="underline-animation-register text-dark-primary font-bold"
              >
                Login
              </Link>
            </span>
          </p>
        </div>
      </form>

      {isModalRegisterSuccess && (
        <ModalTemplate
          closeModal={() => setIsModalRegisterSuccess(false)}
          classNameModal="w-[90%] sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 px-5 py-10"
        >
          <ModalRegister />
        </ModalTemplate>
      )}
    </div>
  );
}

export default Page;
