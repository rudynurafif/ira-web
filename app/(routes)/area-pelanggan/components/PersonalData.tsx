import React from "react";

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
  return (
    <div>
      <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] max-sm:py-2 max-sm:px-0 px-3 py-5">
        <ProfileLabel label="Nama Lengkap" data="Sugeng Prasetyo" />
        <ProfileLabel label="Nomor Handphone" data="0821234889012" />
        <ProfileLabel label="Email" data="sugengpresetio@mail.com" />
        <ProfileLabel
          label="Alamat"
          data="BINONG KAMPUNG CILENGR GANG GURU LILI NO 178,
          CURUG 004/03 KAB TANGERANG 15810"
        />
      </div>
    </div>
  );
};

export default PersonalData;
