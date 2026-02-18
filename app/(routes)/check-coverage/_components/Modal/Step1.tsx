import Image from "next/image";
import React, { useEffect, useState } from "react";

import imageSuccess from "@/public/assets/check-coverage/check-success.png";
import imageFailed from "@/public/assets/check-coverage/check-failed.png";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import RegistrationForm from "@/app/(routes)/auth/register/_components/RegistrationForm";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { getUser } from "@/app/store/slice/authSlice";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import { useRouter } from "next/navigation";

function Step1({
  status,
  setStep,
  onClose,
}: {
  status: boolean;
  setStep: (e: number) => void;
  onClose: () => void;
}) {
  const { userInfo } = useAppSelector((state) => state.auth);
  const [showModalRegister, setShowModalRegister] = useState(false);
  const router = useRouter();

  const dispatch = useAppDispatch();
  const [initialData, setInitialData] = useState<Partial<any> | null>(null);

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
        } catch (err: any) {
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
    };

    if (userInfo) loadUserData();
  }, [dispatch, userInfo]);

  const handleNext = () => {
    setShowModalRegister(true);
  };

  return (
    <>
      <div className="rounded-xl overflow-hidden">
        <div className="w-full">
          <Image
            alt="image-status"
            src={status ? imageSuccess : imageFailed}
            className="w-full"
          />
        </div>
        <div className="my-8 text-start px-5">
          <h1 className="text-primary text-2xl font-bold w-full sm:w-3/4 mx-auto">
            {status
              ? "Selamat! Alamat Anda berada di dalam jangkauan kami."
              : "Layanan di Areamu Segera Hadir"}
          </h1>
          <p className="mt-3 w-full mx-auto text-center">
            {status
              ? "Klik tombol di bawah ini untuk mulai berlangganan paket internet Internet Rakyat."
              : "Jangan khawatir! Kami akan segera memberi tahu kamu melalui Aplikasi IRA jika layanan kami tersedia di daerahmu."}
          </p>
          <button
            onClick={handleNext}
            className="w-full cursor-pointer py-4 text-white font-bold bg-primary hover:bg-dark-primary-2 rounded-xl mt-6"
          >
            {status ? "Pilih Paket" : "Isi Data"}
          </button>
        </div>
      </div>

      {showModalRegister && (
        <ModalTemplate
          closeModal={() => {
            setShowModalRegister(false);
            window.location.href = "/customer-area";
          }}
          classNameModal="w-full"
          width="max-w-[1400px]"
          justify="justify-center"
        >
          <RegistrationForm
            mode="reregister"
            title="Registrasi IRA"
            initialData={initialData!}
          />
        </ModalTemplate>
      )}
    </>
  );
}

export default Step1;
