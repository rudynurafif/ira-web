"use client";
import CheckboxAgreeForm from "@/app/_components/form/CheckboxAgreeForm";
import DynamicForm from "@/app/_components/form/DynamicForm";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import DynamicSelectForm from "@/app/_components/form/DynamicSelectForm";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { ReactSelectType } from "@/app/_shared/types/form";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { registerUser, requestCoverage, verifyOtp } from "@/app/_api/Auth/Auth";
import {
  getCheckCoverage,
  getCity,
  getDistrict,
  getPostalCode,
  getProvince,
  getSubDistrict,
  getUserLocation,
} from "@/app/_api/Location/Location";
import toast from "react-hot-toast";
import { setCookie } from "cookies-next";
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  regexEmail,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { useRouter } from "next/navigation";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import MapGeoapify from "@/app/_components/form/MapGeoapify";
import { useGeoPermission } from "@/app/hooks/useGeoPermission";
import {
  sanitizeAddress,
  sanitizeAlphanumeric,
  sanitizeEmail,
  sanitizeName,
} from "@/app/_shared/utils/formatter";
import { FormType } from "../types/type";
import GeoPermissionGate from "./GeoPermissionGate";
import ModalRegister from "./ModalRegister";

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
  rw: "",
  rt: "",
  postal_code: "",
  actual_address: "",
  notes: "",
  voucher_code: "",
  address_gmaps: undefined,
  latitude: undefined,
  longitude: undefined,
};

type RegistrationFormProps = {
  mode: "register" | "reregister";
  initialData?: Partial<FormType>; // opsional, untuk autofill
  customerId?: string; // opsional, jika butuh ID untuk submit
  title: string;
};

function RegistrationForm({
  mode,
  initialData,
  customerId,
  title = "Registrasi Internet Rakyat (IRA)",
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormType>({
    ...initialFormData,
    ...(initialData || {}),
  });

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
  const [isCheckCoverage, setIsCheckCoverage] = useState<boolean>(false);
  const [mitraID, setMitraID] = useState([]);
  const [btsID, setBtsID] = useState([]);
  const [isCovered, setIsCovered] = useState<boolean>(false);
  const [coveredAtSubmit, setCoveredAtSubmit] = useState<boolean | null>(null);

  const [agreement, setAgreement] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isModalRegisterSuccess, setIsModalRegisterSuccess] =
    useState<boolean>(false);
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");

  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const { status, requestLocation, refresh } = useGeoPermission();
  const [isOpenModalReqLoc, setIsOpenModalReqLoc] = useState(false);

  useEffect(() => {
    if (status === "denied") setIsOpenModalReqLoc(true);
  }, [status]);

  const router = useRouter();

  const STORAGE_KEY = `otp:register:phone`;

  function startOtpTimerFromParent(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const expiry = Date.now() + seconds * 1000;
    // optional: tulis juga ke localStorage agar sync antar tab
    localStorage.setItem(STORAGE_KEY, String(expiry));
    setOtpExpiry(expiry);
  }

  // un comment kalo pakai API autofill
  // async function autofillLocationViaApiWithRaw(rawResult: any) {
  //   setIsAutoFilling(true);
  //   try {
  //     const resp = await getUserLocation(rawResult);
  //     const payload = resp?.data;
  //     if (!payload || payload.statusCode !== 200) {
  //       toast.error("Gagal mengenali lokasi dari API.");
  //       return;
  //     }
  //     const prov = payload?.result?.province ?? null;
  //     const city = payload?.result?.city ?? null;
  //     const dist = payload?.result?.district ?? null;
  //     const subd = payload?.result?.sub_district ?? null;
  //     const pcode = payload?.result?.postal_code ?? null; // bisa null
  //     // set ID yang dipilih; efek cascade kamu akan load opsi & labelnya
  //     setFormData((prev) => ({
  //       ...prev,
  //       province: prov?.id ? String(prov.id) : "",
  //       city: city?.id ? String(city.id) : "",
  //       district: dist?.id ? String(dist.id) : "",
  //       sub_district: subd?.id ? String(subd.id) : "",
  //       postal_code: pcode ? String(pcode) : "",
  //     }));
  //     if (prov?.id && prov?.name) {
  //       setProvinceOptions((opts) =>
  //         opts.some((o) => String(o.value) === String(prov.id))
  //           ? opts
  //           : [{ label: prov.name, value: String(prov.id) }, ...opts]
  //       );
  //     }
  //     toast.success("Lokasi terisi otomatis ✔");
  //   } catch (err: any) {
  //     // console.error("getUserLocation failed:", err);
  //     toastErrorFromAPI(err, "Autofill lokasi gagal");
  //   } finally {
  //     setIsAutoFilling(false);
  //   }
  // }

  useEffect(() => {
    const checkCoverage = async () => {
      if (!formData.latitude || !formData.longitude) {
        return;
      }

      setIsCheckCoverage(true);

      try {
        const resCoverage = await getCheckCoverage({
          latitude: formData.latitude,
          longitude: formData.longitude,
        });

        setMitraID(resCoverage.data?.result?.mitra_ids || []);
        setBtsID(resCoverage.data?.result?.bts_ids || []);
        setIsCovered(!!resCoverage.data?.result?.inside_coverage);
      } catch (error: any) {
        toastErrorFromAPI(error, "Gagal check coverage");
        setIsCovered(false);
      } finally {
        setIsCheckCoverage(false);
      }
    };

    checkCoverage();
  }, [formData.latitude, formData.longitude]);

  useEffect(() => {
    const loadProvince = async () => {
      try {
        const res = await getProvince();
        const options: ReactSelectType[] = res.data.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setProvinceOptions(options);
      } catch (error: any) {
        toastErrorFromAPI(error, "Gagal muat data provinsi");
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
      } catch (err: any) {
        toastErrorFromAPI(err, "Gagal muat data kota");
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
      } catch (err: any) {
        toastErrorFromAPI(err, "Gagal muat data kecamatan");

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
      } catch (err: any) {
        toastErrorFromAPI(err, "Gagal muat data kelurahan");
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
      } catch (err: any) {
        toastErrorFromAPI(err, "Gagal muat data kode pos");
        setPostalCodeOptions([]);
      }
    })();
  }, [formData.sub_district]);

  const handleRequestLocation = async () => {
    try {
      const position = await requestLocation();
      const { latitude, longitude } = position.coords;
      setFormData((prev) => ({
        ...prev,
        latitude: String(latitude),
        longitude: String(longitude),
      }));
      toast.success("Lokasi berhasil diambil!");
    } catch (err: any) {
      if (err.code === 1) {
        toast.error(
          "Izin lokasi ditolak. Silakan aktifkan di pengaturan browser."
        );
      } else {
        toast.error("Gagal mengambil lokasi.");
      }
    }
  };

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
      toastErrorFromAPI(err, "Verifikasi OTP gagal");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

    if (!formData.rw || formData.rw === "0") {
      errors.rw = "RW harus diisi";
    }

    if (!formData.rt || formData.rw === "0") {
      errors.rt = "RT harus diisi";
    }

    if (!formData.postal_code) {
      errors.postal_code = "Kode Pos harus diisi";
    }

    if (!formData.actual_address) {
      errors.actual_address = "Alamat Lengkap harus diisi";
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
      try {
        // const addressArray = formData.address_gmaps
        //   ? [normalizeAddressForBackend(formData.address_gmaps)]
        //   : [];
        const addressArray = [formData.address_gmaps];

        const body: any = {
          phone_number: formData.phone ?? "",
          name: formData.fullname ?? "",
          ...(formData.email && { email: formData.email }),
          ...(mitraID.length > 0 && { mitra_ids: mitraID }),
          ...(btsID.length > 0 && { bts_ids: btsID }),
          // nik: formData.nik ?? "",
          // no_kk: formData.nokk ?? "",
          province_id: formData.province ?? "",
          city_id: formData.city ?? "",
          district_id: formData.district ?? "",
          sub_district_id: formData.sub_district ?? "",
          // postal_code_id: formData.postal_code ?? "",
          postal_code: formData.postal_code ?? "",
          rw: formData.rw ?? "",
          rt: formData.rt ?? "",
          address: addressArray ?? "",
          actual_address: formData.actual_address ?? "",
          ...(formData.latitude && { latitude: formData.latitude }),
          ...(formData.longitude && { longitude: formData.longitude }),
          ...(formData.notes && { notes: formData.notes }),
          ...(formData.voucher_code && { voucher_code: formData.voucher_code }),
        };

        const coveredNow = isCovered;
        setCoveredAtSubmit(coveredNow);

        let res;

        if (mode === "register") {
          res = coveredNow
            ? await registerUser(body)
            : await requestCoverage({
                ...body,
                phone_number_verified: otpStatus === "valid",
              });
        } else if (mode === "reregister") {
        }

        // const res = coveredNow
        //   ? await registerUser(body)
        //   : await requestCoverage({
        //       ...body,
        //       phone_number_verified: otpStatus === "valid",
        //     });

        setIsModalRegisterSuccess(true);
        setOtpStatus("idle");
        resetForm();

        const token = res?.data?.data || res?.data?.token;
        if (token) setCookie("token-ira", token);
      } catch (error: any) {
        if (error?.response?.data?.statusCode === 409) {
          setOtpStatus("idle");
          setFormData((prev) => ({ ...prev, otp: "" }));
        }
        toastErrorFromAPI(error, "Gagal melakukan registrasi");
      } finally {
        setIsLoading(false);
      }
    }
  }

  // useEffect(() => {
  //   console.log(formData);
  // }, [formData]);

  function resetForm() {
    setFormData(initialFormData);
    setErrors({});
    setAgreement(false);
    setIsLoading(false);
    setOtpStatus("idle");

    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (status === "granted") setIsOpenModalReqLoc(true);
  }, [status]);

  const isValid = isLoading || !agreement || status === "denied";

  return (
    <div className="container mx-auto xl:px-42 lg:px-22 px-6 sm:my-22 my-6">
      <h1 className="text-center sm:text-[32px] text-2xl text-old-primary font-bold">
        {title}
      </h1>

      <form onSubmit={handleSubmit} className="mt-7">
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-7">
          {/* Nama */}
          <div className="max-md:col-span-2 col-span-1">
            <DynamicForm
              label="Nama Lengkap"
              isImportant
              name="fullname"
              value={formData.fullname}
              onChange={(value: string) => {
                const filtered = sanitizeName(value);
                setFormData((prev) => ({ ...prev, fullname: filtered }));
                setErrors({ ...errors, fullname: "" });
              }}
              placeholder="Masukkan Nama Lengkap"
              error={errors.fullname}
            />
          </div>

          {/* Email */}
          <div className="max-md:col-span-2 col-span-1">
            <DynamicForm
              label="Email (opsional)"
              isImportant={false}
              name="email"
              value={formData.email}
              onChange={(value: string) => {
                const cleaned = sanitizeEmail(value);

                setFormData((prevData) => ({
                  ...prevData,
                  email: cleaned,
                }));

                // Validasi hanya jika tidak kosong
                if (cleaned.trim() === "") {
                  setErrors((prev) => ({ ...prev, email: "" }));
                } else if (!EMAIL_REGEX.test(cleaned)) {
                  setErrors((prev) => ({
                    ...prev,
                    email: "Format email tidak valid",
                  }));
                } else {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              placeholder="contoh: nama@mail.com"
              error={errors.email}
            />
          </div>

          {/* Nomor Handphone */}
          <div className="max-md:col-span-2 col-span-1">
            <PhoneOTPForm
              storageKey={`otp:register:phone`}
              otpDurationSec={0}
              label="Nomor Handphone"
              name="phone"
              mode="register"
              inputMode="numeric"
              isImportant
              isDisabled={otpStatus === "valid"}
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
            <p className="text-xs text-muted mt-1">
              *Pastikan nomor yang Anda masukkan benar dan aktif
            </p>
          </div>

          {/* OTP */}
          <div className="max-md:col-span-2 col-span-1">
            <GroupedOTP
              isInvalid={!!errors.otp || otpStatus === "invalid"}
              label="Masukkan OTP yang dikirim via Whatsapp atau SMS"
              isImportant
              name="otp"
              value={formData.otp}
              isDisabled={otpStatus === "valid"}
              onChange={(val) => {
                const cleaned = sanitizeAlphanumeric(val);
                setFormData((prev) => ({ ...prev, otp: cleaned }));
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
          {/* <div className="max-md:col-span-2 col-span-1">
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
          {/* <div className="max-md:col-span-2 col-span-1">
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

          {/* Provinsi */}
          <div className="max-md:col-span-2 col-span-1">
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
          <div className="max-md:col-span-2 col-span-1">
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
              placeholder={`${
                !formData.province
                  ? "Pilih Provinsi Terlebih Dahulu"
                  : "Pilih Kota/Kabupaten"
              }`}
              error={errors.city}
            />
          </div>

          {/* Kecamatan */}
          <div className="max-md:col-span-2 col-span-1">
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
              placeholder={`${
                !formData.city
                  ? "Pilih Kota/Kabupaten Terlebih Dahulu"
                  : "Pilih Kecamatan"
              }`}
              error={errors.district}
            />
          </div>

          {/* Kelurahan */}
          <div className="max-md:col-span-2 col-span-1">
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
              placeholder={`${
                !formData.district
                  ? "Pilih Kecamatan Terlebih Dahulu"
                  : "Pilih Kelurahan"
              }`}
              error={errors.sub_district}
            />
          </div>

          {/* RW */}
          <div className="max-md:col-span-2 col-span-1">
            <DynamicForm
              label="RW"
              isImportant
              name="rw"
              value={formData.rw}
              onChange={(value: string) => {
                if (/^\d{0,3}$/.test(value)) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    rw: value,
                  }));
                  setErrors({ ...errors, rw: "" });
                }
              }}
              placeholder="Masukkan RW"
              error={errors.rw}
            />
          </div>

          {/* RT */}
          <div className="max-md:col-span-2 col-span-1">
            <DynamicForm
              label="RT"
              isImportant
              name="rt"
              value={formData.rt}
              onChange={(value: string) => {
                if (/^\d{0,3}$/.test(value)) {
                  setFormData((prevData: any) => ({
                    ...prevData,
                    rt: value,
                  }));
                  setErrors({ ...errors, rt: "" });
                }
              }}
              placeholder="Masukkan RT"
              error={errors.rt}
            />
          </div>

          {/* Kode Pos */}
          <div className="max-md:col-span-2 col-span-1">
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

            {/* Versi input angka */}
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
          <div className="max-md:col-span-2 col-span-1">
            <DynamicForm
              label="Patokan Alamat (opsional)"
              isImportant={false}
              name="notes"
              value={formData.notes}
              onChange={(value: string) => {
                const cleaned = sanitizeAddress(value);

                setFormData((prevData: any) => ({
                  ...prevData,
                  notes: cleaned,
                }));
              }}
              // isClearable
              placeholder="Masukkan Patokan Alamat (jika ada)"
              error={errors.notes}
            />
          </div>

          {/* Map */}
          <div className="col-span-2">
            {/* Versi Google */}
            {/* <MapInputForm
              getAddress={(value: string) => {
                setFormData((prevData: any) => ({
                  ...prevData,
                  actual_address: value,
                }));
                setErrors({ ...errors, actual_address: "" });
              }}
              onPlaceChange={async (p) => {
                setFormData((prev) => ({
                  ...prev,
                  actual_address: p.address,
                  address_gmaps: p.raw_result,
                  lat: String(p.latitude),
                  lng: String(p.longitude),
                  province: "",
                  city: "",
                  district: "",
                  sub_district: "",
                  postal_code: "",
                }));

                await autofillLocationViaApiWithRaw(p.raw_result);
              }}
            /> */}

            {/* Versi Geoapify */}
            {status !== "denied" && (
              <>
                <MapGeoapify
                  getAddress={(value: string) => {
                    setFormData((prevData: any) => ({
                      ...prevData,
                      actual_address: value,
                    }));
                    setErrors({ ...errors, actual_address: "" });
                  }}
                  onPlaceChange={async (p) => {
                    setFormData((prev) => ({
                      ...prev,
                      actual_address: p.address,
                      address_gmaps: p.raw_result,
                      latitude: String(p.latitude),
                      longitude: String(p.longitude),
                      // province: "",
                      // city: "",
                      // district: "",
                      // sub_district: "",
                      // postal_code: "",
                    }));

                    // await autofillLocationViaApiWithRaw(p.raw_result);
                  }}
                />

                {isCheckCoverage && (
                  <p className="mt-1 text-gray-500 flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
                    Mengecek jangkauan...
                  </p>
                )}
                {isCovered && !isCheckCoverage && (
                  <p className="mt-1 text-green-primary flex items-center gap-1 text-sm">
                    <FaCircleCheck className="text-green-primary" />
                    Selamat! Alamat Anda berada di dalam jangkauan kami.
                  </p>
                )}
                {!isCovered && !isCheckCoverage && (
                  <p className="mt-1 text-red-primary flex items-center gap-1 text-sm">
                    <FaCircleExclamation className="text-red-primary w-6 h-6 sm:w-4 sm:h-4" />
                    Lokasi Anda belum berada dijangkauan area kami, dan kami
                    sedang menuju ke daerah Anda.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Alamat Lengkap */}
          <div className="col-span-2">
            <DynamicForm
              label="Alamat Lengkap"
              type="textarea"
              isImportant
              rows={4}
              name="actual_address"
              value={formData.actual_address}
              onChange={(value: string) => {
                const cleaned = sanitizeAddress(value);

                setFormData((prevData) => ({
                  ...prevData,
                  actual_address: cleaned,
                }));

                setErrors((prev) => ({ ...prev, actual_address: "" }));
              }}
              placeholder={
                status === "denied"
                  ? "Izinkan akses lokasi di browser Anda untuk mengisi alamat"
                  : formData.address_gmaps
                  ? "Masukkan/rapikan Alamat Lengkap"
                  : "Pilih alamat dari pencarian peta untuk mengaktifkan"
              }
              error={errors.actual_address}
              disabled={!formData.address_gmaps}
            />
          </div>

          {/* Kode Voucher */}
          <div className="col-span-2">
            <DynamicForm
              label="Kode Voucher (opsional)"
              isImportant={false}
              name="voucher_code"
              value={formData.voucher_code}
              onChange={(value: string) => {
                const filtered = value.replace(/[^a-zA-Z\s.\-]/g, "");
                setFormData((prev) => ({ ...prev, voucher_code: filtered }));
                setErrors({ ...errors, voucher_code: "" });
              }}
              placeholder="Masukkan Kode Voucher"
              error={errors.voucher_code}
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

        <div className="mt-7 flex flex-col gap-3 justify-center">
          <button
            type="submit"
            disabled={isValid}
            className={`py-3.75 w-1/2 font-bold text-white ${
              isValid
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-primary hover:bg-dark-primary-2 cursor-pointer"
            } text-xl rounded-xl mx-auto `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading w-5 h-5"></div>
                <span className="italic text-white">Loading...</span>
              </div>
            ) : (
              "Registrasi"
            )}
          </button>
          {status === "denied" && (
            <p className="mx-auto text-muted text-sm">
              *Pastikan anda sudah mengizinkan akses lokasi, lalu refresh
            </p>
          )}
        </div>

        <div className="mt-7 text-center">
          <p className="text-primary-text">
            Sudah punya akun IRA?{" "}
            <span>
              <Link
                href="/auth/login"
                className="underline-animation-register text-primary font-bold"
              >
                Login disini
              </Link>
            </span>
          </p>
        </div>
      </form>

      {isModalRegisterSuccess && (
        <ModalTemplate
          closeModal={() => {
            setIsModalRegisterSuccess(false);
            resetForm();
            setCoveredAtSubmit(null);
            window.location.href = "/customer-area";
          }}
          classNameModal="w-[90%] sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 px-5 py-10"
        >
          <ModalRegister isCovered={isCovered} />
        </ModalTemplate>
      )}

      {isOpenModalReqLoc && status === "denied" && (
        <ModalTemplate
          closeModal={() => {
            setIsOpenModalReqLoc(false);
            toast("Mohon izinkan akses lokasi browser");
            router.push("/");
          }}
        >
          <div className="p-6 mt-6">
            <GeoPermissionGate
              onGotLocation={(lat, lng) => {
                setFormData((prev) => ({
                  ...prev,
                  lat: String(lat),
                  lng: String(lng),
                }));
              }}
            />
          </div>
        </ModalTemplate>
      )}
    </div>
  );
}

export default RegistrationForm;
