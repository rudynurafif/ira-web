"use client";
import CheckboxAgreeForm from "@/app/_components/form/CheckboxAgreeForm";
import DynamicForm from "@/app/_components/form/DynamicForm";
import DynamicSelectForm from "@/app/_components/form/DynamicSelectForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { ReactSelectType } from "@/app/_shared/types/form";
import Link from "next/link";
import { FormEvent, useEffect, useState, useRef } from "react";
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
  handleDownloadClick,
} from "@/app/_shared/utils";
import { useRouter, usePathname } from "next/navigation";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaListUl,
  FaLocationDot,
  FaListCheck,
} from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import MapMapbox from "@/app/_components/form/MapMapbox";
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
import MapMapboxLite from "@/app/_components/form/MapMapboxLite";
import Image from "next/image";
import bannerImageNoCovered from "@/public/assets/Images/banner-out-coverage.png";

const initialFormData: FormType = {
  package_id: "",
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
  // Ref untuk menandai apakah kode pos baru saja didapat dari Map
  // (Gunanya biar Map GAK LONCAT balik ke tengah kecamatan setelah kita geser pin-nya)
  const lastPostcodeFromMap = useRef<string | null>(null);
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
      step === 2 &&
      (!formData.latitude || formData.latitude === "0")
    ) {
      handleRequestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, step]);

  const router = useRouter();
  const pathname = usePathname();

  const STORAGE_KEY = `otp:register:phone`;
  const PERSIST_KEY = `registration_wizard_data`;

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

  // -- Persistence Logic --
  // 1. Load data from localStorage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem(PERSIST_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.step) setStep(parsed.step);
        if (parsed.selectedPackage) {
          setSelectedPackage(parsed.selectedPackage);
        }
        if (parsed.otpStatus) {
          setOtpStatus(parsed.otpStatus);
        }
      } catch (err) {
        console.error("Failed to restore registration data", err);
      }
    }
  }, []);

  // 2. Save data to localStorage on Change
  useEffect(() => {
    const dataToSave = { formData, step, selectedPackage, otpStatus };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(dataToSave));
  }, [formData, step, selectedPackage, otpStatus, PERSIST_KEY]);

  useEffect(() => {
    if (isModalRegisterSuccess && pathname === "/auth/register") {
      // Masukkan ke history buat GA
      window.history.pushState(null, "", "/auth/register/popup");

      // Setelah 5 detik, kembalikan ke URL normal agar kalau di-refresh gak 404
      const timeout = setTimeout(() => {
        window.history.replaceState(null, "", "/auth/register");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isModalRegisterSuccess, pathname]);

  // 3. Clear Storage helper
  const clearPersistance = () => {
    localStorage.removeItem(PERSIST_KEY);
  };

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
        setIsCheckCoverage(false); // Ensure loader is off
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

  // Debounce Kode Pos -> Autofill Lokasi (Koordinat Map)
  useEffect(() => {
    // Jalankan jika panjang karakter 3 s/d 5
    if (
      !formData.postal_code ||
      formData.postal_code.length < 3 ||
      formData.postal_code.length > 5
    )
      return;

    // JANGAN JALANKAN jika Kode POS ini dikirim oleh Map (Biar Gak Loncat Balik)
    if (formData.postal_code === lastPostcodeFromMap.current) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoadingArea(true);
        if (step === 2) {
          toast(
            "Pastikan Pin Lokasi sudah sesuai dengan alamat pemasangan Anda",
            { icon: "📍" },
          );
        }

        // Panggil Mapbox Geocoding V6 utk dapetin lat/lng (centering map) berdasarkan kode pos
        const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        // Hardcode proximity sesuai instruksi user
        const mapboxUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${formData.postal_code}&proximity=-73.990593%2C40.740121&country=id&access_token=${MAPBOX_TOKEN}`;

        const resMap = await fetch(mapboxUrl);
        const dataMap = await resMap.json();
        if (dataMap?.features?.length > 0) {
          // Mapbox V6 geometry.coordinates: [longitude, latitude]
          const [lon, lat] = dataMap.features[0].geometry.coordinates;
          if (lat && lon) {
            const feature = dataMap.features[0];
            setFormData((prev) => ({
              ...prev,
              latitude: String(lat),
              longitude: String(lon),
              address_raw: feature,
            }));

            setTempMapPayload((prev: any) => ({
              ...prev,
              latitude: String(lat),
              longitude: String(lon),
              address_raw: feature,
            }));
          }
        }
      } catch (e) {
        console.error("Gagal mendeteksi koordinat kode pos", e);
      } finally {
        setIsLoadingArea(false);
      }
    }, 1_500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    console.log("masuk");
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

    // if (!formData.rt || formData.rt === "0") {
    //   errors.rt = "RT harus diisi";
    // }

    // if (!formData.rw || formData.rw === "0") {
    //   errors.rw = "RW harus diisi";
    // }

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
      toast.error(
        "Anda harus menyetujui Syarat dan Ketentuan serta Kebijakan Privasi yang berlaku",
      );
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
          ...(formData.rw && { rw: formData.rw }),
          ...(formData.rt && { rt: formData.rt }),
          ...(formData.address_raw && { address: [formData.address_raw] }),
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
        setOtpStatus("idle");
        clearPersistance(); // Clear on success
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
    console.log("form data", formData);
    // console.log("mitra IDs: ", mitraID);
    // console.log("bts IDs: ", btsID);
    // console.log(isCovered);
    // console.log("error", errors);
  }, [btsID, formData, mitraID, isCovered, errors]);

  function resetForm() {
    setStep(1);
    setFormData(initialFormData);
    clearPersistance(); // Clear on reset
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
  }, [isLoading, formData, step]);

  // const isPasswordMismatch =
  //   Boolean(formData.password) &&
  //   Boolean(formData.confirm_password) &&
  //   formData.password !== formData.confirm_password;

  const isInvalid =
    isLoading || status === "denied" || isCheckCoverage || isLoadingPackage;

  const handleNextStep1 = () => {
    // setStep(2);

    let newErrors = { ...errors };
    let hasError = false;

    if (!formData.fullname || !formData.fullname.trim()) {
      newErrors.fullname = "Nama Lengkap wajib diisi.";
      hasError = true;
    } else {
      delete newErrors.fullname;
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Nomor Ponsel wajib diisi.";
      hasError = true;
    } else {
      delete newErrors.phone;
    }

    if (
      formData.email &&
      formData.email.trim() &&
      !EMAIL_REGEX.test(formData.email)
    ) {
      newErrors.email = "Format email tidak valid.";
      hasError = true;
    } else {
      delete newErrors.email;
    }

    if (otpStatus !== "valid" && !initialData?.phone) {
      newErrors.otp = "OTP belum terverifikasi";
      toast.error("Silakan selesaikan verifikasi OTP terlebih dahulu.");
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scrollToFirstError(newErrors);
    }
  };

  const handleClickBanner = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isApple = /mac|iphone|ipad|ipod/.test(ua);
    handleDownloadClick(isApple ? "apple" : "google");

    if (token && (mode === "reregister" || mode === "update_address")) {
      window.location.href = "/customer-area";
    } else {
      deleteCookie("token-ira");
      window.location.href = "/auth/login";
    }
  };

  const handleCloseModalSuccess = () => {
    setIsModalRegisterSuccess(false);
    if (pathname === "/auth/register") {
      window.history.replaceState(null, "", "/auth/register");
    }
    if (mode === "update_address") {
      window.location.href = "/customer-area";
    }
    setCoveredAtSubmit(null);
  };

  const handleProceedToSummary = () => {
    let newErrors: { [key: string]: string } = { ...errors };
    let hasError = false;

    // Validasi field wajib Step 2
    if (!formData.province) {
      newErrors.province = "Provinsi harus dipilih";
      hasError = true;
    }
    if (!formData.city) {
      newErrors.city = "Kota harus dipilih";
      hasError = true;
    }
    if (!formData.district) {
      newErrors.district = "Kecamatan harus dipilih";
      hasError = true;
    }
    if (!formData.sub_district) {
      newErrors.sub_district = "Kelurahan harus dipilih";
      hasError = true;
    }
    if (!formData.postal_code) {
      newErrors.postal_code = "Kode POS harus diisi";
      hasError = true;
    }
    if (!formData.actual_address || !formData.actual_address.trim()) {
      newErrors.actual_address = "Alamat lengkap harus diisi";
      hasError = true;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error("Silakan tentukan titik lokasi pemasangan Anda pada peta");
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      // Munculkan toast rangkuman error
      toast.error(buildErrorToast(newErrors));

      // Tunggu render sebentar agar elemen error muncul di DOM
      setTimeout(() => {
        scrollToFirstError(newErrors);
      }, 50);
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full relative text-black pt-2 md:pt-4 flex flex-col items-center pb-20">
      {isLoading && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white bg-opacity-70">
          <Loader />
        </div>
      )}

      {/* Title */}
      <div className="w-full flex justify-center mb-4 md:mb-5">
        <h1 className="text-3xl md:text-[40px] lg:text-[48px] text-white font-extrabold text-center drop-shadow-md">
          Registrasi IRA
        </h1>
      </div>

      {/* Stepper */}
      <div className="flex flex-col items-center md:mb-0 w-full px-1 sm:px-2 relative z-20">
        <div className="bg-white rounded-t-[30px] flex items-center justify-center px-2 sm:px-4 md:px-5 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.15)] gap-1.5 sm:gap-4 md:gap-5 border-2 border-b-0 border-[#A50E0E]">
          <span className="font-bold text-black text-[11px] sm:text-base whitespace-nowrap pl-1 md:pl-2">
            Tahap {step}{" "}
            <span className="font-medium text-gray-500 text-[10px] sm:text-base">
              dari 3
            </span>
          </span>
          <div className="flex items-center gap-1 sm:gap-2 mr-1">
            {/* Step 1 */}
            <div
              onClick={() => {
                if (step > 1) setStep(1);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 ${
                step >= 1
                  ? "bg-[#b61515] text-white shadow-md cursor-pointer active:scale-90"
                  : "bg-gray-400 text-white"
              }`}
              title="Formulir Data"
            >
              <FaListUl className="text-xs sm:text-base" />
            </div>

            <div
              className={`w-4 sm:w-8 md:w-10 h-[2px] transition-colors duration-300 ${step >= 2 ? "bg-[#b61515]" : "bg-gray-300"}`}
            />

            {/* Step 2 */}
            <div
              onClick={() => {
                if (step === 1) handleNextStep1();
                else if (step > 2) setStep(2);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 ${
                step >= 1 // Selalu cursor-pointer karena step 1 pasti dilewati
                  ? "bg-[#b61515] text-white shadow-md cursor-pointer active:scale-90"
                  : "bg-gray-400 text-white"
              } ${step < 2 ? "opacity-50" : ""}`}
              title="Peta Lokasi"
            >
              <FaLocationDot className="text-xs sm:text-base" />
            </div>

            <div
              className={`w-4 sm:w-8 md:w-10 h-[2px] transition-colors duration-300 ${step >= 3 ? "bg-[#b61515]" : "bg-gray-300"}`}
            />

            {/* Step 3 */}
            <div
              onClick={() => {
                if (step === 2) handleProceedToSummary();
                // Jika ingin user bisa loncat dari 1 ke 3 jika sudah valid, bisa dikembangkan lagi
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 ${
                step >= 2
                  ? "bg-[#b61515] text-white shadow-md cursor-pointer active:scale-90"
                  : "bg-gray-400 text-white"
              } ${step < 3 ? "opacity-30" : ""}`}
              title="Ringkasan & kirim"
            >
              <FaListCheck className="text-xs sm:text-base" />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[1536px] rounded-3xl md:rounded-[40px] bg-[#a80f0f] shadow-[0_20px_60px_rgba(164,18,18,0.4)] overflow-visible relative flex flex-col lg:flex-row h-auto lg:h-[70vh] min-h-[500px] border-2 border-white mb-10"
      >
        {/* Person */}
        <div
          className="w-full lg:w-[60%] left-[5%] sm:left-[3%] relative flex justify-center items-end min-h-[250px] md:min-h-[300px] lg:min-h-[500px] max-lg:mt-40"
          style={{ clipPath: "inset(-200% -200% 0 -200%)" }}
        >
          <div className="absolute inset-x-0 bottom-0 w-full flex justify-end md:justify-center lg:justify-end items-end h-full z-30 pointer-events-none">
            <Image
              src={`/assets/Images/person-reg-${step}.png`}
              className="object-contain object-bottom  scale-170 lg:scale-120 transform origin-bottom md:translate-y-[15px] lg:translate-x-[-10px] lg:translate-y-[20px] xl:translate-x-[-15px] xl:translate-y-[24px] 2xl:translate-x-[-20px] 2xl:translate-y-[28px] drop-shadow-[5px_0_15px_rgba(0,0,0,0.5)] z-30"
              alt="Person"
              fill
              priority
            />
          </div>
        </div>

        <div
          className={`w-full ${step === 2 ? "max-sm:mt-[-10%]" : "max-sm:mt-[-25%]"} lg:w-[60%] xl:w-[58%] 2xl:w-[55%] flex justify-center items-start p-6 max-lg:pt-0 z-25 relative`}
        >
          <div className="bg-white rounded-[24px] md:rounded-[32px] w-full max-h-full min-h-[400px] shadow-2xl p-4 sm:p-6 flex flex-col justify-start relative border border-white/50 overflow-y-auto custom-scrollbar">
            {step === 1 && (
              <div className="animate-in fade-in duration-500 w-full h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-6 text-black">
                    Silakan Isi Data Pribadi Kamu
                  </h3>

                  <div className="flex flex-col gap-4">
                    {/* Row 1 Col 1 */}
                    <div>
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
                      />
                    </div>
                    {/* Row 1 Col 2 */}
                    <div>
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
                      />
                    </div>
                    {/* Row 2 Col 1 */}
                    <div className="pt-2">
                      <PhoneOTPForm
                        storageKey={`otp:register:phone`}
                        otpDurationSec={0}
                        label="Nomor Handphone"
                        name="phone"
                        mode="register"
                        inputMode="numeric"
                        isImportant
                        isDisabled={
                          otpStatus === "valid" || mode !== "register"
                        }
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
                    {/* Row 2 Col 2 */}
                    {/* OTP */}
                    {mode === "register" && (
                      <div className="pt-2">
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
                            if (errors.otp)
                              setErrors((e) => ({ ...e, otp: "" }));
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
                            OTP berhasil diverifikasi! Anda bisa melanjutkan
                            registrasi.
                          </span>
                        </p>

                        <p
                          className={`text-red-500 mt-1 text-sm items-center gap-1 ${otpStatus === "invalid" && !errors.otp ? "flex" : "hidden"}`}
                        >
                          <FaCircleExclamation className="text-red-500" />
                          <span>
                            Kode OTP tidak valid atau sudah kedaluwarsa.
                          </span>
                        </p>

                        <p
                          className={`text-red-500 mt-1 text-sm items-center gap-1 ${errors.otp ? "flex" : "hidden"}`}
                        >
                          <FaCircleExclamation className="text-red-500" />
                          <span>{errors.otp}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="bg-primary hover:bg-dark-primary-2 text-white font-bold py-3 px-12 rounded-xl text-sm md:text-base shadow-md transition-transform transform active:scale-95 duration-200 w-full md:w-auto"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in duration-500 w-full h-full pt-2 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-6 text-black">
                    Silakan Isi Alamat Lengkap
                  </h3>

                  {/* Package Selector */}
                  {isCovered ? (
                    <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className="text-sm font-semibold mb-2 text-black">
                        Paket yang tersedia
                        <span className="text-primary">*</span>
                      </p>

                      {isLoadingPackage ? (
                        <PackageCardMobileSkeletonList count={2} />
                      ) : (
                        packages?.length && (
                          <div className="max-w-md grid max-sm:p-1 grid-cols-1  gap-4 max-sm:space-y-4">
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
                        )
                      )}

                      {errors.package_id && (
                        <p className="text-primary text-xs flex items-center gap-1 mt-2">
                          <FaCircleExclamation />
                          <span>{errors.package_id}</span>
                        </p>
                      )}
                    </div>
                  ) : null}

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
                        isDisabled={!formData.province}
                        placeholder={`${
                          !formData.province
                            ? "Pilih Provinsi  Dahulu"
                            : "Pilih Kota/Kabupaten"
                        }`}
                        value={formData.city}
                        error={errors.city}
                      />
                    </div>
                  </div>

                  {/* Kecamatan Kelurahan */}
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
                        isDisabled={!formData.city}
                        placeholder={`${
                          !formData.city
                            ? "Pilih Kota/Kab  Dahulu"
                            : "Pilih Kecamatan"
                        }`}
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
                        isDisabled={!formData.district}
                        placeholder={`${
                          !formData.district
                            ? "Pilih Kecamatan  Dahulu"
                            : "Pilih Kelurahan"
                        }`}
                        value={formData.sub_district}
                        error={errors.sub_district}
                      />
                    </div>
                  </div>

                  {/* RW RT */}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-4 relative z-30">
                    {/* Kode Pos Area */}
                    <div className="flex-1">
                      <DynamicForm
                        label="Kode POS"
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
                        placeholder="Masukkan Kode POS"
                        value={formData.postal_code}
                        error={errors.postal_code || ""}
                        disabled={Boolean(
                          mode === "update_address" &&
                          initialData?.postal_code &&
                          initialData?.postal_code === formData.postal_code,
                        )}
                      />
                      {isLoadingArea && (
                        <div className="absolute top-[45px] right-4 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>

                    {/* RT */}
                    <div className="flex-1">
                      <DynamicForm
                        label="RT (Opsional)"
                        isImportant={false}
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

                    {/* RW */}
                    <div className="flex-1">
                      <DynamicForm
                        label="RW (Opsional)"
                        isImportant={false}
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
                  </div>

                  {/* Exact Address */}
                  <div className="mb-4">
                    <DynamicForm
                      label="Alamat Lengkap"
                      isImportant
                      name="actual_address"
                      type="textarea"
                      placeholder="Masukkan alamat lengkap pemasangan Anda..."
                      value={formData.actual_address}
                      onChange={(value: string) => {
                        const val = sanitizeAddress(value);
                        setFormData({ ...formData, actual_address: val });
                        setErrors({ ...errors, actual_address: "" });
                      }}
                      error={errors.actual_address || ""}
                      rows={3}
                    />
                  </div>

                  {/* Map Area */}
                  <div>
                    <div className="mb-6 relative z-10 space-y-2">
                      <p className="font-bold text-sm text-black mb-2">
                        Arahkan Pin Lokasi ke Titik Alamat Pemasangan Anda
                      </p>
                      <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm relative border border-gray-200">
                        <div className="w-full h-full pointer-events-none">
                          <MapMapbox
                            initialLatitude={Number(formData.latitude || 0)}
                            initialLongitude={Number(formData.longitude || 0)}
                            isInteractive={false}
                          />
                        </div>
                        {/* The "Sesuaikan Pin Point" Floating Red Button from design mockup */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-fit">
                          <button
                            type="button"
                            onClick={() => {
                              setTempMapPayload({
                                latitude: formData.latitude,
                                longitude: formData.longitude,
                                address_gmaps: formData.address_gmaps,
                                postcode: formData.postal_code,
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
                  {/* {mode === "register" && (
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
                      <div className="mb-6">
                        <DynamicForm
                          label="Jelaskan Lebih Detail"
                          isImportant={false}
                          name="detail"
                          type="textarea"
                          placeholder="Jelaskan dari mana kamu tahu"
                          value={""}
                          onChange={(value: string) => {}}
                          error={""}
                          rows={3}
                        />
                      </div>
                    </>
                  )} */}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex-1 bg-white border-2 border-primary text-primary hover:bg-red-50 font-bold py-3 px-4 rounded-xl text-sm md:text-base shadow-sm transition-transform active:scale-95 duration-200"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToSummary}
                    className="flex-1 bg-primary hover:bg-dark-primary-2 text-white font-bold py-3 px-4 rounded-xl text-sm md:text-base shadow-md transition-transform active:scale-95 duration-200"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in duration-500 w-full h-full flex flex-col justify-between">
                <div>
                  <div className="">
                    <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-black">
                      Konfirmasi Data Pelanggan
                    </h2>

                    <div className="space-y-6 text-sm">
                      {/* Paket Terpilih (Hanya tampil jika tercover) */}
                      {isCovered && selectedPackage && (
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2">
                            Paket Dipilih
                          </h4>
                          <div className="max-w-md pointer-events-none">
                            <PackageCardMobile
                              key={selectedPackage.id}
                              pkg={selectedPackage}
                              selected={true}
                              onSelect={() => {}}
                              convertToCurrency={convertToCurrency}
                            />
                          </div>
                        </div>
                      )}

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
                            {provinceOptions.find(
                              (o) => o.value === formData.province,
                            )?.label || "-"}
                          </span>

                          <span className="text-gray-500">Kota/Kabupaten</span>
                          <span className="font-medium text-gray-900">
                            {cityOptions.find((o) => o.value === formData.city)
                              ?.label || "-"}
                          </span>

                          <span className="text-gray-500">Kecamatan</span>
                          <span className="font-medium text-gray-900">
                            {districtOptions.find(
                              (o) => o.value === formData.district,
                            )?.label || "-"}
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
                          <span className="font-medium text-gray-900 leading-snug wrap-break-word">
                            {formData.actual_address || "-"}
                          </span>

                          <span className="text-gray-500">Patokan Alamat</span>
                          <span className="font-medium text-gray-900">
                            {formData.notes || "-"}
                          </span>
                        </div>

                        {/* Map Mini Preview */}
                        <div className="mt-4 w-full h-[350px] rounded-xl overflow-hidden pointer-events-none opacity-80 border border-gray-200">
                          <MapMapbox
                            initialLatitude={Number(formData.latitude || 0)}
                            initialLongitude={Number(formData.longitude || 0)}
                            isInteractive={false}
                          />
                        </div>
                      </div>

                      {/* Tambahan Info */}
                      {/* {mode === "register" && (
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">
                            Informasi Tentang IRA
                          </h4>
                          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-y-2 mt-2">
                            <span className="text-gray-500">
                              Sumber Informasi
                            </span>
                            <span className="font-medium text-gray-900">
                              Lainnya
                            </span>
                            <span className="text-gray-500">
                              Detail Lebih Lanjut
                            </span>
                            <span className="font-medium text-gray-900">
                              Tahu dari teman
                            </span>
                          </div>
                        </div>
                      )} */}
                    </div>

                    {/* Checkbox Agreement */}
                    <div className="my-6 border-t border-gray-100 pt-4">
                      <CheckboxAgreeForm
                        value={agreement as any}
                        onChange={() => setAgreement(!agreement)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pb-4">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setStep(2);
                    }}
                    className="flex-1 bg-white border-2 border-primary text-primary hover:bg-red-50 font-bold py-3 px-4 rounded-xl text-sm md:text-base shadow-sm transition-transform active:scale-95 duration-200"
                  >
                    Ubah Data
                  </button>
                  <button
                    type="submit"
                    disabled={isInvalid}
                    className="flex-1 disabled:cursor-not-allowed px-4 py-3 rounded-xl bg-primary text-white font-bold text-center text-sm md:text-base shadow-sm hover:bg-[#b01e1a] transition disabled:opacity-50"
                  >
                    Berlangganan Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {isModalRegisterSuccess && (
        <ModalTemplate
          closeModal={handleClickBanner}
          width="!w-fit"
          classNameModal="!p-0 !bg-transparent !shadow-none !w-fit !max-w-[95vw]"
          isCloseButton={false}
        >
          <div className="relative w-fit mx-auto group overflow-hidden rounded-2xl">
            <div className="w-fit cursor-pointer" onClick={handleClickBanner}>
              {coveredAtSubmit ? (
                <Image
                  src="/assets/Images/banner-pop-up-regist-covered.png"
                  alt="Registrasi Berhasil - Tercover"
                  width={1000}
                  height={1000}
                  className="w-auto h-auto max-w-full max-h-[80vh] object-contain drop-shadow-2xl"
                  priority
                />
              ) : (
                <Image
                  src="/assets/Images/banner-pop-up-regist-not-covered.png"
                  alt="Registrasi Berhasil - Masuk Daftar Tunggu"
                  width={1000}
                  height={1000}
                  className="w-auto h-auto max-w-full max-h-[80vh] object-contain drop-shadow-2xl"
                  priority
                />
              )}
            </div>
          </div>
        </ModalTemplate>
      )}

      {/* {isOpenModalReqLoc && status === "denied" && (
        <ModalTemplate
          classNameModal="p-6"
          closeModal={() => {
            setIsOpenModalReqLoc(false);
            toast(
              "Mohon izinkan akses lokasi browser dan gunakan browser Google Chrome",
            );
            router.push("/");
          }}
        >
          <div className="flex flex-col gap-6 z-60 bg-white">
            <h2 className="text-[#0D0E10] max-sm:mt-10 text-[24px]/[30px] font-bold text-center">
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
      )} */}
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
              Arahkan Pin Lokasi ke Titik Alamat Pemasangan Anda yang tepat
            </p>
            <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow-sm relative border border-gray-200">
              <MapMapboxLite
                initialLatitude={Number(
                  tempMapPayload?.latitude || formData.latitude || 0,
                )}
                initialLongitude={Number(
                  tempMapPayload?.longitude || formData.longitude || 0,
                )}
                onPlaceChange={(p: any) => {
                  // Update temp untuk tombol Simpan
                  if (p.postcode) {
                    lastPostcodeFromMap.current = p.postcode;
                  }

                  setTempMapPayload((prev: any) => ({
                    ...prev,
                    latitude: String(p.latitude),
                    longitude: String(p.longitude),
                    address: p.address,
                    // postcode: p.postcode, // <-- DISCONNECT
                    address_raw: p.raw_result,
                  }));

                  // UPDATE REAKTIF KE FORM UTAMA
                  setFormData((prev) => {
                    // Hanya update kalau memang beda, biar gak looping
                    const isSamePC = prev.postal_code === p.postcode;
                    const isSameLat = prev.latitude === String(p.latitude);

                    if (isSamePC && isSameLat) return prev;

                    return {
                      ...prev,
                      // Jika ada postcode baru, sikat
                      // ...(p.postcode ? { postal_code: p.postcode } : {}), // <-- DISCONNECT
                      // Update alamat gmaps saja agar reaktif (actual_address dibiarkan berdiri sendiri)
                      ...(p.address ? { address_gmaps: p.address } : {}),
                      ...(p.raw_result ? { address_raw: p.raw_result } : {}),
                    };
                  });
                }}
                isInteractive={true}
              />
              <div className="absolute bottom-8 px-6 left-1/2 -translate-x-1/2 z-10 w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (tempMapPayload) {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: tempMapPayload.latitude,
                        longitude: tempMapPayload.longitude,
                        address_gmaps:
                          tempMapPayload.address || prev.address_gmaps,
                        // postal_code: tempMapPayload.postcode || prev.postal_code, // <-- DISCONNECT
                        address_raw:
                          tempMapPayload.address_raw || prev.address_raw,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        latitude: "",
                        postal_code: "",
                        address_gmaps: "",
                      }));
                    }
                    setIsOpenMapModal(false);
                  }}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-primary-dark transition text-sm cursor-pointer"
                >
                  Simpan Pin Point
                </button>
              </div>
            </div>
          </div>
        </ModalTemplate>
      )}

      {/* Confirmation Summary Modal */}
    </div>
  );
}

export default RegistrationWizard;
