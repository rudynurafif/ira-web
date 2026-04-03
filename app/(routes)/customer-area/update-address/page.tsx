"use client";

import React from "react";
import RegistrationWizard from "../../auth/register/_components/RegistrationWizard";
import { useAppSelector } from "@/app/store/store";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";

const UpdateAddressPage = () => {
  const { userInfo } = useAppSelector((state) => state.auth);

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
            notes: userInfo?.notes || "",
          }}
        />
      </div>
    </main>
  );
};

export default UpdateAddressPage;
