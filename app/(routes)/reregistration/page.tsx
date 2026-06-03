"use client";

import { useAppDispatch, useAppSelector } from "@/app/store/store";
import RegistrationForm from "../auth/register/_components/RegistrationForm";
import { useEffect, useState } from "react";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { getUser } from "@/app/store/slice/authSlice";
import Loader from "@/app/_components/Loader";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import RegistrationWizard from "../auth/register/_components/RegistrationWizard";
import { dmSans } from "@/app/_shared/font/font";

function Page() {
  const { userInfo } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [initialData, setInitialData] = useState<Partial<any> | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Petakan ke initialData
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
        province: user.province_id?.id || "",
        city: user.city_id?.id || "",
        district: user.district_id?.id || "",
        sub_district: user.sub_district_id?.id || "",
      });
    } else {
      setInitialData({}); // atau redirect ke login
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userInfo]);

  // Tampilkan loading sementara atau fallback
  if (loading) {
    return <Loader />;
  }

  return (
    <div
      className={`bg-white min-h-screen w-full relative overflow-x-hidden ${dmSans.className}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-[85vh] bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: "url('/assets/Images/bg-register.png')" }}
      />

      <div className="relative z-10">
        <div className="px-4 md:px-6 pt-20 md:pt-24 pb-10">
          <RegistrationWizard
            title="Reregistrasi IRA"
            mode="reregister"
            initialData={initialData!}
          />
        </div>
      </div>

      {/* <RegistrationForm
        title="Registrasi Ulang Internet Rakyat (IRA)"
        mode="reregister"
        initialData={initialData!}
      /> */}
    </div>
  );
}

export default Page;
