"use client";
import CheckboxAgreeForm from "@/app/_components/form/CheckboxAgreeForm";
import DynamicForm from "@/app/_components/form/DynamicForm";
import DynamicSelectForm from "@/app/_components/form/DynamicSelectForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { ReactSelectType } from "@/app/_shared/types/form";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
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
import { useRouter } from "next/navigation";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaLocationDot,
  FaTrash,
} from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
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
import Image from "next/image";
import bannerImageNoCovered from "@/public/assets/Images/banner-out-coverage.png";
import bannerImageCovered from "@/public/assets/Images/banner-in-coverage.png";

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

function RegistrationForm({
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

  const [formData, setFormData] = useState<FormType>({
    ...initialFormData,
    ...(initialData || {}),
    ...(initialData?.notes !== undefined ? { notes: defaultNotes } : {}),
  });

  const [isAutoFilling, setIsAutoFilling] = useState(false);

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
  const [isCheckCoverage, setIsCheckCoverage] = useState<boolean>(false);
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

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isAddressMapped, setIsAddressMapped] = useState(false);
  const [geocodeCooldown, setGeocodeCooldown] = useState(0);
  const lastGeocodedAddressRef = useRef("");

  const token = getCookie("token-ira");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (geocodeCooldown > 0) {
      timer = setInterval(() => {
        setGeocodeCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [geocodeCooldown]);

  useBrowserDetection();

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

      if (initialData.latitude && initialData.longitude) {
        setIsAddressMapped(true);
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
        const options: ReactSelectType[] = ((res.data?.data ?? []) || [])
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
          "Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.",
        );
      } else {
        toast.error("Gagal mengambil lokasi.");
      }
    }
  };

  const handleGeocode = async () => {
    if (isGeocoding || geocodeCooldown > 0) return;

    if (!formData.actual_address) {
      setErrors((prev) => ({
        ...prev,
        actual_address: "Alamat lengkap harus diisi",
      }));
      toast.error("Alamat lengkap harus diisi");
      return;
    }

    const currentAddress = formData.actual_address?.trim();
    if (currentAddress === lastGeocodedAddressRef.current) {
      setIsAddressMapped(true);
      return;
    }

    setIsGeocoding(true);
    setGeocodeCooldown(5);

    try {
      const provLabel =
        provinceOptions.find((o) => o.value === formData.province)?.label || "";
      const cityLabel =
        cityOptions.find((o) => o.value === formData.city)?.label || "";
      const districtLabel =
        districtOptions.find((o) => o.value === formData.district)?.label || "";
      const subDistrictLabel =
        subdistrictOptions.find((o) => o.value === formData.sub_district)
          ?.label || "";

      const addressComponents = [
        formData.actual_address,
        subDistrictLabel,
        districtLabel,
        cityLabel,
        provLabel,
        formData.postal_code,
        "Indonesia",
      ]
        .filter(Boolean)
        .join(", ");

      const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressComponents)}&key=${GOOGLE_KEY}`,
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        lastGeocodedAddressRef.current = currentAddress; // Only cache on success
        const { lat, lng } = data.results[0].geometry.location;
        setFormData((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
          address_gmaps: data.results[0],
        }));
        setIsAddressMapped(true);
        toast.success(
          "Lokasi ditemukan! Titik lokasi telah diperbarui pada peta di bawah.",
        );
      } else {
        setGeocodeCooldown(0);
        const isAuthError = data.status === "REQUEST_DENIED";

        if (!isAuthError) {
          setIsAddressMapped(true); // Still show map so user can set manually if not an auth error

          // Try to get current position as fallback if geocoding failed
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              const { latitude, longitude } = position.coords;
              setFormData((prev) => ({
                ...prev,
                latitude: String(latitude),
                longitude: String(longitude),
              }));
            });
          }
        }

        toast.error(
          isAuthError
            ? "API Key Google Maps Anda terblokir/dibatasi (IP/Referer). Silakan cek Google Cloud Console atau atur titik manual di peta."
            : data.error_message ||
                "Gagal mendapatkan koordinat otomatis. Silakan atur titik di peta secara manual.",
          {
            duration: 10_000,
          },
        );
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      toast.error("Terjadi kesalahan saat memproses alamat.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleClearAddress = () => {
    setFormData((prev) => ({
      ...prev,
      actual_address: "",
      latitude: undefined,
      longitude: undefined,
      address_gmaps: undefined,
    }));
    setIsAddressMapped(false);
    lastGeocodedAddressRef.current = "";
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

    if (!agreement) {
      toast.error("Anda harus menyetujui syarat & ketentuan");
      setIsLoading(false);
      return;
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
      try {
        const addressArray = [formData.address_gmaps];
        const type =
          userInfo?.status === "canceled-instalation"
            ? "tipe-cancel"
            : userInfo?.status === "inactive"
              ? "tipe inactive"
              : "tipe regist baru";

        const body: any = {
          ...(coveredNow && { package_id: formData.package_id }),
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
          res = coveredNow
            ? await registerUser(body)
            : await requestCoverage({
                ...body,
                phone_number_verified: otpStatus === "valid",
              });
        } else if (mode === "update_address") {
          res = coveredNow
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

        setIsModalRegisterSuccess(true);
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
  }

  useEffect(() => {
    console.log(formData);
    // console.log("mitra IDs: ", mitraID);
    // console.log("bts IDs: ", btsID);
    console.log("is covered: ", isCovered);
    // }, [btsID, formData, mitraID, isCovered]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

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

  return (
    <div className="container mx-auto">
      <h1 className="text-center sm:text-[32px] text-2xl text-old-primary font-bold">
        <span>{title}</span>
      </h1>

      <form onSubmit={handleSubmit} className="mt-7">
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-7">
          {/* Nama */}
          <div className="max-md:col-span-2 col-span-1">
            <DynamicForm
              label="Nama Lengkap"
              isImportant
              name="fullname"
              disabled={mode === "reregister"}
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
              disabled={mode === "reregister"}
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

          {/* Nomor Handphone + Button OTP */}
          <div className="max-md:col-span-2 col-span-1">
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
            {mode === "register" ? (
              <p className="text-xs text-muted mt-1">
                *Pastikan nomor yang Anda masukkan benar dan aktif
              </p>
            ) : mode === "update_address" ? (
              <p className="text-xs text-muted mt-1">
                {/* *Pastikan nomor Anda sudah benar dan aktif */}
              </p>
            ) : (
              <p className="text-xs text-muted mt-1">
                *Nomor yang sama akan digunakan untuk berlangganan kembali
              </p>
            )}
          </div>

          {/* OTP */}
          {mode === "register" && (
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

              <p
                className={`text-primary mt-1 text-sm italic ${otpStatus === "verifying" ? "block" : "hidden"}`}
              >
                <span>Memverifikasi OTP...</span>
              </p>

              <p
                className={`text-green-600 mt-1 text-sm items-center gap-1 ${otpStatus === "valid" ? "flex" : "hidden"}`}
              >
                <FaCircleCheck className="text-green-600" />
                <span>
                  OTP berhasil diverifikasi! Anda bisa melanjutkan registrasi.
                </span>
              </p>

              <p
                className={`text-red-500 mt-1 text-sm items-center gap-1 ${otpStatus === "invalid" && !errors.otp ? "flex" : "hidden"}`}
              >
                <FaCircleExclamation className="text-red-500" />
                <span>Kode OTP tidak valid atau sudah kedaluwarsa.</span>
              </p>

              <p
                className={`text-red-500 mt-1 text-sm items-center gap-1 ${errors.otp ? "flex" : "hidden"}`}
              >
                <FaCircleExclamation className="text-red-500" />
                <span>{errors.otp}</span>
              </p>
            </div>
          )}

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
                    // postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    province: "",
                    city: "",
                    district: "",
                    sub_district: "",
                    // postal_code: "",
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
                    // postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    city: "",
                    district: "",
                    sub_district: "",
                    // postal_code: "",
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
                    // postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    district: "",
                    sub_district: "",
                    // postal_code: "",
                  }));
                }
                setErrors({ ...errors, district: "" });
              }}
              isClearable
              placeholder={`${
                !formData.city
                  ? "Pilih Kota/Kab Terlebih Dahulu"
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
                    // postal_code: "",
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    sub_district: "",
                    // postal_code: "",
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

          {/* Alamat Lengkap */}
          {(mode === "register" || mode === "update_address") && (
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
                placeholder="Masukkan Alamat Lengkap sesuai Lokasi Pemasangan Anda"
                error={errors.actual_address}
              />

              {/* Button Konfirmasi / Hapus */}
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={
                    isGeocoding ||
                    geocodeCooldown > 0 ||
                    !formData.actual_address ||
                    formData.actual_address.length < 10
                  }
                  className="flex-1 whitespace-nowrap bg-primary text-white font-bold p-2 border-2 border-transparent rounded-lg hover:bg-dark-primary-2 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeocoding ? (
                    <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                  ) : (
                    <FaLocationDot size={18} />
                  )}
                  {geocodeCooldown > 0
                    ? `Tunggu ${geocodeCooldown}s`
                    : "Konfirmasi Alamat"}
                </button>
                <button
                  type="button"
                  onClick={handleClearAddress}
                  className="flex-1 whitespace-nowrap p-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  Hapus
                </button>
              </div>

              {/* Map Preview (Read-only) */}
              {isAddressMapped && geocodeCooldown === 0 && (
                <div
                  className="mt-4 cursor-pointer relative group overflow-hidden rounded-xl border-2 border-gray-200"
                  onClick={() => setIsMapModalOpen(true)}
                >
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <span className="bg-white text-primary px-4 py-2 rounded-lg font-bold shadow-xl border border-primary">
                      Klik untuk Atur/Ubah Titik
                    </span>
                  </div>
                  <div className="h-[250px] overflow-hidden">
                    {" "}
                    {/* Size limited for preview */}
                    <MapGeoapify
                      mode={mode}
                      initialLatitude={
                        formData.latitude ? Number(formData.latitude) : 0
                      }
                      initialLongitude={
                        formData.longitude ? Number(formData.longitude) : 0
                      }
                      isInteractive={false}
                      showSearch={false}
                      showClose={false}
                      getAddress={() => {}}
                      height="250px"
                    />
                  </div>
                  <div className="p-3 bg-white border-t border-primary/10">
                    <p className="text-sm mt-1">
                      *Klik peta untuk menyesuaikan titik lokasi pemasangan Anda
                    </p>
                  </div>
                </div>
              )}

              {/* Status Coverage */}
              <div className="mt-4">
                <p
                  className={`text-gray-500 items-center gap-2 text-sm ${isCheckCoverage ? "flex" : "hidden"}`}
                >
                  <span className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
                  <span>Mengecek jangkauan...</span>
                </p>
                <p
                  className={`text-green-primary items-center gap-1 text-sm ${isCovered && !isCheckCoverage ? "flex" : "hidden"}`}
                >
                  <FaCircleCheck className="text-green-primary" />
                  <span>
                    Selamat! Alamat Anda berada di dalam jangkauan kami.
                  </span>
                </p>
                <p
                  className={`animate-bounce text-red-primary items-center gap-1 text-sm ${!isCovered && !isCheckCoverage ? "flex" : "hidden"}`}
                >
                  <FaCircleExclamation className="text-red-primary w-6 h-6 sm:w-4 sm:h-4" />
                  <span>
                    Lokasi Anda belum berada di jangkauan area kami, dan kami
                    sedang menuju ke daerah Anda.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Patokan Alamat */}
          {(mode === "register" || mode === "update_address") && (
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
          )}

          {/* Paket Selection */}
          <div className="col-span-2">
            {isCheckCoverage ? (
              <div className="">
                <div className="hidden md:block">
                  <PackageCardMobileSkeletonList count={2} />
                </div>
                <div className="block md:hidden">
                  <PackageCardMobileSkeletonList count={1} />
                </div>
              </div>
            ) : isCovered ? (
              <div className="">
                {showBannerCovered && (
                  <Image
                    src={bannerImageCovered}
                    className="w-full hidden sm:block my-6"
                    alt="banner-in-coverage"
                  />
                )}

                <p className="text-xl sm:text-2xl text-old-primary font-medium mb-3">
                  Paket yang tersedia*
                </p>

                {isLoadingPackage ? (
                  <PackageCardMobileSkeletonList count={2} />
                ) : packages?.length ? (
                  <div className="md:grid max-sm:p-1 grid-cols-1 lg:grid-cols-2 gap-4 max-sm:space-y-6">
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
                  <div className="text-primary-text">
                    Belum ada Daftar Paket yang tersedia untuk wilayah Anda,
                    pastikan titik alamat Anda pada peta sudah benar.
                  </div>
                )}

                {errors.package_id && (
                  <p className="text-red-500 animate-bounce mt-3 text-sm flex items-center gap-1">
                    <FaCircleExclamation className="text-red-500" />
                    <span>{errors.package_id}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="my-6">
                <Image
                  src={bannerImageNoCovered}
                  className="w-full hidden sm:block"
                  alt="banner-no-coverage"
                />
                <div className="block sm:hidden bg-[#FEFCE8] py-2 px-3 border border-[#A16207] rounded-lg">
                  <p className="text-xs text-[#A16207]">
                    <strong>Layanan di areamu segera hadir:</strong> Jangan
                    khawatir! Silakan daftar sekarang agar akunmu tersimpan di
                    sistem kami.
                  </p>
                </div>
              </div>
            )}
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
          <div className="flex justify-center items-center gap-2 w-full">
            {showCancelButton && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="border-2 w-full font-bold sm:p-4 p-2 border-primary text-primary hover:bg-red-50 rounded-xl"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isValid}
              className={`sm:py-4 p-2  ${
                mode === "register" ? "w-1/2" : "px-8"
              } font-bold text-white ${
                isValid
                  ? "bg-slate-400 cursor-not-allowed!"
                  : "bg-primary hover:bg-dark-primary-2 cursor-pointer"
              } text-xl rounded-xl ${showCancelButton ? "w-full" : "mx-auto"} `}
            >
              <div
                className={`flex items-center justify-center gap-2 ${isLoading ? "" : "hidden"}`}
              >
                <div className="loading w-5 h-5"></div>
                <span className="italic text-white">Loading...</span>
              </div>
              <span className={isLoading ? "hidden" : ""}>
                {mode === "register"
                  ? "Registrasi"
                  : mode === "reregister"
                    ? "Berlangganan Kembali"
                    : "Konfirmasi"}
              </span>
            </button>
          </div>

          {status === "denied" && (
            <p className="mx-auto text-muted text-sm">
              *Pastikan anda sudah mengizinkan akses lokasi, lalu refresh
            </p>
          )}
        </div>

        {mode === "register" && (
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
        )}
      </form>

      {isModalRegisterSuccess && (
        <ModalTemplate
          closeModal={() => {
            setIsModalRegisterSuccess(false);
            if (mode === "update_address") {
              window.location.href = "/customer-area";
            }
            setCoveredAtSubmit(null);
          }}
          classNameModal="w-[90%] sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 px-5 py-10"
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
          <div className="p-6 mt-6">
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

      {isMapModalOpen && (
        <ModalTemplate
          closeModal={() => setIsMapModalOpen(false)}
          width="max-w-4xl"
          classNameModal="!rounded-xl overflow-hidden"
        >
          <div className="flex flex-col bg-white relative rounded-xl overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Konfirmasi Titik Lokasi
                </h3>
                <p className="mt-4 text-sm text-gray-500">
                  Geser pin pada peta untuk menyesuaikan lokasi pemasangan Anda
                </p>
              </div>
            </div>

            <div className="flex-1 relative min-h-[50vh] sm:min-h-[60vh] p-2">
              <MapGeoapify
                mode={mode}
                initialLatitude={
                  formData.latitude ? Number(formData.latitude) : 0
                }
                initialLongitude={
                  formData.longitude ? Number(formData.longitude) : 0
                }
                showSearch={false}
                showClose={false}
                getAddress={() => {}}
                onPlaceChange={(p) => {
                  setFormData((prev) => ({
                    ...prev,
                    address_gmaps: p.raw_result,
                    latitude: String(p.latitude),
                    longitude: String(p.longitude),
                  }));
                }}
              />
            </div>

            <div className="px-2 py-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="flex-1 py-3 bg-white cursor-pointer border-2 border-primary text-primary font-bold rounded-xl hover:bg-red-50 shadow-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMapModalOpen(false);
                  toast.success("Titik lokasi dikonfirmasi!");
                }}
                className="flex-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-dark-primary-2 shadow-lg"
              >
                Simpan Titik Lokasi
              </button>
            </div>
          </div>
        </ModalTemplate>
      )}
    </div>
  );
}

export default RegistrationForm;
