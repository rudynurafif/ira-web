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
import { useRouter } from "next/navigation";
import { FaCheck, FaCopy } from "react-icons/fa";

export const ProfileLabel = ({
  label,
  data,
  value,
  showCopyButton = false,
  onCopy,
}: {
  label: string;
  data: string;
  value?: string;
  showCopyButton?: boolean;
  onCopy?: (value: string) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
        onCopy?.(value);
      });
    }
  };

  return (
    <div className="flex flex-col gap-1 max-sm:px-4 max-sm:py-2 py-3 px-5">
      <p className="text-secondary max-sm:text-[12px] text-sm">{label}</p>
      <div className="">
        <p className="text-black inline max-sm:text-[12px] text-lg">{data}</p>
        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            disabled={copied}
            className="cursor-pointer ml-1 inline disabled:cursor-not-allowed right-3 top-12 text-gray-500 hover:text-gray-700"
            title="Salin teks"
          >
            {copied ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaCopy className="text-primary" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const PersonalData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (userInfo) {
      setIsLoading(false);
      // console.log("userInfo dari state", userInfo);
    }
  }, [userInfo]);

  const isFetching = !userInfo;

  return (
    <div>
      {isFetching ? (
        <SkeletonLoadingCard />
      ) : (
        <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] max-sm:py-2 max-sm:px-0 px-3 py-5">
          <ProfileLabel label="Nama Lengkap" data={userInfo?.name || "-"} />
          <ProfileLabel
            showCopyButton={true}
            value={userInfo?.phone_number || "-"}
            onCopy={(value) =>
              toast.success(`Nomor Handphone berhasil disalin`)
            }
            label="Nomor Handphone"
            data={userInfo?.phone_number || "-"}
          />
          <ProfileLabel label="Email" data={userInfo?.email || "-"} />
          <ProfileLabel
            label="Alamat"
            value={userInfo?.address || "-"}
            onCopy={(value) => toast.success(`Alamat berhasil disalin`)}
            showCopyButton={true}
            data={userInfo?.address || "-"}
          />
          <ProfileLabel
            showCopyButton={true}
            value={userInfo?.latitude + ", " + userInfo?.longitude || "-"}
            onCopy={(value) => toast.success(`LatLong berhasil disalin`)}
            label="Latitude Longitude"
            data={userInfo?.latitude + ", " + userInfo?.longitude || "-"}
          />

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
                onClose={() => {
                  setOpenModal(false);
                }}
                initial={{
                  name: userInfo?.name,
                  phone_number: userInfo?.phone_number,
                  email: userInfo?.email || "",
                  actual_address: userInfo?.address,
                  latitude: userInfo?.latitude ?? undefined,
                  longitude: userInfo?.longitude ?? undefined,
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
