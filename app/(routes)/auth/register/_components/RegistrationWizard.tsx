"use client";
import CheckboxAgreeForm from "@/app/_components/form/CheckboxAgreeForm";
import DynamicForm from "@/app/_components/form/DynamicForm";
import DynamicSelectForm from "@/app/_components/form/DynamicSelectForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { ReactSelectType } from "@/app/_shared/types/form";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  getPackagesRegister,
  registerUser,
  registerUserFromCoverage,
  requestCoverage,
  updateRequestCoverage,
  verifyOtp,
} from "@/app/_api/Auth/Auth";
import {
  getCheckCoverage,
  getCity,
  getDistrict,
  getPostalCode,
  getProvince,
  getSubDistrict,
  getLocationByPostalCode,
  getUserLocation,
} from "@/app/_api/Location/Location";
import toast from "react-hot-toast";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import {
  convertToCurrency,
  EMAIL_REGEX,
  PHONE_BEST_REGEX,
  regexEmail,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { useRouter, usePathname } from "next/navigation";
import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import MapGeoapify from "@/app/_components/form/MapGeoapify";
import { useBrowserDetection } from "@/app/hooks/useBrowserDetection";
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
import { useAppSelector } from "@/app/store/store";
import PackageCardMobile from "@/app/(routes)/payment/_components/PackageCardMobile";
import { PackageData } from "@/app/_shared/types/customer-area";
import { hardcodedPackages } from "@/app/_shared/data/data";
import Loader from "@/app/_components/Loader";
import { PackageCardMobileSkeletonList } from "@/app/(routes)/payment/_components/PackageCardMobileSkeleton";
import { buildErrorToast, scrollToFirstError } from "../helper";
import DynamicPasswordForm from "@/app/_components/form/FieldPassword";
import PhoneNumberForm from "@/app/_components/form/PhoneForm";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import MapGeoapifyLite from "@/app/_components/form/MapGeoapifyLite";
import Image from "next/image";
import bannerImageNoCovered from "@/public/assets/Images/banner-out-coverage.png";
import bannerImageCovered from "@/public/assets/Images/banner-in-coverage.png";
import { FaBackward } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoArrowBackSharp } from "react-icons/io5";

const initialFormData: FormType = {
  package_id: "",
  fullname: "",
  email: "",
  phone: "",
  otp: "",
  // password: "",
  // confirm_password: "",
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
  mode: "register" | "reregister" | "update_address";
  initialData?: Partial<FormType>; // opsional, untuk autofill
  customerId?: string; // opsional, jika butuh ID untuk submit
  title: string;
  showCancelButton?: boolean;
  showBannerCovered?: boolean;
};

function RegistrationWizard({
  mode,
  initialData,
  customerId,
  title = "Registrasi Internet Rakyat (IRA)",
  showCancelButton = false,
  showBannerCovered = false,
}: RegistrationFormProps) {
  // Clean up notes from initialData
  let defaultNotes = initialData?.notes || "";
  if (defaultNotes) {
    defaultNotes = defaultNotes
      .replace(/\s*-\s*Pelanggan pre-registrasi/gi, "")
      .replace(/Pelanggan pre-registrasi/gi, "")
      .trim();
  }

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormType>({
    ...initialFormData,
    ...(initialData || {}),
    ...(initialData?.notes !== undefined ? { notes: defaultNotes } : {}),
  });

  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isOpenMapModal, setIsOpenMapModal] = useState(false);
  const [tempMapPayload, setTempMapPayload] = useState<any>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const [provinceOptions, setProvinceOptions] = useState<ReactSelectType[]>([]);
  const [cityOptions, setCityOptions] = useState<ReactSelectType[]>([]);
  const [districtOptions, setDistrictOptions] = useState<ReactSelectType[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    ReactSelectType[]
  >([]);
  const [postalCodeOptions, setPostalCodeOptions] = useState<ReactSelectType[]>(
    [],
  );
  const hasInitialLocation =
    initialData?.latitude &&
    initialData?.longitude &&
    String(initialData.latitude) !== "0" &&
    String(initialData.longitude) !== "0";
  const [isCheckCoverage, setIsCheckCoverage] =
    useState<boolean>(!hasInitialLocation);
  const [mitraID, setMitraID] = useState<
    { id: string | number; [key: string]: any }[]
  >([]);
  const [btsID, setBtsID] = useState([]);
  const [isCovered, setIsCovered] = useState<boolean>(false);
  const [coveredAtSubmit, setCoveredAtSubmit] = useState<boolean | null>(null);

  const [agreement, setAgreement] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [isModalRegisterSuccess, setIsModalRegisterSuccess] =
    useState<boolean>(false);
  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");

  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const { status, requestLocation, refresh } = useGeoPermission();
  const [isOpenModalReqLoc, setIsOpenModalReqLoc] = useState(false);

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>();

  const token = getCookie("token-ira");

  useBrowserDetection();

  useEffect(() => {
    if (status === "denied") {
      setIsOpenModalReqLoc(true);
    } else if (
      status === "granted" &&
      (!formData.latitude || formData.latitude === "0")
    ) {
      handleRequestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const router = useRouter();
  const pathname = usePathname();

  const STORAGE_KEY = `otp:register:phone`;

  function startOtpTimerFromParent(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const expiry = Date.now() + seconds * 1000;
    // optional: tulis juga ke localStorage agar sync antar tab
    localStorage.setItem(STORAGE_KEY, String(expiry));
    setOtpExpiry(expiry);
  }

  const { userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if ((mode === "reregister" || mode === "update_address") && initialData) {
      const { province, city, district, sub_district } = initialData;

      // Autofill the province
      if (province) {
        setFormData((prev) => ({ ...prev, province }));
        const provinceId = province; // ID for province
        (async () => {
          try {
            const res = await getCity({ province_id: provinceId });
            setCityOptions(
              (res.data?.data ?? []).map((it: any) => ({
                label: it.name,
                value: String(it.id),
              })),
            );
          } catch (err) {
            toastErrorFromAPI(err, "Gagal muat data kota");
          }
        })();
      }

      // Autofill the city
      if (city) {
        setFormData((prev) => ({ ...prev, city }));
        const cityId = city;
        (async () => {
          try {
            const res = await getDistrict({ city_id: cityId });
            setDistrictOptions(
              (res.data?.data ?? []).map((it: any) => ({
                label: it.name,
                value: String(it.id),
              })),
            );
          } catch (err) {
            toastErrorFromAPI(err, "Gagal muat data kecamatan");
          }
        })();
      }

      // Autofill the district
      if (district) {
        setFormData((prev) => ({ ...prev, district }));
        const districtId = district;
        (async () => {
          try {
            const res = await getSubDistrict({ district_id: districtId });
            setSubdistrictOptions(
              (res.data?.data ?? []).map((it: any) => ({
                label: it.name,
                value: String(it.id),
              })),
            );
          } catch (err) {
            toastErrorFromAPI(err, "Gagal muat data kelurahan");
          }
        })();
      }

      // Autofill the sub-district
      if (sub_district) {
        setFormData((prev) => ({ ...prev, sub_district }));
      }
    }
  }, [mode, initialData]);

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
      if (
        !formData.latitude ||
        formData.latitude === "0" ||
        formData.longitude === "0" ||
        !formData.longitude
      ) {
        setIsCovered(false);
        setMitraID([]);
        return;
      }

      setIsCheckCoverage(true);

      try {
        const resCoverage = await getCheckCoverage({
          latitude: formData.latitude,
          longitude: formData.longitude,
        });

        setMitraID(resCoverage.data?.result?.mitra_ids ?? []);
        setBtsID(resCoverage.data?.result?.bts_ids ?? []);
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

  // Paket terpilih harus di-reset saat paket list atau lokasi berubah
  useEffect(() => {
    if (!formData.package_id) return;
    const stillExists = packages.some(
      (p) => String(p.id) === String(formData.package_id),
    );
    if (!stillExists) {
      setSelectedPackage(null);
      setFormData((prev) => ({ ...prev, package_id: "" }));
    }
  }, [formData.package_id, packages]);

  useEffect(() => {
    // auto-select kalau hanya ada 1 paket
    if (packages.length === 1) {
      const onlyPkg = packages[0];

      // kalau belum ke-select
      if (String(formData.package_id) !== String(onlyPkg.id)) {
        setSelectedPackage(onlyPkg);
        setFormData((prev) => ({
          ...prev,
          package_id: onlyPkg.id,
        }));
        setErrors((prev) => ({ ...prev, package_id: "" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages]);

  useEffect(() => {
    const loadProvince = async () => {
      try {
        const res = await getProvince();
        const options: ReactSelectType[] = (res.data?.data ?? []).map(
          (item: any) => ({
            label: item.name,
            value: item.id.toString(),
          }),
        );
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
          (res.data?.data ?? []).map((it: any) => ({
            label: it.name,
            value: String(it.id),
          })),
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
          (res.data?.data ?? []).map((it: any) => ({
            label: it.name,
            value: String(it.id),
          })),
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
          (res.data?.data ?? []).map((it: any) => ({
            label: it.name,
            value: String(it.id),
          })),
        );
      } catch (err: any) {
        toastErrorFromAPI(err, "Gagal muat data kelurahan");
        setSubdistrictOptions([]);
      }
    })();
  }, [formData.district]);

  const [isLoadingArea, setIsLoadingArea] = useState(false);

  // Debounce Kode Pos -> Autofill Lokasi
  useEffect(() => {
    if (!formData.postal_code || formData.postal_code.length < 5) return;

    const timer = setTimeout(async () => {
      try {
        setIsLoadingArea(true);
        const res = await getLocationByPostalCode(formData.postal_code);
        const locData = res.data?.data;
        if (locData && Object.keys(locData).length > 0) {
          const { province, city, district, sub_district } = locData;

          if (province) {
            setProvinceOptions((opts) => {
              const exists = opts.find((o) => o.value === String(province.id));
              return exists
                ? opts
                : [
                    { label: province.name, value: String(province.id) },
                    ...opts,
                  ];
            });
          }
          if (city) {
            setCityOptions((opts) => {
              const exists = opts.find((o) => o.value === String(city.id));
              return exists
                ? opts
                : [{ label: city.name, value: String(city.id) }, ...opts];
            });
          }
          if (district) {
            setDistrictOptions((opts) => {
              const exists = opts.find((o) => o.value === String(district.id));
              return exists
                ? opts
                : [
                    { label: district.name, value: String(district.id) },
                    ...opts,
                  ];
            });
          }
          if (sub_district) {
            setSubdistrictOptions((opts) => {
              const exists = opts.find(
                (o) => o.value === String(sub_district.id),
              );
              return exists
                ? opts
                : [
                    {
                      label: sub_district.name,
                      value: String(sub_district.id),
                    },
                    ...opts,
                  ];
            });
          }

          setFormData((prev) => ({
            ...prev,
            province: province ? String(province.id) : prev.province,
            city: city ? String(city.id) : prev.city,
            district: district ? String(district.id) : prev.district,
            sub_district: sub_district
              ? String(sub_district.id)
              : prev.sub_district,
          }));

          // Panggil geoapify utk dapetin lat/lng berdasarkan kode pos
          try {
            const MAP_KEY =
              process.env.NEXT_PUBLIC_MAP_API_KEY ||
              "9babe437b7aa4d84b359813bfdd4ff7a";
            const resMap = await fetch(
              `https://api.geoapify.com/v1/geocode/search?postcode=${formData.postal_code}&country=Indonesia&apiKey=${MAP_KEY}`,
            );
            const dataMap = await resMap.json();
            if (dataMap?.features?.length > 0) {
              const { lat, lon } = dataMap.features[0].properties;
              if (lat && lon) {
                setFormData((prev) => ({
                  ...prev,
                  latitude: String(lat),
                  longitude: String(lon),
                }));
                setTempMapPayload((prev: any) => ({
                  ...prev,
                  latitude: String(lat),
                  longitude: String(lon),
                }));
              }
            }
          } catch (e) {
            console.error("Gagal mendeteksi koordinat kode pos", e);
          }

          toast.success("Area lokasi ditemukan ✔");
        }
      } catch (err: any) {
        toastErrorFromAPI(err, "Gagal melacak kode pos");
      } finally {
        setIsLoadingArea(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.postal_code]);

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
          "Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.",
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

  useEffect(() => {
    const getPackageListReg = async () => {
      const params = {
        mitra_id: mitraID[0]?.id,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const readyToFetch =
        params.latitude &&
        params.latitude !== "0" &&
        params.longitude &&
        params.longitude !== "0" &&
        params.mitra_id;

      if (readyToFetch) {
        try {
          setIsLoadingPackage(true);
          const resPkgs = await getPackagesRegister(params);
          setPackages(resPkgs.data?.data ?? []);
        } catch (err: any) {
          toastErrorFromAPI(err);
        } finally {
          setIsLoadingPackage(false);
        }
      } else {
        setPackages([]);
      }
    };

    getPackageListReg();
  }, [formData.latitude, formData.longitude, mitraID]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    const errors: { [key: string]: string } = {};

    const coveredNow = isCovered;
    setCoveredAtSubmit(coveredNow);

    if (coveredNow && !formData.package_id) {
      errors.package_id = "Paket harus dipilih";
    }

    if (!formData.fullname) {
      errors.fullname = "Nama Lengkap harus diisi";
    }

    if (formData.email && !regexEmail.test(formData.email)) {
      errors.email = "Format email salah";
    }

    if (!formData.phone) {
      errors.phone = "No handphone harus diisi";
    } else if (!PHONE_BEST_REGEX.test(formData.phone)) {
      errors.phone = "Nomor handphone tidak valid.";
    }

    if (formData.otp.length !== 6 && mode === "register") {
      errors.otp = "Kode OTP harus 6 digit";
    }

    // if (!formData.password || formData.password.length < 6) {
    //   errors.password = "Password minimal 6 karakter";
    // }

    // if (formData.password !== formData.confirm_password) {
    //   errors.confirm_password = "Password tidak sama";
    // }

    // if (!formData.confirm_password) {
    //   errors.confirm_password = "Konfirmasi password wajib diisi";
    // }

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
      errors.city = "Kota/Kab harus diisi";
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

    if (!formData.rt || formData.rt === "0") {
      errors.rt = "RT harus diisi";
    }

    if (!formData.postal_code) {
      errors.postal_code = "Kode Pos harus diisi";
    }

    if (!formData.actual_address) {
      errors.actual_address = "Alamat Lengkap harus diisi";
    }

    if (otpStatus !== "valid" && mode === "register") {
      errors.otp = "OTP belum terverifikasi";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);

      // Scroll ke error paling atas (setTimeout biar state sempat render error message)
      setTimeout(() => {
        scrollToFirstError(errors);
      }, 0);

      toast.error(buildErrorToast(errors));

      setIsLoading(false);
      return;
    } else {
      // Open summary modal instead of submitting directly
      setIsLoading(false);
      setIsSummaryModalOpen(true);
    }
  }

  async function handleFinalSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!agreement) {
      toast.error(
        "Anda harus menyetujui syarat & ketentuan sebelum melanjutkan.",
      );
      return;
    }
    setIsSummaryModalOpen(false);
    setIsLoading(true);
    try {
      const addressArray = [formData.address_gmaps];
      const type =
        userInfo?.status === "canceled-instalation"
          ? "tipe-cancel"
          : userInfo?.status === "inactive"
            ? "tipe inactive"
            : "tipe regist baru";

      const body: any = {
        ...(isCovered && { package_id: formData.package_id }),
        phone_number: formData.phone ?? "",
        name: formData.fullname ?? "",
        ...(formData.email && { email: formData.email }),
        ...(mitraID.length > 0 && { mitra_ids: mitraID }),
        ...(btsID.length > 0 && { bts_ids: btsID }),
        // nik: formData.nik ?? "",
        // no_kk: formData.nokk ?? "",
        // password: formData.password ?? "",
        province_id: formData.province ?? "",
        city_id: formData.city ?? "",
        district_id: formData.district ?? "",
        sub_district_id: formData.sub_district ?? "",
        postal_code: formData.postal_code ?? "",
        rw: formData.rw ?? "",
        rt: formData.rt ?? "",
        address: addressArray ?? "",
        actual_address: formData.actual_address ?? "",
        ...(formData.latitude && { latitude: formData.latitude }),
        ...(formData.longitude && { longitude: formData.longitude }),
        ...(formData.notes && { notes: formData.notes }),
        ...(formData.voucher_code && { voucher_code: formData.voucher_code }),
        // type,
      };

      let res;

      if (mode === "register" || mode === "reregister") {
        res = isCovered
          ? await registerUser(body)
          : await requestCoverage({
              ...body,
              phone_number_verified: otpStatus === "valid",
            });
      } else if (mode === "update_address") {
        res = isCovered
          ? await registerUserFromCoverage({
              ...body,
            })
          : await updateRequestCoverage({
              ...body,
            });
      }

      // replace token
      if (mode === "reregister" || mode === "update_address") {
        const token = res?.data?.data ?? res?.data?.token;
        if (token) {
          deleteCookie("token-ira");
          setCookie("token-ira", token);
        }
      }

      // Keperluan set password setelah register
      const phoneValue = formData.phone?.trim();
      if (phoneValue && mode === "register") {
        localStorage.setItem("registration_phone", phoneValue);
      }

      // Facebook & TikTok Pixel Track CompleteRegistration
      if (typeof window !== "undefined") {
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "CompleteRegistration");
        }
        if (typeof (window as any).ttq === "object") {
          (window as any).ttq.track("CompleteRegistration");
        }
      }

      setIsModalRegisterSuccess(true);
      if (pathname === "/auth/register") {
        window.history.pushState(null, "", "/auth/register/popup");
      }
      setOtpStatus("idle");
      resetForm();
    } catch (error: any) {
      // error konflik 409
      if (error?.response?.data?.statusCode === 409) {
        setOtpStatus("idle");
        setFormData((prev) => ({ ...prev, otp: "" }));
      }
      toastErrorFromAPI(error, "Gagal melakukan registrasi");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log(formData);
    // console.log("mitra IDs: ", mitraID);
    // console.log("bts IDs: ", btsID);
    // console.log(isCovered);
  }, [btsID, formData, mitraID, isCovered]);

  function resetForm() {
    setFormData(initialFormData);
    setErrors({});
    setAgreement(false);
    setIsLoading(false);
    setOtpStatus("idle");
    localStorage.removeItem(STORAGE_KEY);

    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (status === "granted") setIsOpenModalReqLoc(true);
  }, [status]);

  const handleSelect = (pkg: PackageData) => {
    // const isSame = selectedPackage?.id === pkg.id;

    // if (isSame) {
    //   // ✅ unselect
    //   setSelectedPackage(null);
    //   setFormData((prev) => ({ ...prev, package_id: "" }));
    //   return;
    // }

    setSelectedPackage(pkg);
    setFormData((prev) => ({
      ...prev,
      package_id: pkg.id,
    }));
    setErrors((prev) => ({ ...prev, package_id: "" }));
  };

  const isFormDirty = () => {
    return Object.values(formData).some(
      (v) => v !== "" && v !== null && v !== undefined,
    );
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFormDirty() || isLoading) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // const isPasswordMismatch =
  //   Boolean(formData.password) &&
  //   Boolean(formData.confirm_password) &&
  //   formData.password !== formData.confirm_password;

  const isValid =
    isLoading ||
    !agreement ||
    status === "denied" ||
    isCheckCoverage ||
    isLoadingPackage;
  // !formData.package_id;
  // || isPasswordMismatch;

  const handleNextStep1 = () => {
    setStep(2);

    // let newErrors = { ...errors };
    // let hasError = false;

    // if (!formData.fullname || !formData.fullname.trim()) {
    //   newErrors.fullname = "Nama Lengkap wajib diisi.";
    //   hasError = true;
    // } else {
    //   delete newErrors.fullname;
    // }

    // if (!formData.phone || !formData.phone.trim()) {
    //   newErrors.phone = "Nomor Ponsel wajib diisi.";
    //   hasError = true;
    // } else {
    //   delete newErrors.phone;
    // }

    // if (
    //   formData.email &&
    //   formData.email.trim() &&
    //   !EMAIL_REGEX.test(formData.email)
    // ) {
    //   newErrors.email = "Format email tidak valid.";
    //   hasError = true;
    // } else {
    //   delete newErrors.email;
    // }

    // if (otpStatus !== "valid" && !initialData?.phone) {
    //   toast.error("Silakan selesaikan pengisian OTP terlebih dahulu.");
    //   hasError = true;
    // }

    // setErrors(newErrors);

    // if (!hasError) {
    //   setStep(2);
    //   window.scrollTo({ top: 0, behavior: "smooth" });
    // } else {
    //   scrollToFirstError(newErrors);
    // }
  };

  return (
    <div className="w-full relative mx-auto text-black">
      {isLoading && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white bg-opacity-70">
          <Loader />
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="text-center md:px-20 lg:px-32 mb-10 mt-4">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4">{title}</h2>
        <p className="text-sm md:text-base text-gray-700 font-medium">
          Isi data pribadi dan alamat lengkap kamu untuk mulai berlangganan
          Internet Rakyat. Pastikan alamat sesuai dan detail agar proses
          pengecekan jangkauan dan pemasangan bisa berjalan cepat dan tepat.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Sidebar */}
        <div className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0">
          <div className="bg-[#FFEFEF] text-black font-extrabold text-lg text-center py-4 rounded-xl mb-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-red-50">
            STEP {step} dari 2
          </div>

          <div className="space-y-8 px-2 md:px-4">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => step === 2 && setStep(1)}
            >
              {step > 1 ? (
                <Image
                  src="/assets/Icons/check-green-icon.png"
                  alt="Selesai"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain flex-shrink-0"
                />
              ) : (
                <Image
                  src="/assets/Icons/pending-icon.png"
                  alt="Sedang Berjalan"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain flex-shrink-0"
                />
              )}
              <span
                className={`font-extrabold text-sm md:text-base ${step === 1 ? "text-primary" : "text-gray-800"}`}
              >
                Pengisian Informasi Pribadi
              </span>
            </div>

            <div className="flex items-center gap-4">
              {step === 2 ? (
                <Image
                  src="/assets/Icons/pending-icon.png"
                  alt="Sedang Berjalan"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain flex-shrink-0"
                />
              ) : (
                <Image
                  src="/assets/Icons/pending-icon.png"
                  alt="Belum Dimulai"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain flex-shrink-0 opacity-50 grayscale"
                />
              )}
              <span
                className={`font-extrabold text-sm md:text-base ${step === 2 ? "text-primary" : "text-gray-400"}`}
              >
                Pengisian Lokasi Pemasangan
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="border border-primary rounded-2xl p-6 lg:p-8 bg-white shadow-sm overflow-hidden">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="font-extrabold text-lg md:text-xl mb-6 text-black">
                  Silakan Isi Data Pribadi Kamu
                </h3>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-2">
                  <div className="flex-1">
                    <DynamicForm
                      label="Nama Lengkap"
                      isImportant
                      name="fullname"
                      type="text"
                      placeholder="Nama Lengkap"
                      value={formData.fullname}
                      onChange={(value: string) => {
                        const val = sanitizeName(value);
                        setFormData({ ...formData, fullname: val });
                        setErrors({ ...errors, fullname: "" });
                      }}
                      error={errors.fullname || ""}
                      disabled={isAutoFilling}
                    />
                  </div>
                  <div className="flex-1">
                    <DynamicForm
                      label="Email (Opsional)"
                      isImportant={false}
                      name="email"
                      type="email"
                      placeholder="user@mail.com"
                      value={formData.email}
                      onChange={(value: string) => {
                        const val = sanitizeEmail(value);
                        setFormData({ ...formData, email: val });
                        if (val && !EMAIL_REGEX.test(val)) {
                          setErrors({
                            ...errors,
                            email: "Format email tidak valid",
                          });
                        } else {
                          setErrors({ ...errors, email: "" });
                        }
                      }}
                      error={errors.email || ""}
                      disabled={isAutoFilling}
                    />
                  </div>
                </div>

                <div className="mb-4 pt-4 flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex-1">
                    <PhoneOTPForm
                      storageKey={`otp:register:phone`}
                      otpDurationSec={0}
                      label="Nomor Handphone"
                      name="phone"
                      mode="register"
                      inputMode="numeric"
                      isImportant
                      isDisabled={otpStatus === "valid" || mode !== "register"}
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
                  <div className="flex-1 pt-1 opacity-100 mt-2 md:mt-0 transition-opacity">
                    <GroupedOTP
                      isInvalid={!!errors.otp || otpStatus === "invalid"}
                      label="Masukkan OTP yang dikirim via Whatsapp atau SMS"
                      isImportant
                      name="otp"
                      value={formData.otp}
                      isDisabled={otpStatus === "valid"}
                      onChange={(val: string) => {
                        const cleaned = sanitizeAlphanumeric(val);
                        setFormData((prev) => ({ ...prev, otp: cleaned }));
                        if (errors.otp) setErrors((e) => ({ ...e, otp: "" }));
                        if (otpStatus !== "idle") setOtpStatus("idle");
                      }}
                      onComplete={(val: string) => {
                        handleVerifyOtp(val);
                      }}
                    />

                    <p
                      className={`text-primary mt-1 text-sm italic ${otpStatus === "verifying" ? "block" : "hidden"}`}
                    >
                      <span>Memverifikasi OTP...</span>
                    </p>

                    <p
                      className={`text-green-600 mt-1 text-sm flex items-center gap-1 ${otpStatus === "valid" ? "flex" : "hidden"}`}
                    >
                      <span>OTP Terverifikasi</span> <FaCircleCheck />
                    </p>

                    {errors.otp && (
                      <p className="text-primary text-xs mt-1">{errors.otp}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="font-extrabold text-lg md:text-xl mb-6 text-black">
                  Silakan Isi Alamat Lengkap
                </h3>

                {/* Package Selector */}
                {isCovered && (
                  <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm font-semibold mb-2 text-black">
                      Paket yang tersedia<span className="text-primary">*</span>
                    </p>

                    {isLoadingPackage ? (
                      <PackageCardMobileSkeletonList count={2} />
                    ) : packages?.length ? (
                      <div className="md:grid max-sm:p-1 grid-cols-1 md:grid-cols-2 gap-4 max-sm:space-y-4">
                        {packages.map((pkg) => (
                          <PackageCardMobile
                            key={pkg.id}
                            pkg={pkg}
                            selected={selectedPackage?.id === pkg?.id}
                            onSelect={handleSelect}
                            convertToCurrency={convertToCurrency}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        Belum ada daftar paket yang tersedia dari sistem.
                      </div>
                    )}

                    {errors.package_id && (
                      <p className="text-primary text-xs flex items-center gap-1 mt-2">
                        <FaCircleExclamation />
                        <span>{errors.package_id}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Kode Pos Area */}
                <div className="mb-6 relative z-[60]">
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-1/2">
                    <div className="w-[100%] md:w-full">
                      <div className="relative">
                        <DynamicForm
                          label="Kode POS"
                          type="number"
                          isImportant
                          name="postal_code"
                          onChange={(value: string) => {
                            if (/^\d{0,5}$/.test(value)) {
                              setFormData((prev: any) => ({
                                ...prev,
                                postal_code: value,
                              }));
                              setErrors({ ...errors, postal_code: "" });
                            }
                          }}
                          placeholder="Masukkan 5 digit Kode POS"
                          value={formData.postal_code}
                          error={errors.postal_code || ""}
                          disabled={Boolean(
                            isAutoFilling ||
                            (mode === "update_address" &&
                              initialData?.postal_code &&
                              initialData?.postal_code ===
                                formData.postal_code),
                          )}
                        />
                        {isLoadingArea && (
                          <div className="absolute top-[45px] right-4 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* {!isCovered && formData.postal_code && (
                    <div className="w-full p-3 rounded-md bg-[#FFF9CC] border border-orange-200 mt-2">
                      <h4 className="flex items-center gap-2 font-bold text-orange-600 mb-1">
                        <FaCircleExclamation size={20} /> Area kamu belum
                        tercakup
                      </h4>
                      <p className="text-sm font-medium">
                        Mohon maaf, layanan IRA belum tersedia di areamu. Kami
                        sedang memperluas jaringan agar bisa segera hadir di
                        lokasimu. Tunggu kehadiran kami ya!
                      </p>
                    </div>
                  )} */}
                </div>

                {/* Map Area */}
                <div className="mb-6 relative z-10 space-y-2">
                  <p className="font-bold text-sm text-black mb-2">
                    Arahkan Pin Lokasi ke Titik Alamat Anda
                  </p>
                  <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm relative border border-gray-200">
                    <div className="w-full h-full pointer-events-none">
                      <MapGeoapify
                        mode={mode as any}
                        initialLatitude={Number(formData.latitude || 0)}
                        initialLongitude={Number(formData.longitude || 0)}
                        getAddress={() => {}}
                        isInteractive={false}
                      />
                    </div>
                    {/* The "Sesuaikan Pin Point" Floating Red Button from design mockup */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-fit">
                      <button
                        type="button"
                        onClick={() => {
                          setTempMapPayload({
                            latitude: formData.latitude,
                            longitude: formData.longitude,
                            address: formData.actual_address,
                            address_gmaps: formData.address_gmaps,
                          });
                          setIsOpenMapModal(true);
                        }}
                        className="w-full md:w-[300px] bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-primary-dark transition text-sm cursor-pointer"
                      >
                        Sesuaikan Pin Point
                      </button>
                    </div>
                  </div>
                  {errors.latitude && (
                    <p className="text-primary text-xs mt-1">
                      Lokasi GPS harus dipilih dari peta otomatis.
                    </p>
                  )}
                </div>

                <p
                  className={`mt-1 text-gray-500 items-center gap-2 text-sm ${isCheckCoverage ? "flex" : "hidden"}`}
                >
                  <span className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
                  <span>Mengecek jangkauan...</span>
                </p>
                <p
                  className={`mt-1 text-green-primary items-center gap-1 text-sm ${isCovered && !isCheckCoverage ? "flex" : "hidden"}`}
                >
                  <FaCircleCheck className="text-green-primary" />
                  <span>
                    Selamat! Alamat Anda berada di dalam jangkauan kami.
                  </span>
                </p>
                <p
                  className={`mt-3 animate-bounce text-red-primary items-center gap-1 text-sm ${!isCovered && !isCheckCoverage ? "flex" : "hidden"}`}
                >
                  <FaCircleExclamation className="text-red-primary w-6 h-6 sm:w-4 sm:h-4" />
                  <span>
                    Lokasi Anda belum berada di jangkauan area kami, dan kami
                    sedang menuju ke daerah Anda.
                  </span>
                </p>

                {/* Address Select Area */}
                <div className="mt-3 flex flex-col md:flex-row gap-4 md:gap-6 mb-4 relative z-50">
                  <div className="flex-1">
                    <DynamicSelectForm
                      label="Provinsi"
                      isImportant
                      name="province"
                      options={provinceOptions}
                      onChange={(value: any) => {
                        if (value) {
                          setFormData((prev: any) => ({
                            ...prev,
                            province: value.value,
                            city: "",
                            district: "",
                            sub_district: "",
                            postal_code: "",
                          }));
                        } else {
                          setFormData((prev: any) => ({
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
                      placeholder="Pilih Provinsi"
                      value={formData.province}
                      error={errors.province}
                    />
                  </div>
                  <div className="flex-1">
                    <DynamicSelectForm
                      label="Kota/Kabupaten"
                      isImportant
                      name="city"
                      options={cityOptions}
                      onChange={(value: any) => {
                        if (value) {
                          setFormData((prev: any) => ({
                            ...prev,
                            city: value.value,
                            district: "",
                            sub_district: "",
                            postal_code: "",
                          }));
                        } else {
                          setFormData((prev: any) => ({
                            ...prev,
                            city: "",
                            district: "",
                            sub_district: "",
                            postal_code: "",
                          }));
                        }
                        setErrors({ ...errors, city: "" });
                      }}
                      placeholder="Pilih Kota/Kabupaten"
                      value={formData.city}
                      error={errors.city}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 relative z-40">
                  <div className="flex-1">
                    <DynamicSelectForm
                      label="Kecamatan"
                      isImportant
                      name="district"
                      options={districtOptions}
                      onChange={(value: any) => {
                        if (value) {
                          setFormData((prev: any) => ({
                            ...prev,
                            district: value.value,
                            sub_district: "",
                            postal_code: "",
                          }));
                        } else {
                          setFormData((prev: any) => ({
                            ...prev,
                            district: "",
                            sub_district: "",
                            postal_code: "",
                          }));
                        }
                        setErrors({ ...errors, district: "" });
                      }}
                      placeholder="Pilih Kecamatan"
                      value={formData.district}
                      error={errors.district}
                    />
                  </div>
                  <div className="flex-1">
                    <DynamicSelectForm
                      label="Kelurahan"
                      isImportant
                      name="sub_district"
                      options={subdistrictOptions}
                      onChange={(value: any) => {
                        if (value) {
                          setFormData((prev: any) => ({
                            ...prev,
                            sub_district: value.value,
                            postal_code: "",
                          }));
                        } else {
                          setFormData((prev: any) => ({
                            ...prev,
                            sub_district: "",
                            postal_code: "",
                          }));
                        }
                        setErrors({ ...errors, sub_district: "" });
                      }}
                      placeholder="Pilih Kelurahan"
                      value={formData.sub_district}
                      error={errors.sub_district}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 relative z-30">
                  <div className="flex-1">
                    <DynamicForm
                      label="RW"
                      isImportant
                      name="rw"
                      type="number"
                      placeholder="Masukkan RW"
                      value={formData.rw}
                      onChange={(value: string) => {
                        if (/^d{0,3}$/.test(value)) {
                          setFormData((prev) => ({ ...prev, rw: value }));
                          setErrors({ ...errors, rw: "" });
                        }
                      }}
                      error={errors.rw || ""}
                    />
                  </div>
                  <div className="flex-1">
                    <DynamicForm
                      label="RT"
                      isImportant
                      name="rt"
                      type="number"
                      placeholder="Masukkan RT"
                      value={formData.rt}
                      onChange={(value: string) => {
                        if (/^d{0,3}$/.test(value)) {
                          setFormData((prev) => ({ ...prev, rt: value }));
                          setErrors({ ...errors, rt: "" });
                        }
                      }}
                      error={errors.rt || ""}
                    />
                  </div>
                </div>

                {/* Exact Address */}
                <div className="mb-4">
                  <DynamicForm
                    label="Alamat Lengkap"
                    isImportant
                    name="actual_address"
                    type="textarea"
                    placeholder="Masukkan alamat lengkap..."
                    value={formData.actual_address}
                    onChange={(value: string) => {
                      const val = sanitizeAddress(value);
                      setFormData({ ...formData, actual_address: val });
                      setErrors({ ...errors, actual_address: "" });
                    }}
                    error={errors.actual_address || ""}
                    row={3}
                  />
                </div>

                {/* Patokan */}
                <div className="mb-4">
                  <DynamicForm
                    label="Patokan Alamat (opsional)"
                    isImportant={false}
                    name="notes"
                    type="text"
                    placeholder="Masukkan patokan alamat (jika ada)"
                    value={formData.notes || ""}
                    onChange={(value: string) => {
                      const val = sanitizeAlphanumeric(value);
                      setFormData({ ...formData, notes: val });
                    }}
                    error={""}
                  />
                </div>

                {/* Mengetahui IRA Dari Mana */}
                {mode === "register" && (
                  <>
                    <div className="mb-4 relative z-20">
                      <DynamicSelectForm
                        label="Mengetahui IRA Darimana"
                        isImportant={false}
                        name="social"
                        options={[{ label: "Lainnya", value: "Lainnya" }]}
                        onChange={() => {}}
                        placeholder="Pilih"
                        value="Lainnya"
                        error={""}
                      />
                    </div>
                    {/* Jelaskan Lebih Detail */}
                    <div className="mb-6">
                      <DynamicForm
                        label="Jelaskan Lebih Detail"
                        isImportant={false}
                        name="detail"
                        type="text"
                        placeholder="Tulis dari mana kamu tahu"
                        value={""}
                        onChange={(value: string) => {}}
                        error={""}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-8">
            {step === 1 && (
              <button
                type="button"
                onClick={handleNextStep1}
                className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-12 rounded-xl text-lg shadow-md transition-transform transform active:scale-95 duration-200"
              >
                Selanjutnya
              </button>
            )}
            {step === 2 && (
              <div className="flex gap-8">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setStep(1)}
                  className="flex items-center bg-white border border-primary text-primary hover:bg-red-50 disabled:border-gray-400 disabled:text-gray-400 font-bold py-3 px-6 rounded-xl text-lg shadow-sm transition-transform transform active:scale-95 duration-200"
                >
                  <IoArrowBackSharp className="mr-2" /> Step 1
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any)}
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-14 rounded-xl text-lg shadow-md transition-transform transform active:scale-95 duration-200"
                >
                  {isLoading ? "Memproses..." : "Kirim"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalRegisterSuccess && (
        <ModalTemplate
          closeModal={() => {
            setIsModalRegisterSuccess(false);
            if (pathname === "/auth/register") {
              window.history.replaceState(null, "", "/auth/register");
            }
            if (mode === "update_address") {
              window.location.href = "/customer-area";
            }
          }}
        >
          <ModalRegister isCovered={coveredAtSubmit ?? false} mode={mode} />
        </ModalTemplate>
      )}

      {isOpenModalReqLoc && status === "denied" && (
        <ModalTemplate
          closeModal={() => {
            setIsOpenModalReqLoc(false);
            toast(
              "Mohon izinkan akses lokasi browser dan gunakan browser Google Chrome",
            );
            router.push("/");
          }}
        >
          <div className="flex flex-col gap-6 md:px-6 z-60 bg-white">
            <h2 className="text-[#0D0E10] text-[24px]/[30px] font-bold text-center">
              Akses Lokasi Dibutuhkan
            </h2>
            <GeoPermissionGate
              onGotLocation={(lat, lng) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: String(lat),
                  longitude: String(lng),
                }));
              }}
            />
          </div>
        </ModalTemplate>
      )}
      {/* Interactive Map Modal */}
      {isOpenMapModal && (
        <ModalTemplate
          closeModal={() => setIsOpenMapModal(false)}
          classNameModal="max-w-4xl w-full p-4 overflow-hidden"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-center text-black">
              Sesuaikan Pin Point
            </h2>
            <p className="text-sm text-center text-gray-500">
              Arahkan Pin Lokasi ke Titik Alamat Anda yang tepat
            </p>
            <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow-sm relative border border-gray-200">
              <MapGeoapifyLite
                initialLatitude={Number(
                  tempMapPayload?.latitude || formData.latitude || 0,
                )}
                initialLongitude={Number(
                  tempMapPayload?.longitude || formData.longitude || 0,
                )}
                onPlaceChange={(p) => {
                  setTempMapPayload((prev: any) => ({
                    ...prev,
                    latitude: String(p.latitude),
                    longitude: String(p.longitude),
                  }));
                }}
                isInteractive={true}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-fit">
                <button
                  type="button"
                  onClick={() => {
                    if (tempMapPayload) {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: tempMapPayload.latitude,
                        longitude: tempMapPayload.longitude,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        latitude: "",
                      }));
                    }
                    setIsOpenMapModal(false);
                  }}
                  className="w-full md:w-[300px] bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-primary-dark transition text-sm cursor-pointer"
                >
                  Simpan Pin Point
                </button>
              </div>
            </div>
          </div>
        </ModalTemplate>
      )}

      {/* Confirmation Summary Modal */}
      {isSummaryModalOpen && (
        <ModalTemplate
          closeModal={() => setIsSummaryModalOpen(false)}
          classNameModal="w-[95%] max-w-2xl bg-white rounded-2xl"
        >
          <div className="p-2 md:p-6 pb-2">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-black">
              Konfirmasi Data Pelanggan
            </h2>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-sm">
              {/* Paket Terpilih */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Paket Dipilih</h4>
                <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <div className="flex gap-2 items-center">
                    <Image
                      src="/assets/Icons/lightning-red.svg"
                      width={16}
                      height={16}
                      alt="bolt"
                    />
                    <span className="font-bold text-gray-800">
                      {selectedPackage?.name || "Paket IRA"}
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded px-2 md:px-3 py-1 text-xs md:text-sm font-semibold text-gray-700">
                    Rp{convertToCurrency(selectedPackage?.price || 0)} / 30 Hari
                  </div>
                </div>
              </div>

              {/* Data Pribadi */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">
                  Informasi Data Pribadi
                </h4>
                <div className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-y-2 mt-2">
                  <span className="text-gray-500">Nama Pelanggan</span>
                  <span className="font-medium text-gray-900">
                    {formData.fullname}
                  </span>
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">
                    {formData.email || "-"}
                  </span>
                  <span className="text-gray-500">Nomor Handphone</span>
                  <span className="font-medium text-gray-900">
                    {formData.phone}
                  </span>
                </div>
              </div>

              {/* Lokasi Pemasangan */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">
                  Informasi Lokasi Pemasangan
                </h4>
                <div className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-y-2 mt-2">
                  <span className="text-gray-500">Provinsi</span>
                  <span className="font-medium text-gray-900">
                    {provinceOptions.find((o) => o.value === formData.province)
                      ?.label || "-"}
                  </span>

                  <span className="text-gray-500">Kota/Kabupaten</span>
                  <span className="font-medium text-gray-900">
                    {cityOptions.find((o) => o.value === formData.city)
                      ?.label || "-"}
                  </span>

                  <span className="text-gray-500">Kecamatan</span>
                  <span className="font-medium text-gray-900">
                    {districtOptions.find((o) => o.value === formData.district)
                      ?.label || "-"}
                  </span>

                  <span className="text-gray-500">Kelurahan</span>
                  <span className="font-medium text-gray-900">
                    {subdistrictOptions.find(
                      (o) => o.value === formData.sub_district,
                    )?.label || "-"}
                  </span>

                  <span className="text-gray-500">Kode Pos</span>
                  <span className="font-medium text-gray-900">
                    {formData.postal_code}
                  </span>

                  <span className="text-gray-500">Alamat Lengkap</span>
                  <span className="font-medium text-gray-900 leading-snug break-words">
                    {formData.actual_address || "-"}
                  </span>

                  <span className="text-gray-500">Patokan Alamat</span>
                  <span className="font-medium text-gray-900">
                    {formData.notes || "-"}
                  </span>
                </div>

                {/* Map Mini Preview */}
                <div className="mt-4 w-full h-[150px] rounded-xl overflow-hidden pointer-events-none opacity-80 border border-gray-200">
                  <MapGeoapify
                    mode={mode as any}
                    initialLatitude={Number(formData.latitude || 0)}
                    initialLongitude={Number(formData.longitude || 0)}
                    getAddress={() => {}}
                    isInteractive={false}
                  />
                </div>
              </div>

              {/* Tambahan Info */}
              {mode === "register" && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">
                    Informasi Tentang IRA
                  </h4>
                  <div className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-y-2 mt-2">
                    <span className="text-gray-500">Sumber Informasi</span>
                    <span className="font-medium text-gray-900">Lainnya</span>
                    <span className="text-gray-500">Detail Lebih Lanjut</span>
                    <span className="font-medium text-gray-900">
                      Tahu dari teman
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox Agreement */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <CheckboxAgreeForm
                value={agreement as any}
                onChange={() => setAgreement(!agreement)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="flex-1 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-red-50 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading || !agreement}
                className="flex-1 py-3 bg-primary disabled:bg-gray-400 text-white font-bold rounded-xl hover:bg-primary-dark transition"
              >
                Berlangganan Sekarang
              </button>
            </div>
          </div>
        </ModalTemplate>
      )}
    </div>
  );
}

export default RegistrationWizard;
