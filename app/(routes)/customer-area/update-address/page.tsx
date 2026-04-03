"use client";

import React, { useEffect } from "react";
import RegistrationWizard from "../../auth/register/_components/RegistrationWizard";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { getUser } from "@/app/store/slice/authSlice";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import Loader from "@/app/_components/Loader";

const UpdateAddressPage = () => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // [NEW] Effect 1: Fetch data user secara manual jika di Redux masih kosong (misal saat refresh halaman)
  useEffect(() => {
    const loadUserData = async () => {
      // Jika belum ada di state, fetch dari API
      if (!userInfo || !userInfo.id) {
        try {
          const res = await getProfileInfo({});
          const customerData = res.data?.data?.customer ?? {};
          dispatch(getUser(customerData));
        } catch (err) {
          toastErrorFromAPI(err, "Gagal memuat profil");
        }
      }
    };

    loadUserData();
  }, [dispatch, userInfo]);

  // [PENTING] Gerbang Keamanan: Jangan render Wizard kalau data user di Redux belum siap
  // Supaya initialData tidak kosong pas Wizard pertama kali mounted
  if (!userInfo || !userInfo.id) {
    return <Loader />;
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/assets/Images/bg-register.png')" }}
    >
      {/* Container Content */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-10 md:py-16">
        <RegistrationWizard
          mode="update_address"
          title="Perbarui Alamat"
          showCancelButton={true}
          showBannerCovered={true}
          initialData={{
            fullname: userInfo?.name || "",
            email: userInfo?.email || "",
            phone: userInfo?.phone_number || "",
            latitude: userInfo?.latitude
              ? String(userInfo.latitude)
              : undefined,
            longitude: userInfo?.longitude
              ? String(userInfo.longitude)
              : undefined,
            actual_address: userInfo?.address || "",
            province: userInfo?.province_id?.id
              ? String(userInfo.province_id?.id)
              : "",
            city: userInfo?.city_id?.id ? String(userInfo.city_id?.id) : "",
            district: userInfo?.district_id?.id
              ? String(userInfo.district_id?.id)
              : "",
            sub_district: userInfo?.sub_district_id?.id
              ? String(userInfo.sub_district_id?.id)
              : "",
            rt: userInfo?.rt || "",
            rw: userInfo?.rw || "",
            postal_code: userInfo?.postal_code
              ? String(userInfo.postal_code)
              : "",
            postal_code_id: userInfo?.postal_code_id?.id
              ? String(userInfo.postal_code_id.id)
              : "",
            notes: userInfo?.notes || "",
          }}
        />
      </div>
    </main>
  );
};

export default UpdateAddressPage;
