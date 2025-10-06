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
  getCheckCoverage,
  getCity,
  getDistrict,
  getPostalCode,
  getProvince,
  getSubDistrict,
} from "@/app/_api/Location/Location";
import { normalizeAddressForBackend } from "@/app/_shared/utils/address";
import toast from "react-hot-toast";
import { setCookie } from "cookies-next";
import { PHONE_REGEX, regexEmail } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";

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
  notes: string;
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
  notes: "",
  address_gmaps: undefined,
  lat: undefined,
  lng: undefined,
};

function Page() {
  const [formData, setFormData] = useState<FormType>(initialFormData);

  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const [provinceOptions, setProvinceOptions] = useState<ReactSelectType[]>([]);
  const [cityOptions, setCityOptions] = useState<ReactSelectType[]>([]);
  const [districtOptions, setDistrictOptions] = useState<ReactSelectType[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    ReactSelectType[]
  >([]);
  const [postalCodeOptions, setPostalCodeOptions] = useState<ReactSelectType[]>(
    []
  );
  const [isCovered, setIsCovered] = useState<boolean>(false);

  const [agreement, setAgreement] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isModalRegisterSuccess, setIsModalRegisterSuccess] =
    useState<boolean>(false);
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");

  const router = useRouter();

  // --- helpers kecil untuk normalisasi nama
  function norm(s?: string) {
    return (s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s.-]/g, "") // buang aksen/simbol
      .replace(/\s+/g, " ")
      .trim();
  }

  // hapus awalan umum di Indonesia
  function stripPrefix(s: string) {
    let x = s;
    x = x.replace(/^kota\s+/i, "");
    x = x.replace(/^kabupaten\s+/i, "");
    x = x.replace(/^kab\.\s+/i, "");
    x = x.replace(/^kec(?:amatan)?\s+/i, "");
    x = x.replace(/^kel(?:urahan)?\s+/i, "");
    x = x.replace(/^desa\s+/i, "");
    return x.trim();
  }

  // ambil komponen tertentu dari address_components
  function componentByType(components: any[], type: string) {
    return components.find((c: any) => c.types?.includes(type));
  }

  // ekstrak nama admin dari raw_result Google
  function extractIndoAdmin(raw: any) {
    const comps = raw?.address_components || [];

    const prov =
      componentByType(comps, "administrative_area_level_1")?.long_name || "";
    const city =
      componentByType(comps, "administrative_area_level_2")?.long_name ||
      componentByType(comps, "locality")?.long_name ||
      "";
    const district =
      componentByType(comps, "administrative_area_level_3")?.long_name ||
      componentByType(comps, "sublocality_level_1")?.long_name ||
      "";
    const subdistrict =
      componentByType(comps, "administrative_area_level_4")?.long_name ||
      componentByType(comps, "sublocality_level_2")?.long_name ||
      componentByType(comps, "neighborhood")?.long_name ||
      "";

    return {
      provinceName: prov,
      cityName: city,
      districtName: district,
      subDistrictName: subdistrict,
      // postalCode: postal,
    };
  }

  async function resolveAndFillLocationFromGmaps(rawPlace: any) {
    setIsAutoFilling(true); // ⬅️ aktifkan guard

    const {
      provinceName,
      cityName,
      districtName,
      subDistrictName,
      // postalCode,
    } = extractIndoAdmin(rawPlace);

    console.log("Google extracted:", {
      provinceName,
      cityName,
      districtName,
      subDistrictName,
      // postalCode,
    });

    if (!provinceName) {
      setIsAutoFilling(false);
      return;
    }

    // 1) Province
    let provinceId = "";
    try {
      const resProv = await getProvince();
      const listProv = resProv.data.data as Array<{ id: string; name: string }>;

      const targetProv = listProv.find((p) => {
        const a = norm(stripPrefix(p.name));
        const b = norm(stripPrefix(provinceName));
        return a === b || a.includes(b) || b.includes(a);
      });

      if (!targetProv) {
        setIsAutoFilling(false);
        return;
      }
      provinceId = String(targetProv.id);

      setProvinceOptions(
        listProv.map((it) => ({ label: it.name, value: String(it.id) }))
      );
      setFormData((prev) => ({ ...prev, province: provinceId }));
      setErrors((e) => ({ ...e, province: "" }));
    } catch (e) {
      console.error("resolve province failed", e);
      setIsAutoFilling(false);
      return;
    }

    // 2) City
    let cityId = "";
    try {
      const resCity = await getCity({ province_id: provinceId });
      const listCity = resCity.data.data as Array<{ id: string; name: string }>;

      const targetCity = listCity.find((c) => {
        const a = norm(stripPrefix(c.name));
        const b = norm(stripPrefix(cityName || provinceName)); // fallback kalau city kosong
        return a === b || a.includes(b) || b.includes(a);
      });

      if (!targetCity) {
        setIsAutoFilling(false);
        return;
      }
      cityId = String(targetCity.id);

      setCityOptions(
        listCity.map((it) => ({ label: it.name, value: String(it.id) }))
      );
      setFormData((prev) => ({ ...prev, city: cityId }));
      setErrors((e) => ({ ...e, city: "" }));
    } catch (e) {
      console.error("resolve city failed", e);
      setIsAutoFilling(false);
      return;
    }

    // 3) District
    let districtId = "";
    try {
      const resDistrict = await getDistrict({ city_id: cityId });
      const listDistrict = resDistrict.data.data as Array<{
        id: string;
        name: string;
      }>;

      const targetDistrict = listDistrict.find((d) => {
        const a = norm(stripPrefix(d.name));
        const raw = districtName || "";
        const b = norm(stripPrefix(raw));
        return a === b || a.includes(b) || b.includes(a);
      });

      if (!targetDistrict) {
        setIsAutoFilling(false);
        return;
      }
      districtId = String(targetDistrict.id);

      setDistrictOptions(
        listDistrict.map((it) => ({ label: it.name, value: String(it.id) }))
      );
      setFormData((prev) => ({ ...prev, district: districtId }));
      setErrors((e) => ({ ...e, district: "" }));
    } catch (e) {
      console.error("resolve district failed", e);
      setIsAutoFilling(false);
      return;
    }

    // 4) Subdistrict
    try {
      const resSub = await getSubDistrict({ district_id: districtId });
      const listSub = resSub.data.data as Array<{ id: string; name: string }>;

      const targetSub = listSub.find((s) => {
        const a = norm(stripPrefix(s.name));
        const raw = subDistrictName || "";
        const b = norm(stripPrefix(raw));
        return a === b || a.includes(b) || b.includes(a);
      });

      if (!targetSub) {
        setIsAutoFilling(false);
        return;
      }

      setSubdistrictOptions(
        listSub.map((it) => ({ label: it.name, value: String(it.id) }))
      );

      const subId = String(targetSub.id);
      setFormData((prev) => ({
        ...prev,
        sub_district: subId,
      }));
      setErrors((e) => ({ ...e, sub_district: "" }));

      // 5) Postal Code (berdasarkan sub_district_id)
      // try {
      //   const resPostal = await getPostalCode({ sub_district_id: subId });
      //   const listPostal = resPostal.data.data as Array<{
      //     id: string;
      //     name?: string; // backend kamu pakai "name" untuk kode pos
      //     code?: string;
      //   }>;

      //   const postalOptions: ReactSelectType[] = (listPostal || [])
      //     .map((p) => {
      //       const codeStr = String(p.code ?? p.name ?? "");
      //       return codeStr ? { label: codeStr, value: String(p.id) } : null;
      //     })
      //     .filter(Boolean) as ReactSelectType[];

      //   setPostalCodeOptions(postalOptions);

      //   let defaultPostalId = postalOptions[0]?.value ?? "";

      //   if (postalCode) {
      //     const matched = postalOptions.find((opt) => opt.label === postalCode);
      //     if (matched) defaultPostalId = matched.value;
      //   }

      //   setFormData((prev) => ({
      //     ...prev,
      //     postal_code: String(defaultPostalId),
      //   }));

      //   setErrors((e) => ({ ...e, postal_code: "" }));
      // } catch (e) {
      //   console.error("resolve postal code failed", e);
      // }
    } catch (e) {
      console.error("resolve sub-district failed", e);
      setIsAutoFilling(false);
      return;
    }

    setIsAutoFilling(false);
  }

  useEffect(() => {
    try {
      const resCoverage = getCheckCoverage({});
      setIsCovered(resCoverage.result.inside_coverage);
    } catch (error) {}
  }, []);

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

  // Province -> load City options (NO reset)
  useEffect(() => {
    if (!formData.province) {
      setCityOptions([]);
      return;
    }
    (async () => {
      try {
        const res = await getCity({ province_id: formData.province });
        setCityOptions(
          res.data.data.map((it: any) => ({
            label: it.name,
            value: String(it.id),
          }))
        );
      } catch (e) {
        console.error("Gagal muat kota:", e);
        setCityOptions([]);
      }
    })();
  }, [formData.province]);

  // City -> load District options (NO reset)
  useEffect(() => {
    if (!formData.city) {
      setDistrictOptions([]);
      return;
    }
    (async () => {
      try {
        const res = await getDistrict({ city_id: formData.city });
        setDistrictOptions(
          res.data.data.map((it: any) => ({
            label: it.name,
            value: String(it.id),
          }))
        );
      } catch (e) {
        console.error("Gagal muat kecamatan:", e);
        setDistrictOptions([]);
      }
    })();
  }, [formData.city]);

  // District -> load Subdistrict options (NO reset)
  useEffect(() => {
    if (!formData.district) {
      setSubdistrictOptions([]);
      return;
    }
    (async () => {
      try {
        const res = await getSubDistrict({ district_id: formData.district });
        setSubdistrictOptions(
          res.data.data.map((it: any) => ({
            label: it.name,
            value: String(it.id),
          }))
        );
      } catch (e) {
        console.error("Gagal muat kelurahan:", e);
        setSubdistrictOptions([]);
      }
    })();
  }, [formData.district]);

  // Subdistrict -> load Postal Code options (NO reset)
  useEffect(() => {
    if (!formData.sub_district) {
      setPostalCodeOptions([]);
      return;
    }
    (async () => {
      try {
        const res = await getPostalCode({
          sub_district_id: formData.sub_district,
        });
        const options: ReactSelectType[] = (res.data.data || [])
          .map((item: any) => {
            const codeStr = String(item.code ?? item.name ?? "");
            const idStr = String(item.id);
            return codeStr && idStr ? { label: codeStr, value: idStr } : null;
          })
          .filter(Boolean) as ReactSelectType[];
        setPostalCodeOptions(options);
      } catch (e) {
        console.error("Gagal muat kode pos:", e);
        setPostalCodeOptions([]);
      }
    })();
  }, [formData.sub_district]);

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
      const payload = { phone_number: formData.phone, otp: val, type: null };
      const res = await verifyOtp(payload);

      if (res?.data?.statusCode === 200) {
        toast.success(res.data.message ?? "OTP terverifikasi ✔");
        setOtpStatus("valid");
      }

      setErrors((e) => ({ ...e, otp: "" }));
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

    const errors: { [key: string]: string } = {};

    if (!formData.fullname) {
      errors.fullname = "Nama Lengkap harus diisi";
    }

    if (!formData.phone) {
      errors.phone = "No handphone harus diisi";
    } else if (!PHONE_REGEX.test(formData.phone)) {
      errors.phone = "Nomor handphone tidak valid.";
    }

    if (formData.email && !regexEmail.test(formData.email)) {
      errors.email = "Format email salah";
    }

    if (formData.otp.length !== 6) {
      errors.otp = "Kode OTP harus 6 digit";
    }

    // if (!formData.nik) {
    //   errors.nik = "NIK harus diisi";
    // } else if (!/^\d{16}$/.test(formData.nik)) {
    //   errors.nik = "NIK harus 16 digit angka";
    // }

    // if (!formData.nokk) {
    //   errors.nokk = "No KK harus diisi";
    // } else if (!/^\d{16}$/.test(formData.nokk)) {
    //   errors.nokk = "No KK harus 16 digit angka";
    // }

    if (!formData.province) {
      errors.province = "Provinsi harus diisi";
    }

    if (!formData.city) {
      errors.city = "Kota harus diisi";
    }

    if (!formData.district) {
      errors.district = "Kecamatan harus diisi";
    }

    if (!formData.sub_district) {
      errors.sub_district = "Kelurahan harus diisi";
    }

    if (!formData.postal_code) {
      errors.postal_code = "Kode Pos harus diisi";
    }

    if (!formData.full_address) {
      errors.full_address = "Alamat Lengkap harus diisi";
    }

    if (otpStatus !== "valid") {
      errors.otp = "OTP belum terverifikasi";
    }

    if (!agreement) {
      toast.error("Anda harus menyetujui syarat & ketentuan");
      setIsLoading(false);
      return;
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
          phone_number: formData.phone ?? "",
          name: formData.fullname ?? "",
          ...(formData.email && { email: formData.email }), // kirim jika hanya terisi
          // nik: formData.nik ?? "",
          // no_kk: formData.nokk ?? "",
          province_id: formData.province ?? "",
          city_id: formData.city ?? "",
          district_id: formData.district ?? "",
          sub_district_id: formData.sub_district ?? "",
          // postal_code_id: formData.postal_code ?? "",
          postal_code: formData.postal_code ?? "",
          address: addressArray ?? "",
          notes: formData.notes ?? "",
        };

        const res = await registerUser(body);
        const token = res.data.data;
        setCookie("token", token);
        setIsModalRegisterSuccess(true);
        resetForm();
        setOtpStatus("idle");

        setTimeout(() => {
          router.push("/customer-area");
        }, 3000);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal melakukan registrasi"
        );
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  function resetForm() {
    setFormData(initialFormData);
    setErrors({});
    setAgreement(false);
    setIsLoading(false);
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
                const filtered = value.replace(/[^a-zA-Z\s.\-]/g, "");
                setFormData((prev) => ({ ...prev, fullname: filtered }));
                setErrors({ ...errors, fullname: "" });
              }}
              placeholder="Masukkan Nama Lengkap"
              error={errors.fullname}
            />
          </div>

          {/* Email */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="Email (opsional)"
              isImportant={false}
              name="email"
              value={formData.email}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  email: value,
                }));
                setErrors({ ...errors, email: "" });
              }}
              placeholder="contoh: nama@mail.com"
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
              mode="register"
              inputMode="numeric"
              isImportant
              value={formData.phone}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  phone: value,
                }));

                setErrors({ ...errors, phone: "" });
              }}
              placeholder="contoh: 08123456789"
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
              isDisabled={otpStatus === "valid"}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, otp: val }));
                if (errors.otp) setErrors((e) => ({ ...e, otp: "" }));
                if (otpStatus !== "idle") setOtpStatus("idle");
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

            {otpStatus === "valid" && (
              <p className="text-green-600 mt-1 text-sm flex items-center gap-1">
                <FaCircleCheck className="text-green-600" />
                OTP berhasil diverifikasi! Anda bisa melanjutkan registrasi.
              </p>
            )}

            {otpStatus === "invalid" && !errors.otp && (
              <p className="text-red-500 mt-1 text-sm flex items-center gap-1">
                <FaCircleExclamation className="text-red-500" />
                Kode OTP tidak valid atau sudah kedaluwarsa.
              </p>
            )}

            {errors.otp && (
              <p className="text-red-500 mt-1 text-sm flex items-center gap-1">
                <FaCircleExclamation className="text-red-500" />
                {errors.otp}
              </p>
            )}
          </div>

          {/* NIK */}
          {/* <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="NIK"
              isImportant={false}
              name="nik"
              value={formData.nik}
              onChange={(value: string) => {
                const digits = value.replace(/\D/g, "").slice(0, 16);
                setFormData((prev) => ({ ...prev, nik: digits }));
                setErrors({ ...errors, nik: "" });
              }}
              placeholder="Masukkan NIK"
              error={errors.nik}
            />
          </div> */}

          {/* NOKK */}
          {/* <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="No KK"
              isImportant={false}
              name="nokk"
              value={formData.nokk}
              onChange={(value: string) => {
                const digits = value.replace(/\D/g, "").slice(0, 16);
                setFormData((prev) => ({ ...prev, nokk: digits }));
                setErrors({ ...errors, nokk: "" });
              }}
              placeholder="Masukkan No KK"
              error={errors.nokk}
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
              onPlaceChange={async (p) => {
                setFormData((prev) => ({
                  ...prev,
                  full_address: p.address,
                  address_gmaps: p.raw_result,
                  lat: String(p.latitude),
                  lng: String(p.longitude),
                  province: "",
                  city: "",
                  district: "",
                  sub_district: "",
                  postal_code: "",
                }));

                await resolveAndFillLocationFromGmaps(p.raw_result);
              }}
            />
            {isCovered ? (
              <p className="mt-1 text-green-primary flex items-center gap-1">
                <FaCircleCheck className="text-green-primary" />
                Selamat! Alamat Anda berada di dalam jangkauan kami.
              </p>
            ) : (
              <p className="mt-1 text-red-primary flex items-center gap-1">
                <FaCircleExclamation className="text-red-primary" />
                Lokasi Anda belum berada dijangkauan area kami, dan kami sedang
                menuju ke daerah Anda.
              </p>
            )}
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
              onChange={(value) => {
                if (value) {
                  setFormData((prev: any) => ({
                    ...prev,
                    province: value.value, // set province
                    city: "", // reset anak2 karena USER mengganti
                    district: "",
                    sub_district: "",
                    postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    province: "",
                    city: "",
                    district: "",
                    sub_district: "",
                    postal_code: "",
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
              onChange={(value) => {
                if (value) {
                  setFormData((prev: any) => ({
                    ...prev,
                    city: value.value,
                    district: "",
                    sub_district: "",
                    postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    city: "",
                    district: "",
                    sub_district: "",
                    postal_code: "",
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
              onChange={(value) => {
                if (value) {
                  setFormData((prev: any) => ({
                    ...prev,
                    district: value.value,
                    sub_district: "",
                    postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    district: "",
                    sub_district: "",
                    postal_code: "",
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
              onChange={(value) => {
                if (value) {
                  setFormData((prev: any) => ({
                    ...prev,
                    sub_district: value.value,
                    postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    sub_district: "",
                    postal_code: "",
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
          <div className="max-sm:col-span-2 col-span-1">
            {/* Versi dropdown */}
            {/* <DynamicSelectForm
              menuPosition="fixed"
              label="Kode Pos"
              name="postal_code"
              isImportant
              isDisabled={!formData.sub_district}
              options={postalCodeOptions}
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
            /> */}

            {/* Versi input number */}
            <DynamicForm
              label="Kode Pos"
              isImportant
              name="postal_code"
              value={formData.postal_code}
              onChange={(value: string) => {
                if (/^\d{0,5}$/.test(value)) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    postal_code: value,
                  }));
                  setErrors({ ...errors, postal_code: "" });
                }
              }}
              placeholder="Masukkan Kode Pos"
              error={errors.postal_code}
            />
          </div>

          {/* Patokan Alamat */}
          <div className="max-sm:col-span-2 col-span-1">
            <DynamicForm
              label="Patokan Alamat (opsional)"
              isImportant={false}
              name="notes"
              value={formData.notes}
              onChange={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  notes: value,
                }));
              }}
              // isClearable
              placeholder="Masukkan Patokan Alamat (jika ada)"
              error={errors.notes}
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
              placeholder={
                formData.address_gmaps
                  ? "Masukkan/rapikan Alamat Lengkap"
                  : "Pilih alamat dari pencarian peta untuk mengaktifkan"
              }
              error={errors.full_address}
              disabled={!formData.address_gmaps}
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
            disabled={isLoading || !agreement}
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
