import { getProfileInfo } from "@/app/_api/CustomerArea";
import { ProfileInfo } from "@/app/_shared/types/customer-area";
import React, { useEffect, useState } from "react";
import ModalEditProfile from "./ModalEditProfile";
import editIcon from "@/public/assets/Icons/icon-edit-white.svg";
import exitIcon from "@/public/assets/Icons/icon-exit.svg";

import Image from "next/image";

export const ProfileLabel = ({
  label,
  data,
}: {
  label: string;
  data: string;
}) => {
  return (
    <div className="flex flex-col gap-1 max-sm:px-4 max-sm:py-2 py-3 px-5">
      <p className="text-secondary max-sm:text-[12px] text-sm">{label}</p>
      <p className="text-black max-sm:text-[12px] text-lg">{data}</p>
    </div>
  );
};

const PersonalData = () => {
  const [profileInfo, setprofileInfo] = useState<ProfileInfo>();
  const [isLoading, setIsloading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const fetchData = async () => {
    setIsloading(true);

    try {
      const resProfile = await getProfileInfo({});

      setprofileInfo(resProfile);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] max-sm:py-2 max-sm:px-0 px-3 py-5">
        <ProfileLabel
          label="Nama Lengkap"
          data={profileInfo?.fullName || "-"}
        />
        <ProfileLabel
          label="Nomor Handphone"
          data={profileInfo?.phoneNumber || "-"}
        />
        <ProfileLabel label="Email" data={profileInfo?.email || "-"} />
        <ProfileLabel label="Alamat" data={profileInfo?.address || "-"} />

        <div className="flex max-sm:gap-2 gap-6 justify-between p-4">
          <>
            <button
              onClick={() => setOpenModal(true)}
              className="flex bg-button py-2 px-5 rounded-lg max-sm:text-xs items-center gap-2 cursor-pointer text-white"
            >
              Edit
              <Image src={editIcon} alt="edit-icon" className="text-white" />
            </button>

            <ModalEditProfile
              open={openModal}
              onClose={() => setOpenModal(false)}
              initial={{
                fullName: profileInfo?.fullName || "-",
                phone: profileInfo?.phoneNumber || "-",
                email: profileInfo?.email || "-",
                address: profileInfo?.address || "-",
              }}
              onSendOtp={(phone) => console.log("kirim OTP ke", phone)}
              onSubmit={(v) => console.log("submit", v)}
            />
          </>

          {/* <div className="flex max-sm:text-xs text-lg text-red-primary items-center gap-2 cursor-pointer">
            <Image src={exitIcon} alt="edit-icon" />
            <p>Keluar</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PersonalData;
