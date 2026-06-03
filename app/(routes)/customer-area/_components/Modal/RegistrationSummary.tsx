"use client";
import React, { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import dynamic from "next/dynamic";

const MapLeaflet = dynamic(() => import("@/app/_components/form/MapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-xs text-gray-400">Memuat Peta...</span>
    </div>
  ),
});
import { PackageData } from "@/app/_shared/types/customer-area";
import {
  getPackagesRegister,
  registerUserFromCoverage,
} from "@/app/_api/Auth/Auth";
import { convertToCurrency, toastErrorFromAPI } from "@/app/_shared/utils";
import CheckboxAgreeForm from "@/app/_components/form/CheckboxAgreeForm";
import { PackageCardMobileSkeletonList } from "@/app/(routes)/payment/_components/PackageCardMobileSkeleton";
import PackageCardMobile from "@/app/(routes)/payment/_components/PackageCardMobile";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { getUser } from "@/app/store/slice/authSlice";
import { getCheckCoverage } from "@/app/_api/Location/Location";
import { setCookie } from "cookies-next";
import toast from "react-hot-toast";
import { fetchCustomerPackages } from "@/app/store/slice/customerPackageSlice";

interface RegistrationSummaryProps {
  onBack: () => void;
}

const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  onBack,
}) => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>();
  const [mitraID, setMitraID] = useState<
    { id: string | number; [key: string]: any }[]
  >([]);
  const [btsID, setBtsID] = useState([]);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [agreement, setAgreement] = useState<boolean>(false);

  const [initialData, setInitialData] = useState<Partial<any> | null>(null);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      let user = userInfo;

      // Jika belum ada di state, fetch dari API
      if (!user) {
        try {
          const res = await getProfileInfo({});
          const customerData = res.data?.data?.customer ?? {};
          dispatch(getUser(customerData));
          user = customerData;
        } catch (err) {
          toastErrorFromAPI(err);
        }
      }

      // Petakan ke initialData - simpan ID untuk submit, tapi juga simpan name untuk display
      if (user) {
        setInitialData({
          fullname: user.name || "",
          email: user.email || "",
          phone: user.phone_number || "",
          postal_code: user.postal_code || "",
          actual_address: user.address || "",
          notes: user.notes || "",
          rw: user.rw || "",
          rt: user.rt || "",
          latitude: user.latitude || undefined,
          longitude: user.longitude || undefined,
          // Simpan ID untuk submit
          province_id: user.province_id?.id || "",
          city_id: user.city_id?.id || "",
          district_id: user.district_id?.id || "",
          sub_district_id: user.sub_district_id?.id || "",
          // Simpan name untuk display
          province_name: user.province_id?.name || "",
          city_name: user.city_id?.name || "",
          district_name: user.district_id?.name || "",
          sub_district_name: user.sub_district_id?.name || "",
        });
      } else {
        setInitialData({}); // atau redirect ke login
      }
      setLoading(false);
    };

    loadUserData();
  }, [dispatch, userInfo]);

  const handleSelect = (pkg: PackageData) => {
    setSelectedPackage(pkg);
  };

  // ✅ Effect 1: Check coverage - hanya dipicu oleh latitude & longitude
  useEffect(() => {
    const checkCoverage = async () => {
      if (
        !initialData?.latitude ||
        initialData?.latitude === "0" ||
        initialData?.longitude === "0" ||
        !initialData?.longitude
      ) {
        setMitraID([]);
        setPackages([]); // Reset packages juga
        return;
      }

      try {
        const resCoverage = await getCheckCoverage({
          latitude: initialData?.latitude,
          longitude: initialData?.longitude,
        });

        setMitraID(resCoverage.data?.result?.mitra_ids ?? []);
        setBtsID(resCoverage.data?.result?.bts_ids ?? []);
      } catch (error: any) {
        toastErrorFromAPI(error, "Gagal check coverage");
        setMitraID([]);
        setPackages([]);
      }
    };

    checkCoverage();
  }, [initialData?.latitude, initialData?.longitude]);

  // ✅ Effect 2: Get packages - dipicu oleh mitraID
  useEffect(() => {
    const getPackageListReg = async () => {
      const params = {
        mitra_id: mitraID[0]?.id,
        latitude: initialData?.latitude,
        longitude: initialData?.longitude,
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
          setPackages([]);
        } finally {
          setIsLoadingPackage(false);
        }
      } else {
        setPackages([]);
        setIsLoadingPackage(false);
      }
    };

    getPackageListReg();
  }, [mitraID, initialData?.latitude, initialData?.longitude]);

  // Fungsi untuk mengambil data dari initialData dengan validasi
  const getFieldValue = (fieldName: string, defaultValue: string = "-") => {
    const value = initialData?.[fieldName];
    return value ? String(value) : defaultValue;
  };

  // Fungsi untuk menampilkan alamat lengkap
  const getFullAddress = () => {
    const addressParts = [getFieldValue("actual_address")].filter(Boolean);

    return addressParts.join(", ");
  };

  useEffect(() => {
    if (packages.length === 1) {
      const onlyPkg = packages[0];

      // Auto-select jika belum ada yang dipilih
      if (
        !selectedPackage ||
        String(selectedPackage.id) !== String(onlyPkg.id)
      ) {
        setSelectedPackage(onlyPkg);
      }
    } else if (packages.length > 1 && selectedPackage) {
      // Jika paket berubah dan yang terpilih tidak ada di list baru, reset
      const stillExists = packages.some(
        (p) => String(p.id) === String(selectedPackage.id),
      );
      if (!stillExists) {
        setSelectedPackage(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const body = {
        phone_number: initialData?.phone || "",
        package_id: selectedPackage?.id || "",
        mitra_ids: mitraID,
        bts_ids: btsID,
      };

      const res = await registerUserFromCoverage(body);
      const token = res?.data?.data ?? res?.data?.token;
      if (token) setCookie("token-ira", token);
      toast.success(res?.data?.message);

      // ✅ Refetch profile
      const profileRes = await getProfileInfo({});
      const customerData = profileRes.data?.data?.customer ?? {};
      dispatch(getUser(customerData));

      // ✅ Refetch packages
      if (customerData.customer_code) {
        await dispatch(
          fetchCustomerPackages({
            customerCode: customerData.customer_code,
            force: true,
          }),
        ).unwrap();
      }

      onBack();
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" bg-white rounded-xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-old-primary">
        Informasi Data Pelanggan
      </h1>

      {/* Paket Dipilih */}
      <p className="text-xl sm:text-2xl text-old-primary font-bold mb-3">
        Paket Dipilih
      </p>

      {isLoadingPackage ? (
        <PackageCardMobileSkeletonList count={2} />
      ) : packages?.length ? (
        <div className="px-2 md:grid grid-cols-2 gap-4 max-sm:space-y-6">
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
          Belum ada Daftar Paket yang tersedia untuk wilayah Anda, pastikan
          titik alamat Anda pada peta sudah benar.
        </div>
      )}

      <div className="border-t border-gray-border-2 my-6"></div>

      {/* Informasi Pelanggan */}
      <div className="mb-6">
        <h2 className="font-bold text-xl sm:text-2xl mb-3 text-old-primary">
          Informasi Pelanggan
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Nama Pelanggan */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Nama Pelanggan
            </span>
            <p className="font-medium flex-1">
              {getFieldValue("fullname", "-")}
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Email
            </span>
            <p className="font-medium flex-1">{getFieldValue("email", "-")}</p>
          </div>

          {/* Nomor Handphone */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Nomor Handphone
            </span>
            <p className="font-medium flex-1">{getFieldValue("phone", "-")}</p>
          </div>

          {/* Provinsi */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Provinsi
            </span>
            <p className="font-medium flex-1">
              {getFieldValue("province_name", "-")}
            </p>
          </div>

          {/* Kabupaten */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Kabupaten
            </span>
            <p className="font-medium flex-1">
              {getFieldValue("city_name", "-")}
            </p>
          </div>

          {/* Kecamatan */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Kecamatan
            </span>
            <p className="font-medium flex-1">
              {getFieldValue("district_name", "-")}
            </p>
          </div>

          {/* Kelurahan */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Kelurahan
            </span>
            <p className="font-medium flex-1">
              {getFieldValue("sub_district_name", "-")}
            </p>
          </div>

          {/* Kode Pos */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Kode Pos
            </span>
            <p className="font-medium flex-1">
              {getFieldValue("postal_code", "-")}
            </p>
          </div>

          {/* Alamat Lengkap */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Alamat Lengkap
            </span>
            <p className="font-medium flex-1">{getFullAddress()}</p>
          </div>

          {/* Patokan Alamat */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-2">
            <span className="text-gray-500 text-sm min-w-45 lg:min-w-50">
              Patokan Alamat
            </span>
            <p className="font-medium flex-1">{getFieldValue("notes", "-")}</p>
          </div>
        </div>
      </div>

      {/* Peta */}
      <div className="mb-6">
        <div className="border border-gray-200 rounded-xl overflow-hidden h-62.5 sm:h-75">
          <MapLeaflet
            initialLatitude={Number(initialData?.latitude)}
            initialLongitude={Number(initialData?.longitude)}
            isInteractive={false}
          />
        </div>
      </div>

      {/* Agreement */}
      <div className="my-7">
        <CheckboxAgreeForm
          value={agreement}
          onChange={() => setAgreement(!agreement)}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-1/2 py-2 sm:py-3 sm:text-lg text-sm font-bold border-2 border-primary text-primary rounded-xl hover:bg-red-50 order-2 sm:order-1"
        >
          Tutup
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !agreement || !selectedPackage}
          className={`w-full sm:w-1/2 py-2 sm:py-3 sm:text-lg text-sm border-2 border-primary disabled:border-gray-400 font-bold text-white rounded-xl flex items-center justify-center order-1 sm:order-2 ${
            isSubmitting || !agreement || !selectedPackage
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-[#b31b1a]"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              <span>Memproses...</span>
            </>
          ) : (
            "Berlangganan Sekarang"
          )}
        </button>
      </div>
    </div>
  );
};

export default RegistrationSummary;
