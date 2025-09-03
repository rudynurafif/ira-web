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
import React, { FormEvent, useState } from "react";
import ModalRegister from "./_components/ModalRegister";

interface FormType {
  fullname: string;
  email: string;
  phone: string;
  otp: string;
  province: string;
  city: string;
  sub_district: string;
  village: string;
  postal_code: string;
  address_note: string;
  full_address: string;
  nik: string;
  nokk: string;
}

function Page() {
  const [formData, setFormData] = useState<FormType>({
    fullname: "",
    email: "",
    phone: "",
    otp: "",
    province: "",
    city: "",
    sub_district: "",
    village: "",
    postal_code: "",
    address_note: "",
    full_address: "",
    nik: "",
    nokk: "",
  });

  const [agreement, setAgreement] = useState<boolean>(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isLoading, setIsLoading] = useState<boolean>();

  const [isModalRegisterSuccess, setIsModalRegisterSuccess] =
    useState<boolean>(false);

  const dummySelect: ReactSelectType[] = [
    {
      label: "Dummy 1",
      value: "dummy1",
    },
    {
      label: "Dummy 2",
      value: "dummy2",
    },
    {
      label: "Dummy 3",
      value: "dummy3",
    },
    {
      label: "Dummy 4",
      value: "dummy4",
    },
    {
      label: "Dummy 5",
      value: "dummy5",
    },
  ];

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);
    const regexPhone = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
    const regexEmail =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const errors: { [key: string]: string } = {};

    if (!formData.fullname) {
      errors.full_name = "Nama Lengkap harus diisi";
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

    if (!formData.sub_district) {
      errors.sub_district = "Kecamatan harus diisi";
    }

    if (!formData.village) {
      errors.village = "Kelurahan harus diisi";
    }

    if (!formData.postal_code) {
      errors.postal_code = "Kode Pos harus diisi";
    }

    if (!formData.full_address) {
      errors.full_address = "Alamat Lengkap harus diisi";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);

      setIsLoading(false);

      return;
    } else {
      setErrors({});
    }
  }

  return (
    <div className="container mx-auto px-5 my-22">
      <h1 className="text-center text-[32px] text-[#001D47] font-bold">
        Registrasi Starlite
      </h1>

      <form onSubmit={submitForm} className="mt-7">
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-7">
          {/* nama */}
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
                setErrors({ ...errors, full_name: "" });
              }}
              placeholder="Masukkan Nama Lengkap"
              error={errors.full_name}
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
              isInvalid={!!errors.otp}
              label="Masukkan OTP yang dikirim via Whatsapp"
              isImportant
              name="otp"
              onChange={(val) => {
                // console.log(val);
                if (val.length === 6) {
                  setErrors({ ...errors, otp: "" });
                }

                setFormData((prevData: any) => ({
                  ...prevData,
                  otp: val,
                }));
              }}
            />

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
              options={dummySelect}
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
              options={dummySelect}
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
              name="sub_district"
              isImportant
              options={dummySelect}
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
              placeholder="Pilih Kecamatan"
              error={errors.sub_district}
            />
          </div>
          {/* Kelurahan */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              menuPosition="fixed"
              label="Kelurahan"
              name="village"
              isImportant
              options={dummySelect}
              value={formData.village}
              onChange={(value: ReactSelectType | null) => {
                if (value) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    village: value.value,
                  }));
                } else {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    village: "",
                  }));
                }
                setErrors({ ...errors, village: "" });
              }}
              isClearable
              placeholder="Pilih Kelurahan"
              error={errors.village}
            />
          </div>
          {/* Kode Pos */}
          <div className="max-sm:col-span-2 col-span-1">
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
          </div>
          {/* Patokan Alamat */}
          <div className="max-sm:col-span-2 col-span-1">
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
              placeholder="Masukkan Patokan Alamat"
              error={errors.address_note}
            />
          </div>
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
            />
          </div>
          {/* Alamat Lengkap */}
          <div className="col-span-2">
            <DynamicForm
              label="Alamat Lengkap"
              type="textarea"
              isImportant
              rows={4}
              name="address"
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
        <div className="mt-7">
          <CheckboxAgreeForm
            value={agreement}
            onChange={() => setAgreement(!agreement)}
          />
        </div>
        <div className="mt-7 flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !agreement}
            className={`py-[15px] w-1/2 font-bold text-white ${
              isLoading || !agreement ? "bg-slate-400 cursor-not-allowed" : "bg-primary cursor-pointer"
            } text-xl rounded-xl mx-auto `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading w-[20px] h-[20px]"></div>
                <span className="italic text-primary">Loading...</span>
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
