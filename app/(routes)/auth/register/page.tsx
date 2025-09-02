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

function Page() {
  const [formData, setFormData] = useState<any>({
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
              }}
              placeholder="Masukkan Email"
              error={errors.email}
            />
          </div>
          {/* Nomor Handphone */}
          <div className="max-sm:col-span-2 col-span-1">
            <PhoneOTPForm
              label="Nomor Handphone"
              name="phone"
              isImportant
              value={formData.phone}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  phone: value,
                }));
              }}
              placeholder="Masukkan Nomor Handphone"
              error={errors.phone}
            />
          </div>
          {/* OTP */}
          <div className="max-sm:col-span-2 col-span-1">
            <GroupedOTP
              label="Masukkan OTP yang dikirim via Whatsapp"
              isImportant
              name="otp"
            />
          </div>
          {/* Provinsi */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
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
              }}
              isClearable
              placeholder="Pilih Provinsi"
              error={errors.province}
            />
          </div>
          {/* Kota */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              label="Kota"
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
              }}
              isClearable
              placeholder="Pilih Kota"
              error={errors.city}
            />
          </div>
          {/* Kecamatan */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              label="Kecamatan"
              name="district"
              isImportant
              options={dummySelect}
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
              }}
              isClearable
              placeholder="Pilih Kecamatan"
              error={errors.district}
            />
          </div>
          {/* Kelurahan */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
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
              }}
              isClearable
              placeholder="Pilih Kelurahan"
              error={errors.village}
            />
          </div>
          {/* Kode Pos */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicSelectForm
              label="Kode Post"
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
              isClearable
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
                  address: value,
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
              name="address"
              value={formData.address}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  address: value,
                }));
              }}
              isClearable
              placeholder="Masukkan Alamat Lengkap"
              error={errors.address}
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
              isLoading || !agreement ? "bg-slate-300" : "bg-primary"
            } text-xl rounded-xl mx-auto cursor-pointer`}
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
