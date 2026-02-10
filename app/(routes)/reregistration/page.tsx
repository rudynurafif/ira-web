"use client";

import { useAppDispatch, useAppSelector } from "@/app/store/store";
import RegistrationForm from "../auth/register/_components/RegistrationForm";
import { useEffect, useState } from "react";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { getUser } from "@/app/store/slice/authSlice";
import Loader from "@/app/_components/Loader";
import { toastErrorFromAPI } from "@/app/_shared/utils";

function Page() {
  const { userInfo } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [initialData, setInitialData] = useState<Partial<any> | null>(null);
  const [loading, setLoading] = useState(true);

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

    loadUserData();
  }, [dispatch, userInfo]);

  // Tampilkan loading sementara atau fallback
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-6 lg:px-22 xl:px-42 my-6 sm:my-22">
      <RegistrationForm
        title="Registrasi Ulang Internet Rakyat (IRA)"
        mode="reregister"
        initialData={initialData!}
      />
    </div>
  );
}

export default Page;
