"use client";
import CheckboxAgreeForm from "@/app/_components/form/CheckboxAgreeForm";
import DynamicForm from "@/app/_components/form/DynamicForm";
import DynamicSelectForm from "@/app/_components/form/DynamicSelectForm";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { ReactSelectType } from "@/app/_shared/types/form";
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
  getLocationSuggest,
  getLocationRetrieve,
  getLocationReverse,
  getBoundaryArea,
} from "@/app/_api/Location/Location";
import { getSetting } from "@/app/_api/Settings/Settings";
import toast from "react-hot-toast";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import {
  convertToCurrency,
  EMAIL_REGEX,
  PHONE_BEST_REGEX,
  regexEmail,
  toastErrorFromAPI,
  handleDownloadClick,
  resetUrlParam,
} from "@/app/_shared/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaListUl,
  FaLocationDot,
  FaListCheck,
  FaLock,
} from "react-icons/fa6";
import { MdSearch, MdClose, MdLocationOn, MdInfoOutline } from "react-icons/md";
import { VscSettings } from "react-icons/vsc";
import dynamic from "next/dynamic";
import { useBrowserDetection } from "@/app/hooks/useBrowserDetection";
import { useGeoPermission } from "@/app/hooks/useGeoPermission";
import {
  sanitizeAddress,
  sanitizeAlphanumeric,
  sanitizeEmail,
  sanitizeName,
} from "@/app/_shared/utils/formatter";
import { FormType } from "../types/type";
import { useAppSelector } from "@/app/store/store";
import PackageCardMobile from "@/app/(routes)/payment/_components/PackageCardMobile";
import { PackageData } from "@/app/_shared/types/customer-area";
import Loader from "@/app/_components/Loader";
import { PackageCardMobileSkeletonList } from "@/app/(routes)/payment/_components/PackageCardMobileSkeleton";
import { buildErrorToast, scrollToFirstError } from "../helper";
import GroupedOTP from "@/app/_components/form/DynamicOTPForm";
import PhoneOTPForm from "@/app/_components/form/PhoneOTPForm";
import Image from "next/image";
import AppOpenBanner from "./AppOpenBanner";

const MapLeaflet = dynamic(() => import("@/app/_components/form/MapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-xs text-gray-400">Memuat Peta...</span>
    </div>
  ),
});

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
  postal_code_id: "",
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
  redeemCode?: string;
};

function RegistrationWizard({
  mode,
  initialData,
  customerId,
  title = "Registrasi Internet Rakyat (IRA)",
  showCancelButton = false,
  showBannerCovered = false,
  redeemCode = "",
}: RegistrationFormProps) {
  // Clean up notes from initialData
  let defaultNotes = initialData?.notes || "";
  if (defaultNotes) {
    defaultNotes = defaultNotes
      .replace(/\s*-\s*Pelanggan pre-registrasi/gi, "")
      .replace(/Pelanggan pre-registrasi/gi, "")
      .trim();
  }

  const [step, setStep] = useState(
    mode === "update_address" || mode === "reregister" ? 2 : 1,
  );
  const [formData, setFormData] = useState<FormType>(() => {
    // [OPTIMASI] Mapping awal dari initialData (API) ke FormType
    const base = { ...initialFormData, ...(initialData || {}) };

    // Jika data datang dari API Customer Detail, petakan field yang berbeda
    if (initialData) {
      const d = initialData as any;
      return {
        ...base,
        fullname: d.name || base.fullname,
        phone: d.phone_number || base.phone,
        email: d.email || base.email,
        nik: d.nik || base.nik,
        nokk: d.no_kk || d.nokk || base.nokk,
        rt: d.rt || base.rt,
        rw: d.rw || base.rw,
        actual_address: d.address || base.actual_address,
        postal_code: d.postal_code || base.postal_code,
        latitude: d.latitude ? String(d.latitude) : base.latitude,
        longitude: d.longitude ? String(d.longitude) : base.longitude,
        province: d.province_id?.id || d.province_id || base.province,
        city: d.city_id?.id || d.city_id || base.city,
        district: d.district_id?.id || d.district_id || base.district,
        sub_district:
          d.sub_district_id?.id || d.sub_district_id || base.sub_district,
        postal_code_id:
          d.postal_code_id?.id || d.postal_code_id || base.postal_code_id,
        notes: d.notes !== undefined ? defaultNotes : base.notes,
      };
    }
    return base;
  });

  const [tempMapPayload, setTempMapPayload] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const lastValidCoordsRef = useRef<{ lat: string; lng: string } | null>(null);
  const boundaryCenterCoordsRef = useRef<{
    lat: string;
    lng: string;
  } | null>(null);

  const [showOpenApp, setShowOpenApp] = useState("false");

  // [NEW] State untuk Modal Peringatan Boundary Detail
  const [isBoundaryViolationModalOpen, setIsBoundaryViolationModalOpen] =
    useState(false);
  const [invalidLocationData, setInvalidLocationData] = useState<any>(null);
  const [isFetchingInvalidInfo, setIsFetchingInvalidInfo] = useState(false);

  const provinceRef = useRef<HTMLDivElement>(null);

  const [provinceOptions, setProvinceOptions] = useState<ReactSelectType[]>([]);
  const [cityOptions, setCityOptions] = useState<ReactSelectType[]>([]);
  const [districtOptions, setDistrictOptions] = useState<ReactSelectType[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    ReactSelectType[]
  >([]);
  const [postalCodeOptions, setPostalCodeOptions] = useState<ReactSelectType[]>(
    [],
  );
  const [isPostalCodeManual, setIsPostalCodeManual] = useState(false);

  const [isLoadingProvince, setIsLoadingProvince] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(false);
  const [isLoadingSubDistrict, setIsLoadingSubDistrict] = useState(false);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);

  // Address Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [searchCooldown, setSearchCooldown] = useState(0);
  const [isSyncingGPS, setIsSyncingGPS] = useState(false);
  const [gpsCooldown, setGpsCooldown] = useState(0);
  const [isSavingMap, setIsSavingMap] = useState(false);
  const [isLoadingArea, setIsLoadingArea] = useState(false);

  const hasInitialLocation =
    initialData?.latitude &&
    initialData?.longitude &&
    String(initialData.latitude) !== "0" &&
    String(initialData.longitude) !== "0";
  const [isCheckCoverage, setIsCheckCoverage] = useState<boolean>(false);
  const [syncCountdown, setSyncCountdown] = useState<number>(0);
  const isInitialMount = useRef(true);
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

  // Ref untuk menandai apakah kode pos baru saja didapat dari Map/Search
  // (Gunanya biar Map GAK LONCAT balik ke tengah kecamatan setelah kita pilih saran/geser pin)
  const lastPostcodeFromMap = useRef<string | null>(null);

  const [otpStatus, setOtpStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");

  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const { status, requestLocation, refresh } = useGeoPermission();
  const [isOpenModalReqLoc, setIsOpenModalReqLoc] = useState(false);

  const [currentBbox, setCurrentBbox] = useState<any>(null);

  const [isInteractingWithMap, setIsInteractingWithMap] = useState(false);
  const [isMapSyncing, setIsMapSyncing] = useState(false);

  // [NEW] Track kode pos terakhir yang BERHASIL sinkron (untuk gate banner)
  const [lastSyncedPostcode, setLastSyncedPostcode] = useState(
    (mode === "reregister" || mode === "update_address") &&
      initialData?.postal_code
      ? String(initialData.postal_code)
      : "",
  );
  const lastSyncedPostcodeRef = useRef("");
  const [isPostcodeNotFound, setIsPostcodeNotFound] = useState(false);

  // [NEW] Global Setting: Geofencing Toggle
  const [isGeofencingEnabled, setIsGeofencingEnabled] = useState(true);

  // [WATCHDOG] Jaring pengaman agar loading tidak nyangkut selamanya (max 3 detik)
  useEffect(() => {
    let watchdog: NodeJS.Timeout;
    if (isMapSyncing || isLoadingArea) {
      watchdog = setTimeout(() => {
        setIsMapSyncing(false);
        setIsLoadingArea(false);
        console.warn("Watchdog: Loading state forced to finish after timeout.");
      }, 3000); // 3 detik
    }
    return () => clearTimeout(watchdog);
  }, [isMapSyncing, isLoadingArea]);

  // [NEW] Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // [CENTRALIZED] Auto Scroll to Top on Step Change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleManualSearch = async () => {
    if (searchQuery.length < 3 || isSearchingAddress || searchCooldown > 0)
      return;

    // [FIX] Pasang loading instan agar map langsung terdisable
    setIsSearchingAddress(true);
    setSearchCooldown(5);

    const cdTimer = setInterval(() => {
      setSearchCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cdTimer);
          (async () => {
            try {
              const res = await getLocationSuggest({ search: searchQuery });
              setSearchSuggestions(res.data.data || []);
              setShowSuggestions(true);
              if (res.data?.data?.length === 0) {
                toast("Alamat tidak ditemukan");
              }
            } catch (err: any) {
              toastErrorFromAPI(err);
              console.error("Search failed:", err);
            } finally {
              setIsSearchingAddress(false);
            }
          })();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelectSuggestion = async (feat: any) => {
    if (isSearchingAddress) return;

    try {
      setIsSearchingAddress(true);

      // [OPTIMIZED] Langsung gunakan data dari suggestion jika lengkap
      let apiData = feat;

      // [NEW] Jika di suggestion tidak ada lat/long, ambil dari retrieve
      if (!apiData.latitude || !apiData.longitude) {
        const res = await getLocationRetrieve(feat.id);
        apiData = res.data.data;
      }

      if (apiData && apiData.latitude && apiData.longitude) {
        const lat = apiData.latitude;
        const lng = apiData.longitude;
        const suggPostcode = apiData.postcode || "";

        if (
          suggPostcode &&
          formData.postal_code &&
          suggPostcode !== formData.postal_code
        ) {
          // [NEW LOGIC] Blokir pencarian yang keluar dari boundary saat ini
          handleShowBoundaryViolation(
            suggPostcode,
            lat,
            lng,
            `${apiData.full_address}`,
            apiData,
          );
          setIsSearchingAddress(false);
          setShowSuggestions(false);
          return;
        }

        // Jika sama atau tidak ada data kode pos, langsung update koordinat saja
        setSearchQuery(feat.name);
        setShowSuggestions(false);

        // [FIX] Set ref agar tidak jump
        if (suggPostcode) {
          lastPostcodeFromMap.current = suggPostcode;
        }

        // [NEW] Hanya update titik koordinat (Pin), JANGAN update hierarchy dropdown
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address_gmaps: feat.full_address || feat.name,
        }));

        // Trigger sync boundary untuk visual polygon saja
        if (suggPostcode) {
          try {
            await fetchAndSyncBoundary(
              suggPostcode,
              formData.postal_code_id, // Gunakan ID yang sudah terpilih
              true,
              {
                latitude: lat,
                longitude: lng,
              },
            );
          } catch (e: any) {
            console.error("Visual sync failed:", e);
          }
        }
        return; // Selesai
      }
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // [NEW] Fungsi untuk menampilkan Modal Peringatan Boundary secara detail
  const handleShowBoundaryViolation = async (
    postcode: string,
    lat: number,
    lng: number,
    forcedFullAddress?: string,
    fallbackData?: any, // [NEW] Data cadangan dari reverse geocode / search result
  ) => {
    setIsFetchingInvalidInfo(true);
    setIsBoundaryViolationModalOpen(true);

    try {
      let dataArea = null;
      try {
        const res = await getBoundaryArea({
          // province_id: formData.province,
          // city_id: formData.city,
          // district_id: formData.district,
          // sub_district_id: formData.sub_district,
          postal_code: postcode || null,
          // is_map_moving: true,
          // [STRICT] Jangan kirim lat/lng jika sedang mode free text
          latitude: lat,
          longitude: lng,
          is_map_moving: true,
        });
        dataArea = res?.data?.data;
      } catch (e) {
        console.warn("Boundary Area API failed");
      }

      // Gabungkan data dengan hirarki: Official API > Fallback Geocode
      const detected = {
        province: dataArea?.province_id?.name || fallbackData?.province || "",
        city: dataArea?.city_id?.name || fallbackData?.city || "",
        district: dataArea?.district_id?.name || fallbackData?.district || "",
        sub_district:
          dataArea?.sub_district_id?.name || fallbackData?.sub_district || "",
        postal_code:
          dataArea?.postal_code_id?.name || fallbackData?.postcode || postcode,
      };

      // Cari label teks dari pilihan yang ada di form saat ini untuk ditampilkan di modal
      const getLabel = (options: any[], value: string) =>
        options.find((opt) => String(opt.value) === String(value))?.label ||
        value;

      const formLabels = {
        province: getLabel(provinceOptions, formData.province),
        city: getLabel(cityOptions, formData.city),
        district: getLabel(districtOptions, formData.district),
        sub_district: getLabel(subdistrictOptions, formData.sub_district),
        postal_code: formData.postal_code,
      };

      setInvalidLocationData({
        fullAddress:
          forcedFullAddress ||
          dataArea?.full_address ||
          fallbackData?.full_address ||
          "",
        ...detected,
        formValues: formLabels,
        // Deteksi perbedaan berdasarkan perbandingan string (case insensitive)
        diffs: {
          province:
            formLabels.province.toUpperCase() !==
            detected.province.toUpperCase(),
          city: formLabels.city.toUpperCase() !== detected.city.toUpperCase(),
          district:
            formLabels.district.toUpperCase() !==
            detected.district.toUpperCase(),
          sub_district:
            formLabels.sub_district.toUpperCase() !==
            detected.sub_district.toUpperCase(),
          postal_code: formLabels.postal_code !== detected.postal_code,
        },
      });
    } catch (err: any) {
      console.error("Critical error in boundary violation handler:", err);
    } finally {
      setIsFetchingInvalidInfo(false);
    }
  };

  // [NEW] Helper untuk mendapatkan teks rentang wilayah yang perlu disesuaikan
  const getViolationRangeText = () => {
    if (!invalidLocationData?.diffs) return "data lokasi";

    const diffs = invalidLocationData.diffs;
    const levels = [];
    if (diffs.province) levels.push("Provinsi");
    if (diffs.city) levels.push("Kota / Kabupaten");
    if (diffs.district) levels.push("Kecamatan");
    if (diffs.sub_district) levels.push("Kelurahan");
    if (diffs.postal_code) levels.push("Kode Pos");

    if (levels.length === 0) return "data lokasi";
    if (levels.length === 1) return levels[0];

    const last = levels.pop();
    return `${levels.join(", ")}, atau ${last}`;
  };

  // [NEW] Fungsi untuk memantulkan kembali pin ke posisi terakhir yang valid jika user mencoba keluar
  const handleSnapBack = (
    postcode: string,
    lat: number,
    lng: number,
    forcedFullAddress?: string,
    fallbackData?: any,
  ) => {
    // Tampilkan modal peringatan dulu
    handleShowBoundaryViolation(
      postcode,
      lat,
      lng,
      forcedFullAddress,
      fallbackData,
    );

    // [NEW] Cari titik untuk memantul balik (utamakan titik aman terakhir, fallback ke center boundary)
    const targetCoords =
      lastValidCoordsRef.current || boundaryCenterCoordsRef.current;

    if (targetCoords) {
      setFormData((prev) => ({
        ...prev,
        latitude: targetCoords.lat,
        longitude: targetCoords.lng,
      }));
    }
  };

  // Fetch Geofencing Setting
  useEffect(() => {
    (async () => {
      try {
        const res = await getSetting("geofencing_register_customer");
        const settingVal = res?.data?.data?.value;
        const isEnabled = settingVal === "true" || settingVal === "on";
        setIsGeofencingEnabled(isEnabled);
      } catch (err: any) {
        toastErrorFromAPI(err);
      }
    })();
  }, []);

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>();

  const token = getCookie("token-ira");

  useBrowserDetection();

  useEffect(() => {
    if (status === "granted") {
      setIsOpenModalReqLoc(false);
    }
  }, [status]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const registerSource = searchParams.get("referral_code");

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
      const d = initialData as any;
      const province = d.province_id?.id || d.province_id;
      const city = d.city_id?.id || d.city_id;
      const district = d.district_id?.id || d.district_id;
      const sub_district = d.sub_district_id?.id || d.sub_district_id;

      // [NEW] Pastikan semua data user juga masuk jika ini Update Address
      setFormData((prev) => ({
        ...prev,
        fullname: d.name || prev.fullname,
        phone: d.phone_number || prev.phone,
        email: d.email || prev.email,
        nik: d.nik || prev.nik,
        nokk: d.no_kk || d.nokk || prev.nokk,
        rt: d.rt || prev.rt,
        rw: d.rw || prev.rw,
        actual_address: d.address || prev.actual_address,
        postal_code: d.postal_code || prev.postal_code,
        postal_code_id:
          d.postal_code_id?.id || d.postal_code_id || prev.postal_code_id,
        latitude: d.latitude ? String(d.latitude) : prev.latitude,
        longitude: d.longitude ? String(d.longitude) : prev.longitude,
        province: province || prev.province,
        city: city || prev.city,
        district: district || prev.district,
        sub_district: sub_district || prev.sub_district,
      }));

      // [PENTING] Gembok kordinat agar tidak auto-center pas baru buka halaman Update Address
      const initialMapPostcode = d.postal_code || d.postal_code_id?.name;
      if (initialMapPostcode) {
        lastPostcodeFromMap.current = String(initialMapPostcode);
      }

      // Autofill the province dropdowns
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
          } catch (err: any) {
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
        const subDistrictId = sub_district;
        (async () => {
          try {
            const res = await getPostalCode({ sub_district_id: subDistrictId });
            const options = (res.data?.data ?? []).map((it: any) => ({
              label: it.name,
              value: String(it.id),
              name: it.name, // simpan aslinya buat geocoding
            }));
            setPostalCodeOptions(options);

            // Jika ada postal_code_id dari API, matikan manual mode agar dropdown muncul
            const pcId = d.postal_code_id?.id || d.postal_code_id;
            if (pcId) {
              setFormData((prev) => ({
                ...prev,
                postal_code_id: String(pcId),
                postal_code:
                  d.postal_code || d.postal_code_id?.name || prev.postal_code,
              }));
              setIsPostalCodeManual(false);
              setLastSyncedPostcode(String(pcId));
            } else if (
              (mode === "update_address" || mode === "reregister") &&
              d.postal_code &&
              !d.postal_code_id
            ) {
              setFormData((prev) => ({
                ...prev,
                postal_code_id: "",
                postal_code: d.postal_code,
              }));
              setIsPostalCodeManual(true);
              setLastSyncedPostcode(d.postal_code);
            }
          } catch (err) {
            toastErrorFromAPI(err, "Gagal muat data kode pos");
          }
        })();
      }
    }
  }, [mode, initialData]);

  // -- Persistence Logic --
  // 1. Load data from sessionStorage on Mount
  useEffect(() => {
    // [SAFETY] Jika mode Update Address, prioritaskan initialData daripada sessionStorage (mencegah data user lama nyangkut)
    if ((mode === "update_address" || mode === "reregister") && initialData) {
      return;
    }

    const savedData = sessionStorage.getItem(PERSIST_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // [NEW] Cek Expiry 60 Menit (3.600.000 ms)
        const EXPIRY_MS = 60 * 60 * 1000;
        const isExpired =
          parsed.updatedAt && Date.now() - parsed.updatedAt > EXPIRY_MS;

        if (isExpired) {
          console.log("Registration session expired, starting fresh...");
          clearPersistance();
          return;
        }

        if (parsed.formData) {
          // [BUGFIX] Jika user masih di Step 1, sebaiknya kita reset data lokasinya
          // agar tidak membingungkan (seolah terpilih otomatis padahal sisa data lama)
          // if (parsed.step === 1) {
          //   setFormData({
          //     ...parsed.formData,
          //     province: "",
          //     city: "",
          //     district: "",
          //     sub_district: "",
          //     postal_code: "",
          //     postal_code_id: "",
          //     latitude: "",
          //     longitude: "",
          //     address_gmaps: "",
          //     actual_address: "",
          //     address_raw: null,
          //   });
          // }
          //  else {
          setFormData(parsed.formData);
          // Cegah autofill ulang koordinat dari kode pos saat refresh
          // [NEW] Tentukan mode input basarkan eksistensi ID kode pos hasil restore
          if (parsed.formData.postal_code && !parsed.formData.postal_code_id) {
            setIsPostalCodeManual(true);
          } else if (parsed.formData.postal_code_id) {
            setIsPostalCodeManual(false);
          }
          if (parsed.formData.postal_code) {
            lastPostcodeFromMap.current = parsed.formData.postal_code;
            setLastSyncedPostcode(parsed.formData.postal_code);
          }
          // }
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Save data to sessionStorage on Change
  useEffect(() => {
    const dataToSave = {
      formData,
      step,
      selectedPackage,
      otpStatus,
      updatedAt: Date.now(),
    };
    sessionStorage.setItem(PERSIST_KEY, JSON.stringify(dataToSave));
  }, [formData, step, selectedPackage, otpStatus, PERSIST_KEY]);

  // 3. Clear Storage helper
  const clearPersistance = () => {
    sessionStorage.removeItem(PERSIST_KEY);
  };

  useEffect(() => {
    if (isModalRegisterSuccess) {
      const popupUrl =
        mode === "update_address"
          ? "/customer-area/update-address"
          : redeemCode
            ? `/redeem-code/popup`
            : "/auth/register/popup";

      const normalUrl =
        mode === "update_address"
          ? "/customer-area"
          : redeemCode
            ? `/redeem-code`
            : "/auth/register";

      // Masukkan ke history buat GA tracking
      window.history.pushState(null, "", popupUrl);

      // Setelah 2 detik, kembalikan ke URL normal agar kalau di-refresh gak 404
      const timeout = setTimeout(() => {
        window.history.replaceState(null, "", normalUrl);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isModalRegisterSuccess, mode]);

  useEffect(() => {
    const delay = isInitialMount.current ? 1000 : 3000;
    setSyncCountdown(Math.ceil(delay / 1000));

    // Timer untuk visual countdown di tombol
    const cdInterval = setInterval(() => {
      setSyncCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timer = setTimeout(async () => {
      clearInterval(cdInterval);
      setSyncCountdown(0);

      if (
        !formData.latitude ||
        formData.latitude === "0" ||
        formData.longitude === "0" ||
        !formData.longitude
      ) {
        setIsCovered(false);
        setMitraID([]);
        setIsCheckCoverage(false);
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
    }, delay);

    isInitialMount.current = false;

    return () => {
      clearTimeout(timer);
      clearInterval(cdInterval);
    };
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
    // Auto-select paket pertama HANYA jika tercover, ada paket, dan BELUM ada paket yang terpilih
    if (isCovered && packages.length > 0 && !formData.package_id) {
      const firstPkg = packages[0];
      setSelectedPackage(firstPkg);
      setFormData((prev: any) => ({
        ...prev,
        package_id: firstPkg.id,
      }));
      setErrors((prev: any) => ({ ...prev, package_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, isCovered]);

  useEffect(() => {
    const loadProvince = async () => {
      setIsLoadingProvince(true);
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
      } finally {
        setIsLoadingProvince(false);
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
      setIsLoadingCity(true);
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
      } finally {
        setIsLoadingCity(false);
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
      setIsLoadingDistrict(true);
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
      } finally {
        setIsLoadingDistrict(false);
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
      setIsLoadingSubDistrict(true);
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
      } finally {
        setIsLoadingSubDistrict(false);
      }
    })();
  }, [formData.district]);

  // Subdistrict -> load Postal Code options (Dropdown)
  useEffect(() => {
    if (!formData.sub_district) {
      setPostalCodeOptions([]);
      return;
    }
    (async () => {
      setIsLoadingPostalCode(true);
      try {
        const res = await getPostalCode({
          sub_district_id: formData.sub_district,
        });
        const pcData = res.data?.data ?? [];
        if (pcData.length === 0) {
          setIsPostalCodeManual(true);
        } else {
          // [FIX] Hanya paksa ke dropdown jika data manual belum ada (BUKAN saat restore session manual)
          if (
            (mode === "update_address" || mode === "reregister") &&
            formData.postal_code &&
            !formData.postal_code_id
          ) {
            setIsPostalCodeManual(true);
          } else if (!formData.postal_code || formData.postal_code_id) {
            setIsPostalCodeManual(false);
          }

          setPostalCodeOptions(
            pcData.map((it: any) => ({
              label: it.name,
              value: String(it.id), // Simpan ID untuk pengiriman ke backend
              name: String(it.name), // Simpan Name untuk keperluan Geocoding
            })),
          );
        }
      } catch (err: any) {
        toastErrorFromAPI(err, "Gagal muat data kode pos");
        setPostalCodeOptions([]);
        setIsPostalCodeManual(true);
      } finally {
        setIsLoadingPostalCode(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sub_district]);

  const fetchAndSyncBoundary = async (
    pc: string,
    pcId: string = "",
    mapMove: boolean | null = null,
    manualLocation: any = null, // [NEW] Untuk data GPS instan
    forceCentroid: boolean = false, // [NEW] Untuk paksa pin balik ke tengah
  ) => {
    if (!pc || pc.length < 4) {
      setIsLoadingArea(false);
      return;
    }

    // [STRICT GUARD] Jika pergerakan berasal dari peta (mapMove),
    // pastikan kode posnya SAMA dengan yang ada di dropdown saat ini.
    // Jika beda, berarti user mencoba keluar boundary -> TOLAK update visual.
    if (mapMove && pc !== formData.postal_code) {
      return;
    }

    // [CLAIM] Langsung tandai kode pos ini sedang diproses agar useEffect (debounce) tidak ikutan nembak
    lastSyncedPostcodeRef.current = pcId || pc;

    try {
      const areaRes = await getBoundaryArea({
        province_id: manualLocation?.province?.id || formData.province,
        city_id: manualLocation?.city?.id || formData.city,
        district_id: manualLocation?.district?.id || formData.district,
        sub_district_id:
          manualLocation?.sub_district?.id || formData.sub_district,
        postal_code: pc,
        ...(mapMove && { is_map_moving: mapMove }),
        // [STRICT] Jangan kirim lat/lng jika sedang mode free text (ID kode pos kosong)
        ...(!isPostalCodeManual && {
          latitude: manualLocation
            ? manualLocation.latitude
            : formData.latitude,
          longitude: manualLocation
            ? manualLocation.longitude
            : formData.longitude,
        }),
      });

      // Handle logical 404 inside successful response body (or cached 304)
      if (areaRes.data?.statusCode === 404) {
        toast(areaRes.data?.message || "Area tidak ditemukan");
        setIsPostcodeNotFound(true);
        return;
      }

      const dataArea = areaRes.data?.data;
      const feature = dataArea?.geojson;

      if (feature) {
        const coords = feature?.geometry?.coordinates;

        if (coords && coords.length > 0) {
          // Kalkulasi Titik Tengah (Centroid) dari koordinat poligon
          let lng = 0;
          let lat = 0;
          let points: [number, number][] = [];

          if (feature.geometry.type === "MultiPolygon") {
            points = coords[0][0]; // nested 4 levels, ambil ring pertama dari polygon pertama
          } else if (feature.geometry.type === "Polygon") {
            points = coords[0]; // nested 3 levels, ambil ring pertama
          }

          if (points.length > 0) {
            const sumLng = points.reduce((acc, p) => acc + p[0], 0);
            const sumLat = points.reduce((acc, p) => acc + p[1], 0);
            lng = sumLng / points.length;
            lat = sumLat / points.length;

            // [NEW] Simpan titik tengah boundary untuk pengaman snap-back
            boundaryCenterCoordsRef.current = {
              lat: String(lat),
              lng: String(lng),
            };
          }

          // Set Boundary untuk peta (bungkus Feature ke FeatureCollection agar leaflet-geojson happy)
          setCurrentBbox({
            type: "FeatureCollection",
            features: [feature],
          });

          // [NEW LOGIC] HANYA update Polygon/Visual Boundary.
          // JANGAN update data hierarchy (Prov/Kota/Kec/Kel) agar dropdown tetap terkunci.
          const isFromMapMove = pc === lastPostcodeFromMap.current;
          const isManual = !!manualLocation;

          // Update data koordinat HANYA jika diperlukan (Auto-Center)
          // ATAU jika dipaksa (forceCentroid) untuk snapping back
          if ((!isFromMapMove && !isManual) || forceCentroid) {
            setFormData((prev) => ({
              ...prev,
              latitude: String(lat),
              longitude: String(lng),
            }));

            // [NEW] Simpan sebagai posisi valid terakhir
            lastValidCoordsRef.current = { lat: String(lat), lng: String(lng) };

            setTempMapPayload((prev: any) => ({
              ...prev,
              latitude: String(lat),
              longitude: String(lng),
            }));
          }
        }
      }
      // Sync Selesai
      setLastSyncedPostcode(pcId || pc);
      setIsPostcodeNotFound(false); // [FIX] Reset state error jika ketemu
    } catch (e: any) {
      // toast(e.response?.data?.message || "Gagal mendapatkan data area");
      setIsPostcodeNotFound(true);
    } finally {
      setIsLoadingArea(false);
    }
  };

  // Debounce Kode Pos -> Autofill Lokasi (Koordinat Map)
  useEffect(() => {
    // Jalankan jika ada value (karena dropdown, pasti sudah 5 digit real-nya)
    // [Gembok Total] Jika sedang interaksi dengan peta, dilarang keras melakukan auto-center
    if (isInteractingWithMap) {
      lastPostcodeFromMap.current = "";
      return;
    }

    if (!formData.postal_code) {
      setIsLoadingArea(false);
      return;
    }

    // Kosongkan sync state segera saat mulai ngetik (sembunyikan banner)
    if (formData.postal_code !== lastSyncedPostcode) {
      setLastSyncedPostcode("");
      lastPostcodeFromMap.current = ""; // [CLEANUP] Buang ingatan map agar input manual selalu bikin map terbang
      setIsPostcodeNotFound(false);
    }

    const timer = setTimeout(async () => {
      if (!formData.postal_code) {
        setIsLoadingArea(false);
        return;
      }

      try {
        // [NEW] Resolusi ID ke Nama (Angka Kode Pos)
        const selectedPC = postalCodeOptions.find(
          (o: any) => o.value === formData.postal_code_id,
        );

        if (!isPostalCodeManual && !selectedPC) {
          setIsPostcodeNotFound(false); // Reset biar tidak kedip merah
          return;
        }

        // Jika tidak ketemu di options (Manual Mode), maka gunakan value langsung (karena itu angka asli)
        const pcQuery = selectedPC
          ? (selectedPC as any).name
          : formData.postal_code;

        const pcId = formData.postal_code_id || "";

        // [PENGAWAN] Jika kode pos ini sudah disinkronkan (oleh Panggilan Instan), jangan jalan lagi
        if (lastSyncedPostcodeRef.current === (pcId || pcQuery)) {
          return;
        }

        await fetchAndSyncBoundary(pcQuery, pcId);
      } catch (e) {
        console.error("Gagal mendeteksi koordinat kode pos", e);
      }
    }, 2000); // 2 Detik Countdown

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.postal_code,
    formData.postal_code_id,
    postalCodeOptions,
    isPostalCodeManual,
  ]);

  // Refresh Map
  const handleRequestLocation = async () => {
    if (isSyncingGPS || gpsCooldown > 0) return;

    // [NEW] Jika sudah diblokir sebelumnya, langsung arahkan ke modal instruksi
    if (status === "denied") {
      setIsOpenModalReqLoc(true);
      return;
    }

    try {
      setIsSyncingGPS(true);
      const position = await requestLocation();
      const { latitude, longitude } = position.coords;

      const resReverse = await getLocationReverse({
        lat: latitude,
        lng: longitude,
      });
      const dataReverse = resReverse.data.data;

      // Ambil kode pos sinkron
      const postcode = dataReverse?.postcode || "";
      const addressString =
        dataReverse?.full_address || dataReverse?.name || "Lokasi saat ini";

      const [latStr, lngStr] = [String(latitude), String(longitude)];

      // 1. CEK BOUNDARY & GEOFENCING (Mirip dengan onPlaceChange)
      let isViolation = false;
      let areaDataForFallback = null;

      if (formData.postal_code) {
        try {
          const resArea = await getBoundaryArea({
            postal_code: postcode || null,
            latitude: latitude,
            longitude: longitude,
            is_map_moving: true,
          });
          const d = resArea?.data?.data;
          areaDataForFallback = d;

          // Pastikan backend mengenali wilayah ini (city_id tidak kosong)
          if (d && Object.keys(d.city_id || {}).length > 0) {
            if (
              (d.sub_district_id?.id &&
                formData.sub_district &&
                String(d.sub_district_id.id) !==
                  String(formData.sub_district)) ||
              (d.district_id?.id &&
                formData.district &&
                String(d.district_id.id) !== String(formData.district)) ||
              (d.city_id?.id &&
                formData.city &&
                String(d.city_id.id) !== String(formData.city)) ||
              (d.province_id?.id &&
                formData.province &&
                String(d.province_id.id) !== String(formData.province))
            ) {
              isViolation = true;
            }
          } else {
            // Jika backend membalas kosong (tidak terdaftar sama sekali di database)
            isViolation = true;
          }
        } catch (e: any) {
          console.error("Boundary check failed", e);
          toastErrorFromAPI(e);
        }
      }

      if (isViolation) {
        // [INVALID] GPS Location keluar batas!
        setFormData((prev) => ({
          ...prev,
          latitude: latStr,
          longitude: lngStr,
        }));

        setTimeout(() => {
          handleSnapBack(
            postcode,
            latitude,
            longitude,
            addressString,
            areaDataForFallback || dataReverse?.raw_result,
          );
        }, 0);

        setIsSyncingGPS(false);
        return; // Hentikan proses, jangan simpan sebagai titik valid
      }

      // [VALID] Lokasi GPS aman
      if (postcode) {
        lastPostcodeFromMap.current = postcode;

        // Rekam sebagai titik aman
        if (postcode === formData.postal_code) {
          lastValidCoordsRef.current = { lat: latStr, lng: lngStr };
        }

        // Sinkronisasi wilayah
        await fetchAndSyncBoundary(postcode, formData.postal_code_id, true, {
          latitude: latStr,
          longitude: lngStr,
        });
      }

      setFormData((prev) => {
        return {
          ...prev,
          latitude: latStr,
          longitude: lngStr,
          postal_code: postcode || prev.postal_code,
          address_gmaps: addressString || prev.address_gmaps,
        };
      });

      if (postcode) {
        setLastSyncedPostcode(postcode);
      }

      toast.success("Titik lokasi GPS berhasil didapatkan");

      setGpsCooldown(5);
      const cdTimer = setInterval(() => {
        setGpsCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cdTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.log("err", err);
      if (err.code === 1) {
        // Jika user klik "Block" di pop-up browser, bantu dengan modal instruksi
        setIsOpenModalReqLoc(true);
        toast.error(
          "Izin lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser Anda.",
        );
      } else {
        toastErrorFromAPI(err);
      }
    } finally {
      setIsSyncingGPS(false);
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

  const loadShowOpenApp = async () => {
    try {
      const resSetting = await getSetting("show_open_app_referral_code");

      if (resSetting?.data?.statusCode === 200) {
        setShowOpenApp(resSetting?.data?.data?.value || "false");
      }
    } catch (error) {
      console.error("Failed to load Show OpenApp:", error);
    }
  };

  useEffect(() => {
    loadShowOpenApp();
  }, []);

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
          ...(formData.postal_code_id && {
            postal_code_id: formData.postal_code_id,
          }),
          ...(formData.rw && { rw: formData.rw }),
          ...(formData.rt && { rt: formData.rt }),
          ...(formData.address_raw && { address: [formData.address_raw] }),
          actual_address: formData.actual_address ?? "",
          ...(formData.latitude && { latitude: formData.latitude }),
          ...(formData.longitude && { longitude: formData.longitude }),
          ...(formData.notes && { notes: formData.notes }),
          // ...(formData.voucher_code && { voucher_code: formData.voucher_code }),
          ...(registerSource && { referral_code: registerSource }),
          ...(redeemCode && { redeem_code_register: redeemCode }),
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
        resetUrlParam("referral_code");
      } catch (error: any) {
        // error konflik 409
        if (error?.response?.data?.statusCode === 409) {
          setOtpStatus("idle");
          setStep(1);
          setFormData((prev) => ({ ...prev, otp: "" }));
        }
        toastErrorFromAPI(error, "Gagal melakukan registrasi");
      } finally {
        setIsLoading(false);
      }
    }
  }

  // useEffect(() => {
  //   console.log("form data", formData);
  //   // console.log("mitra IDs: ", mitraID);
  //   // console.log("bts IDs: ", btsID);
  //   console.log(isCovered);
  //   // console.log("error", errors);
  // }, [btsID, formData, mitraID, isCovered, errors]);

  function resetForm() {
    setStep(1);
    setFormData(initialFormData);
    clearPersistance(); // Clear on reset
    setErrors({});
    setAgreement(false);
    setIsLoading(false);
    setOtpStatus("idle");
    localStorage.removeItem(STORAGE_KEY);

    if (typeof window !== "undefined") {
      // scrollTo handled by useEffect
    }
  }

  const handleSelect = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setFormData((prev) => ({
      ...prev,
      package_id: pkg.id,
    }));
    setErrors((prev) => ({ ...prev, package_id: "" }));
  };

  const handleNextStep1 = () => {
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
  };

  return (
    <div className="w-full relative text-black pt-2 md:pt-4 flex flex-col items-center pb-20">
      {isLoading && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-white bg-opacity-70">
          <Loader />
        </div>
      )}
      {/* Title */}
      <div className="w-full flex justify-center mb-4 md:mb-5">
        <h1 className="text-3xl md:text-[40px] lg:text-[48px] text-white font-extrabold text-center drop-shadow-md">
          {title}
        </h1>
      </div>

      {mode === "register" && showOpenApp === "true" && <AppOpenBanner />}

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
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
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
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
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
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
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
        className="w-full max-w-[1536px] rounded-3xl md:rounded-[40px] bg-[#a80f0f] shadow-[0_20px_60px_rgba(164,18,18,0.4)] overflow-hidden relative flex flex-col lg:flex-row h-auto lg:h-[70vh] min-h-[500px] border-2 border-white mb-10"
      >
        {/* Person */}
        {/* [LEGACY] Versi lama (per-step PNG dengan scale & translate manual, sebelum diganti web-reg-mobile/desktop):
        <div
          className="w-full lg:w-[60%] left-[4%] sm:left-[3%] relative flex justify-center items-end min-h-[250px] md:min-h-[300px] lg:min-h-[500px] max-lg:mt-40"
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
        */}
        <div className="w-full aspect-287/358 sm:aspect-2736/2469 lg:aspect-auto lg:w-1/2 lg:h-full relative">
          <Image
            src="/assets/Images/web-reg-mobile.webp"
            alt="Registrasi IRA"
            fill
            className="object-cover object-bottom sm:hidden"
            priority
          />
          <Image
            src="/assets/Images/web-reg-desktop.webp"
            alt="Registrasi IRA"
            fill
            className="object-cover object-bottom hidden sm:block"
            priority
          />
        </div>

        {/* [LEGACY] Versi lama (overlap white box ke atas image via negative margin di mobile):
        <div
          className={`w-full ${step === 2 ? "max-sm:mt-[-10%]" : "max-sm:mt-[-25%]"} lg:w-[60%] xl:w-[58%] 2xl:w-[55%] flex justify-center items-start p-6 max-lg:pt-0 z-25 relative`}
        >
        */}
        <div className="w-full lg:w-[60%] xl:w-[58%] 2xl:w-[55%] flex justify-center items-start p-6 z-25 relative">
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
                  <div
                    ref={provinceRef}
                    className="mt-3 flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 mb-4 relative z-50"
                  >
                    <div className="flex-1 min-w-[250px]">
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
                        isLoading={isLoadingProvince}
                        placeholder="Pilih Provinsi"
                        value={formData.province}
                        error={errors.province}
                      />
                    </div>
                    <div className="flex-1 min-w-[250px]">
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
                        isLoading={isLoadingCity}
                        isDisabled={!formData.province || isLoadingCity}
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
                  <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 mb-4 relative z-40">
                    <div className="flex-1 min-w-[250px]">
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
                        isLoading={isLoadingDistrict}
                        isDisabled={!formData.city || isLoadingDistrict}
                        placeholder={`${
                          !formData.city
                            ? "Pilih Kota/Kab  Dahulu"
                            : "Pilih Kecamatan"
                        }`}
                        value={formData.district}
                        error={errors.district}
                      />
                    </div>
                    <div className="flex-1 min-w-[250px]">
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
                        isLoading={isLoadingSubDistrict}
                        isDisabled={!formData.district || isLoadingSubDistrict}
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 relative z-30">
                    {/* Kode Pos Area */}
                    <div className="w-full relative">
                      {isPostalCodeManual ? (
                        <DynamicForm
                          label="Kode POS"
                          isImportant
                          name="postal_code"
                          onChange={(value: string) => {
                            if (/^\d{0,5}$/.test(value)) {
                              setFormData((prev: any) => ({
                                ...prev,
                                postal_code: value,
                                postal_code_id: "",
                              }));

                              if (value.length === 5) setIsLoadingArea(true);
                              setErrors({ ...errors, postal_code: "" });
                            }
                          }}
                          placeholder="Masukkan Kode POS"
                          value={formData.postal_code}
                          disabled={
                            isLoadingArea ||
                            isMapSyncing ||
                            searchCooldown > 0 ||
                            isSearchingAddress
                          }
                          error={errors.postal_code || ""}
                        />
                      ) : (
                        <DynamicSelectForm
                          label="Kode POS"
                          isImportant
                          name="postal_code"
                          options={postalCodeOptions}
                          onChange={(value: any) => {
                            if (value) {
                              setFormData((prev: any) => ({
                                ...prev,
                                postal_code_id: value.value,
                                postal_code: value.name || value.label,
                              }));
                              setIsLoadingArea(true);
                            } else {
                              setFormData((prev: any) => ({
                                ...prev,
                                postal_code_id: "",
                                postal_code: "",
                              }));
                            }
                            setErrors({ ...errors, postal_code: "" });
                          }}
                          isLoading={isLoadingPostalCode}
                          isDisabled={
                            !formData.sub_district ||
                            isLoadingArea ||
                            isMapSyncing ||
                            searchCooldown > 0 ||
                            isSearchingAddress ||
                            isLoadingPostalCode
                          }
                          placeholder={`${
                            !formData.sub_district
                              ? "Pilih Kelurahan Dahulu"
                              : "Pilih Kode POS"
                          }`}
                          value={formData.postal_code_id || ""}
                          error={errors.postal_code || ""}
                        />
                      )}
                      {/* Loader */}
                      {(isLoadingArea ||
                        isMapSyncing ||
                        searchCooldown > 0 ||
                        isSearchingAddress) && (
                        <div className="absolute top-[48px] right-3 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* RT */}
                    <div className="w-full">
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
                    <div className="w-full md:col-span-1">
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

                  {/* Warning Banner: Kode Pos Tidak Ditemukan */}
                  {isGeofencingEnabled &&
                    isPostcodeNotFound &&
                    !isLoadingArea &&
                    formData.postal_code.length >= 4 && (
                      <div className="mb-3 p-3 bg-yellow-warning border border-brown-primary rounded-xl flex items-start gap-3 shadow-sm mt-3">
                        <div className="mt-0.5 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center shrink-0">
                          <FaLocationDot className="text-brown-primary text-lg" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-brown-primary">
                            Kode Pos Tidak Ditemukan
                          </h4>
                          <p className="text-sm text-brown-primary leading-relaxed mt-1">
                            Kode pos{" "}
                            <strong>&quot;{formData.postal_code}&quot;</strong>{" "}
                            belum tersedia di sistem. Silakan Cari Lokasimu di
                            kolom pencarian di bawah, atau klik{" "}
                            <span className="font-bold">
                              &quot;Set Pin Point ke Lokasi Saya Sekarang&quot;
                            </span>{" "}
                            untuk menentukan lokasi pemasangan Anda secara
                            manual.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Info Banner: Pengingat Geser Pin Point (Muncul hanya saat IDLE / Sudah Sinkron) */}
                  {isGeofencingEnabled &&
                    lastSyncedPostcode &&
                    (formData.postal_code === lastSyncedPostcode ||
                      formData.postal_code_id === lastSyncedPostcode) &&
                    formData.postal_code.length >= 4 &&
                    !isLoadingArea &&
                    !isSearchingAddress &&
                    !isPostcodeNotFound && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm mt-3">
                        <div className="mt-0.5 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <MdLocationOn className="text-blue-600 text-lg" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm sm:text-base font-black text-[#223571] flex items-center gap-1.5">
                            Periksa & Atur Titik Rumah Anda{" "}
                          </h4>
                          <p className="text-xs sm:text-sm text-[#485786] leading-relaxed mt-1">
                            <span className="font-bold">Garis biru</span> pada
                            peta merupakan daerah kode pos terpilih. Pastikan
                            alamat kamu sesuai dengan kode pos yang dimasukkan.
                            <br />
                            <br />
                            <span className="font-bold italic">
                              Abaikan jika alamatmu sudah sesuai titik pinpoin
                              di peta.
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Map Area */}
                  <div>
                    <div className="mb-6 relative z-10 space-y-2">
                      {/* Manual Search Bar (Standalone) */}
                      <div ref={searchRef} className="relative mb-4">
                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                          {searchQuery && (
                            <button
                              disabled={isSearchingAddress}
                              onClick={() => {
                                setSearchQuery("");
                                setSearchSuggestions([]);
                                setShowSuggestions(false);
                              }}
                              className="pl-3 text-gray-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
                              type="button"
                            >
                              <MdClose size={18} />
                            </button>
                          )}
                          <input
                            type="search"
                            autoComplete="off"
                            placeholder={"Cari Lokasimu.."}
                            className="w-full py-3.5 px-3 text-sm text-black bg-transparent border-none focus:ring-0 outline-none"
                            value={searchQuery}
                            onFocus={() =>
                              searchSuggestions.length > 0 &&
                              setShowSuggestions(true)
                            }
                            onChange={(e) => setSearchQuery(e.target.value)}
                            enterKeyHint="search"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleManualSearch();
                              }
                            }}
                          />

                          <div className="flex items-center gap-1 mr-1">
                            <button
                              type="button"
                              onClick={handleManualSearch}
                              disabled={
                                searchQuery.length < 3 || isSearchingAddress
                              }
                              className={`px-3 py-2 mr-1 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center whitespace-nowrap ${
                                isSearchingAddress
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                  : "bg-primary text-white hover:bg-primary/90 active:scale-95"
                              }`}
                            >
                              {isSearchingAddress ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <MdSearch size={22} />
                                  <span className="hidden md:inline">Cari</span>
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[250px] overflow-y-auto z-60 animate-in fade-in slide-in-from-top-2 duration-200">
                            {searchSuggestions.map((feat, idx) => (
                              <div
                                key={feat.id || idx}
                                onClick={() => handleSelectSuggestion(feat)}
                                className="flex flex-col p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-50 group/item"
                              >
                                <span className="text-sm font-semibold text-black group-hover/item:text-primary transition-colors">
                                  {feat.name}
                                </span>
                                <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                  {feat.full_address || feat.place_formatted}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {isSearchingAddress && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center gap-3 z-60">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-medium text-gray-600 italic">
                              Mencari alamat...
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="font-bold text-sm text-black mb-2">
                        Arahkan Pin Lokasi ke Titik Alamat Pemasangan Anda
                      </p>

                      <div
                        ref={mapContainerRef}
                        className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm relative border border-gray-200"
                      >
                        <div className="w-full h-full">
                          <MapLeaflet
                            initialLatitude={Number(formData.latitude || 0)}
                            initialLongitude={Number(formData.longitude || 0)}
                            isInteractive={true}
                            bbox={isGeofencingEnabled ? currentBbox : null}
                            isLoading={isLoadingArea || isSearchingAddress}
                            onGeocodeStart={() => {
                              setIsMapSyncing(true);
                            }}
                            onPlaceChange={async (p) => {
                              setIsMapSyncing(false);
                              const detectedPostcode = p.postcode;

                              // Deteksi apakah ini panggilan final (API reverse sudah selesai)
                              // Panggilan pending biasanya hanya membawa koordinat tanpa raw_result / full_address
                              const isFinalCall =
                                detectedPostcode || p.raw_result;

                              if (!isFinalCall) {
                                // [PENDING] Panggilan pertama onPlaceChange (reverse geocoding belum selesai)
                                // Update koordinat agar visual pin mengikuti jari user.
                                setFormData((prev) => ({
                                  ...prev,
                                  latitude: String(p.latitude),
                                  longitude: String(p.longitude),
                                }));
                                return;
                              }

                              // 1. CEK BOUNDARY & GEOFENCING (Hanya dijalankan SETELAH API reverse selesai)
                              let isViolation = false;
                              let areaDataForFallback = null;

                              if (formData.postal_code) {
                                try {
                                  const resArea = await getBoundaryArea({
                                    postal_code: detectedPostcode || null,
                                    latitude: p.latitude,
                                    longitude: p.longitude,
                                    is_map_moving: true,
                                  });
                                  const d = resArea?.data?.data;
                                  areaDataForFallback = d;

                                  // Pastikan backend mengenali wilayah ini (city_id tidak kosong)
                                  if (
                                    d &&
                                    Object.keys(d.city_id || {}).length > 0
                                  ) {
                                    if (
                                      (d.sub_district_id?.id &&
                                        formData.sub_district &&
                                        String(d.sub_district_id.id) !==
                                          String(formData.sub_district)) ||
                                      (d.district_id?.id &&
                                        formData.district &&
                                        String(d.district_id.id) !==
                                          String(formData.district)) ||
                                      (d.city_id?.id &&
                                        formData.city &&
                                        String(d.city_id.id) !==
                                          String(formData.city)) ||
                                      (d.province_id?.id &&
                                        formData.province &&
                                        String(d.province_id.id) !==
                                          String(formData.province))
                                    ) {
                                      isViolation = true;
                                    }
                                  } else {
                                    // Jika backend membalas kosong (tidak terdaftar sama sekali di database)
                                    isViolation = true;
                                  }
                                } catch (e) {
                                  console.error("Boundary check failed", e);
                                }
                              }

                              if (isViolation) {
                                // [INVALID] Keluar batas! Pentalin balik ke titik aman terakhir
                                setFormData((prev) => ({
                                  ...prev,
                                  latitude: String(p.latitude),
                                  longitude: String(p.longitude),
                                }));

                                setTimeout(() => {
                                  handleSnapBack(
                                    detectedPostcode || "",
                                    p.latitude,
                                    p.longitude,
                                    p.full_address,
                                    areaDataForFallback || p.raw_result,
                                  );
                                }, 0);
                                return;
                              }

                              // [VALID] Koordinat atau kode pos cocok! Update data dan simpan sebagai titik aman baru
                              setIsInteractingWithMap(true);
                              setFormData((prev) => ({
                                ...prev,
                                latitude: String(p.latitude),
                                longitude: String(p.longitude),
                              }));

                              lastValidCoordsRef.current = {
                                lat: String(p.latitude),
                                lng: String(p.longitude),
                              };

                              // Sync visual boundary (polygon)
                              lastPostcodeFromMap.current =
                                detectedPostcode || "";
                              try {
                                await fetchAndSyncBoundary(
                                  detectedPostcode || "",
                                  formData.postal_code_id,
                                  true,
                                  {
                                    latitude: p.latitude,
                                    longitude: p.longitude,
                                  },
                                );
                              } catch (e) {
                                console.error("Boundary sync failed:", e);
                              }
                              setIsInteractingWithMap(false);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-start w-full mt-3">
                        <button
                          type="button"
                          disabled={isSyncingGPS || gpsCooldown > 0}
                          onClick={handleRequestLocation}
                          className="flex items-center text-left gap-1 py-2 bg-white underline text-primary font-bold text-sm transition-all active:scale-95 disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                        >
                          {isSyncingGPS ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1"></div>
                              Mencari Lokasi...
                            </>
                          ) : gpsCooldown > 0 ? (
                            `Tunggu (${gpsCooldown}s)`
                          ) : (
                            <>
                              <MdLocationOn size={18} />
                              Set Pinpoin Ke Lokasi Saya Sekarang
                            </>
                          )}
                        </button>
                      </div>

                      {errors.latitude && (
                        <p className="text-primary text-xs mt-1">
                          Lokasi GPS harus dipilih dari peta otomatis.
                        </p>
                      )}
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
                    disabled={
                      isLoadingArea ||
                      isMapSyncing ||
                      searchCooldown > 0 ||
                      isSearchingAddress
                    }
                    onClick={() => {
                      setStep(1);
                    }}
                    className="flex-1 bg-white border-2 border-primary text-primary hover:bg-red-50 font-bold py-3 px-4 rounded-xl text-sm md:text-base shadow-sm transition-transform active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingArea ||
                    isMapSyncing ||
                    searchCooldown > 0 ||
                    isSearchingAddress
                      ? "Sinkronisasi..."
                      : "Kembali"}
                  </button>
                  <button
                    type="button"
                    disabled={
                      isLoadingArea ||
                      isMapSyncing ||
                      searchCooldown > 0 ||
                      isSearchingAddress
                    }
                    onClick={handleProceedToSummary}
                    className="flex-1 bg-primary hover:bg-dark-primary-2 text-white font-bold py-3 px-4 rounded-xl text-sm md:text-base shadow-md transition-transform active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingArea ||
                    isMapSyncing ||
                    searchCooldown > 0 ||
                    isSearchingAddress
                      ? "Sinkronisasi..."
                      : "Selanjutnya"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in duration-500 w-full h-full flex flex-col justify-between">
                <div>
                  <div className="">
                    <h2 className="text-xl md:text-2xl font-bold text-start mb-6 text-black">
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
                          <span className="font-medium text-gray-900 wrap-break-word min-w-0">
                            {formData.fullname}
                          </span>
                          <span className="text-gray-500">Email</span>
                          <span className="font-medium text-gray-900 wrap-break-word min-w-0">
                            {formData.email || "-"}
                          </span>
                          <span className="text-gray-500">Nomor Handphone</span>
                          <span className="font-medium text-gray-900 wrap-break-word min-w-0">
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
                          <span className="font-medium text-gray-900 wrap-break-word min-w-0">
                            {postalCodeOptions.find(
                              (o) => o.value === formData.postal_code,
                            )?.label || formData.postal_code}
                          </span>

                          <span className="text-gray-500">Alamat Lengkap</span>
                          <span className="font-medium text-gray-900 leading-snug wrap-break-word">
                            {formData.actual_address || "-"}
                          </span>

                          <span className="text-gray-500">Patokan Alamat</span>
                          <span className="font-medium text-gray-900 wrap-break-word min-w-0">
                            {formData.notes || "-"}
                          </span>
                        </div>

                        {/* Map Mini Preview */}
                        <div className="mt-4 w-full h-[350px] rounded-xl overflow-hidden pointer-events-none opacity-80 border border-gray-200">
                          <MapLeaflet
                            initialLatitude={Number(formData.latitude || 0)}
                            initialLongitude={Number(formData.longitude || 0)}
                            isInteractive={false}
                          />
                        </div>
                        <p className="text-sm sm:text-base text-primary my-2">
                          *Pastikan titik lokasi pada peta sudah sesuai dengan
                          lokasi pemasangan Anda.
                        </p>
                        <div className="flex justify-center mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setStep(2);
                              // Beri waktu render step 2 selesai, lalu scroll ke elemen target
                              setTimeout(() => {
                                if (mapContainerRef.current) {
                                  mapContainerRef.current.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }
                              }, 350);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-primary text-primary rounded-lg font-bold text-sm hover:bg-red-50 transition-all shadow-sm shadow-red-100"
                          >
                            <FaLocationDot className="text-xs" />
                            <span className="text-left">
                              Ubah / Sesuaikan Ulang Titik Lokasi
                            </span>
                          </button>
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
                <div className="flex flex-col sm:flex-row gap-4 pb-4">
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
                    disabled={isLoading || isCheckCoverage || syncCountdown > 0}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-center text-sm md:text-base shadow-sm hover:bg-[#b01e1a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncCountdown > 0
                      ? `Sinkronisasi Lokasi (${syncCountdown}s)`
                      : isCheckCoverage
                        ? "Memverifikasi Area Pemasangan..."
                        : mode === "update_address"
                          ? "Simpan Alamat"
                          : mode === "reregister"
                            ? "Berlangganan Kembali"
                            : "Berlangganan Sekarang"}
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
                  src="/assets/Images/banner-pop-up-regist-covered.webp"
                  alt="Registrasi Berhasil - Tercover"
                  width={1000}
                  height={1000}
                  className="w-auto h-auto max-w-full max-h-[80vh] object-contain drop-shadow-2xl"
                  priority
                  unoptimized={true}
                />
              ) : (
                <Image
                  src="/assets/Images/banner-pop-up-regist-not-covered.webp"
                  alt="Registrasi Berhasil - Masuk Daftar Tunggu"
                  width={1000}
                  height={1000}
                  className="w-auto h-auto max-w-full max-h-[80vh] object-contain drop-shadow-2xl"
                  priority
                  unoptimized={true}
                />
              )}
            </div>
          </div>
        </ModalTemplate>
      )}
      {/* Modal Instruksi Request Location (Jika Denied) */}
      {isOpenModalReqLoc && (
        <ModalTemplate
          closeModal={() => setIsOpenModalReqLoc(false)}
          classNameModal="max-w-md p-6"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <FaLocationDot className="text-red-500 text-3xl" />
            </div>

            <div className="space-y-3 text-center text-black">
              <h3 className="text-xl font-bold">
                Izin Akses Lokasi Dibutuhkan
              </h3>
              <p className="text-sm leading-relaxed">
                Anda belum mengizinkan akses lokasi di browser. Kami membutuhkan
                akses lokasi untuk mendeteksi ketersediaan jaringan Internet
                Rakyat (IRA) di area Anda secara akurat.
              </p>

              <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 border border-gray-100 mt-2">
                <p className="text-xs font-bold text-gray-900">
                  Cara mengizinkan:
                </p>
                <ul className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
                  <li>
                    Klik ikon{" "}
                    <span className="font-bold inline-flex items-center gap-1 text-gray-800">
                      Gembok <FaLock />
                    </span>{" "}
                    atau{" "}
                    <span className="font-bold text-gray-800 inline-flex items-center gap-1">
                      Setelan <VscSettings className="text-sm" />
                    </span>{" "}
                    di sebelah kiri alamat website (URL) browser Anda.
                  </li>
                  <li>
                    Cari bagian{" "}
                    <span className="font-bold text-gray-800">Lokasi</span>.
                  </li>
                  <li>
                    Ubah setelan menjadi{" "}
                    <span className="font-bold">Izinkan/Allow</span>.
                  </li>
                  <li>Refresh halaman jika diperlukan.</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenModalReqLoc(false)}
              className="w-full hover:cursor-pointer py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 mt-2"
            >
              Mengerti
            </button>
          </div>
        </ModalTemplate>
      )}
      {/* [NEW] Modal Peringatan Boundary Detail */}
      {isBoundaryViolationModalOpen && (
        <ModalTemplate
          closeModal={() => setIsBoundaryViolationModalOpen(false)}
          classNameModal="max-w-xl p-4"
        >
          <div className="p-1">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-[#FFF9E6] rounded-full flex items-center justify-center mb-6 border border-amber-100">
                <MdInfoOutline size={32} className="text-brown-primary/60" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Lokasi Pin Tidak Sesuai
              </h3>
              <p className="text-gray-900 text-sm leading-relaxed mb-1 px-4">
                Titik pin poin yang Anda pilih berada di wilayah yang berbeda
                dengan alamat yang Anda isi pada formulir registrasi.
              </p>
              <p className="text-gray-900 text-sm leading-relaxed">
                Berikut perbedaannya:
              </p>
            </div>

            {/* Kotak Alamat Saat Ini (Grey) */}
            <div className="bg-gray-100 rounded-2xl p-4 mb-4 border border-gray-100">
              <p className="text-sm text-gray-500 font-bold mb-1">
                Alamat di tempat pin Anda saat ini
              </p>
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                {isFetchingInvalidInfo
                  ? "Memuat alamat..."
                  : invalidLocationData?.fullAddress || "-"}
              </p>
            </div>

            {/* Kotak Perbandingan (Yellow Warning) */}
            <div className="bg-[#FFF9E6] rounded-2xl p-5 border border-[#E6D5A3] mb-6">
              {isFetchingInvalidInfo ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-amber-100 rounded w-1/3"></div>
                  <div className="h-10 bg-amber-100/50 rounded w-full"></div>
                </div>
              ) : invalidLocationData ? (
                <div className="space-y-5">
                  {/* Provinsi */}
                  {invalidLocationData.diffs?.province && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brown-primary mb-2 uppercase tracking-wide">
                        Provinsi
                      </span>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm mb-1">
                        <span className="text-gray-700">Yang Anda isi</span>
                        <span className="text-gray-900 font-bold uppercase">
                          {invalidLocationData.formValues?.province}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm">
                        <span className="text-gray-700">Tempat pin Anda</span>
                        <span className="text-red-600 font-bold uppercase">
                          {invalidLocationData.province}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Kota */}
                  {invalidLocationData.diffs?.city && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brown-primary mb-2 uppercase tracking-wide">
                        Kota / Kabupaten
                      </span>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm mb-1">
                        <span className="text-gray-700">Yang Anda isi</span>
                        <span className="text-gray-900 font-bold uppercase">
                          {invalidLocationData.formValues?.city}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm">
                        <span className="text-gray-700">Tempat pin Anda</span>
                        <span className="text-red-600 font-bold uppercase">
                          {invalidLocationData.city}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Kecamatan */}
                  {invalidLocationData.diffs?.district && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brown-primary mb-2 uppercase tracking-wide">
                        Kecamatan
                      </span>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm mb-1">
                        <span className="text-gray-700">Yang Anda isi</span>
                        <span className="text-gray-900 font-bold uppercase">
                          {invalidLocationData.formValues?.district}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm">
                        <span className="text-gray-700">Tempat pin Anda</span>
                        <span className="text-red-600 font-bold uppercase">
                          {invalidLocationData.district}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Kelurahan */}
                  {invalidLocationData.diffs?.sub_district && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brown-primary mb-2 uppercase tracking-wide">
                        Kelurahan
                      </span>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm mb-1">
                        <span className="text-gray-700">Yang Anda isi</span>
                        <span className="text-gray-900 font-bold uppercase">
                          {invalidLocationData.formValues?.sub_district}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm">
                        <span className="text-gray-700">Tempat pin Anda</span>
                        <span className="text-red-600 font-bold uppercase">
                          {invalidLocationData.sub_district}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Kode Pos */}
                  {invalidLocationData.diffs?.postal_code && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brown-primary mb-2 uppercase tracking-wide">
                        Kode Pos
                      </span>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm mb-1">
                        <span className="text-gray-700">Yang Anda isi</span>
                        <span className="text-gray-900 font-bold uppercase">
                          {invalidLocationData.formValues?.postal_code}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] gap-2 items-start text-sm">
                        <span className="text-gray-700">Tempat pin Anda</span>
                        <span className="text-red-600 font-bold uppercase">
                          {invalidLocationData.postal_code}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-amber-800 font-medium italic text-center text-sm">
                  Gagal memuat detail perbedaan.
                </p>
              )}
            </div>

            {/* Instruksi Bawah */}
            <div className="space-y-4 mb-8 text-center px-2">
              <p className="text-sm text-gray-900 leading-relaxed">
                Jika Anda memang ingin memasang pin poin di tempat ini, silakan
                kembali ke halaman registrasi terlebih dahulu, lalu sesuaikan
                pilihan {getViolationRangeText()}.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Untuk sekarang, pin poin akan otomatis kembali ke titik terakhir
                yang sesuai.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isFetchingInvalidInfo}
                onClick={() => {
                  setIsBoundaryViolationModalOpen(false);
                  setTimeout(() => {
                    provinceRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }, 100);
                }}
                className="w-full hover:cursor-pointer py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-dark-primary-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mengerti
              </button>
            </div>
          </div>
        </ModalTemplate>
      )}
    </div>
  );
}

export default RegistrationWizard;
