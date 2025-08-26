import { getProfileInfo } from "@/app/_api/CustomerArea";
import { ProfileInfo } from "@/app/_shared/types/customer-area";
import React, { useEffect, useState } from "react";

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
      </div>
    </div>
  );
};

export default PersonalData;
