import React from "react";

const ProfileLabel = ({ label, data }: { label: string; data: string }) => {
  return (
    <div className="flex flex-col gap-1 py-3 px-5">
      <p className="text-secondary text-sm">{label}</p>
      <p className="text-black text-lg">{data}</p>
    </div>
  );
};

const PersonalData = () => {
  return (
    <div>
      <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] px-3 py-5">
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
