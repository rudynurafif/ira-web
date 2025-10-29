import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { ProfileInfo } from "@/app/_shared/types/customer-area";
import React, { useEffect, useState } from "react";
import ModalEditProfile from "./ModalEditProfile";
import editIcon from "@/public/assets/Icons/icon-edit-white.svg";
import exitIcon from "@/public/assets/Icons/icon-exit.svg";

import Image from "next/image";
import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
import toast from "react-hot-toast";
import { useAppSelector } from "@/app/store/store";

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
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      setIsLoading(false);
      // console.log("userInfo dari state", userInfo);
    }
  }, [userInfo]);

  /**
   
  const fetchData = async () => {
    setisLoading(true);

    try {
      const resPacket = await getActivePacket({});
      const resProfile = await getProfileInfo({});

      setActivePacketData(resPacket);
      setprofileInfo(resProfile.data?.data.customer ?? {});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal muat data paket");
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
   
   */

  const isFetching = !userInfo;

  return (
    <div>
      {isFetching ? (
        <SkeletonLoadingCard />
      ) : (
        <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] max-sm:py-2 max-sm:px-0 px-3 py-5">
          <ProfileLabel label="Nama Lengkap" data={userInfo?.name || "-"} />
          <ProfileLabel
            label="Nomor Handphone"
            data={userInfo?.phone_number || "-"}
          />
          <ProfileLabel label="Email" data={userInfo?.email || "-"} />
          <ProfileLabel label="Alamat" data={userInfo?.address || "-"} />

          <div className="flex max-sm:gap-2 gap-6 justify-between p-4">
            <>
              <button
                onClick={() => setOpenModal(true)}
                className="flex bg-button hover:bg-dark-primary-2 py-2 px-5 rounded-lg max-sm:text-xs items-center gap-2 cursor-pointer text-white"
              >
                Edit
                <Image src={editIcon} alt="edit-icon" className="text-white" />
              </button>

              <ModalEditProfile
                open={openModal}
                onClose={() => setOpenModal(false)}
                initial={{
                  name: userInfo?.name,
                  phone_number: userInfo?.phone_number,
                  email: userInfo?.email || "",
                  actual_address: userInfo?.address,
                }}
              />
            </>

            {/* <div className="flex max-sm:text-xs text-lg text-red-primary items-center gap-2 cursor-pointer">
            <Image src={exitIcon} alt="edit-icon" />
            <p>Keluar</p>
          </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalData;
