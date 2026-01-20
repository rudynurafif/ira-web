"use client";

import { useAppDispatch, useAppSelector } from "@/app/store/store";
import RegistrationForm from "../auth/register/_components/RegistrationForm";
import { useEffect, useState } from "react";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { getUser } from "@/app/store/slice/authSlice";
import Loader from "@/app/_components/Loader";

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
          if (res?.data?.statusCode === 200) {
            const customer = res.data.data.customer;
            dispatch(getUser(customer));
            user = customer;
          }
        } catch (err) {
          console.error("Gagal fetch user info", err);
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
          latitude: user.latitude?.toString() || undefined,
          longitude: user.longitude?.toString() || undefined,
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
    <RegistrationForm
      title="Registrasi Ulang Internet Rakyat (IRA)"
      mode="reregister"
      initialData={initialData!}
    />
  );
}

export default Page;
