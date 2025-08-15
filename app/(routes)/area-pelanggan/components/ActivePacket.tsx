import Image from "next/image";
import React from "react";
import checkGreenIcon from "@/public/assets/Icons/mdi_tick-circle.svg";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import editIcon from "@/public/assets/Icons/icon-edit.svg";
import exitIcon from "@/public/assets/Icons/icon-exit.svg";
import { ProfileLabel } from "./PersonalData";

const ActivePacket = () => {
  return (
    <div className="flex flex-col gap-10 mb-10">
      <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-8 max-sm:p-4">
        <div>
          <div className="flex flex-row justify-between items-center mb-1">
            <h3 className="text-sm text-secondary max-sm:text-xs">
              Paket Aktif
            </h3>
            <div className="flex items-center space-x-1">
              <Image
                src={checkGreenIcon}
                alt="check-green"
                width={20}
                height={20}
              />
              <p className="text-sm max-sm:text-[10px] text-green-primary font-medium">
                Tagihan Lunas
              </p>
            </div>
          </div>
          <p className="font-bold text-dark-primary-2 text-xl max-sm:text-sm">
            Paket Starlite Ngebut Up To 500 Mbps
          </p>
          <p className="text-[16px] max-sm:text-[12px] text-black mt-2">
            250.000/Bulan
          </p>
          <div className="flex justify-between items-center">
            <p className="text-sm max-sm:text-[12px] text-green-primary">
              Jatuh tempo: 30 Januari 2025
            </p>
            <button className="bg-gray-border max-sm:text-[12px] max-sm:p-2 py-2 px-5 rounded-lg font-medium text-white">
              Bayar tagihan
            </button>
          </div>
        </div>
        {/* <div className="border text-gray-border"></div> */}
        {/* <div className="text-secondary text-sm mt-4">Langganan Aktif Lainnya</div> */}
        {/* <div className="mt-3 flex space-x-10 text-xs">
        <div className="flex justify-center items-center">
          <Image
            src={logoSuperChinese}
            height={40}
            width={40}
            alt="logo-superchinese"
            className="mr-1"
          />
          <Link
            href={`/`}
            className="text-dark-primary-2 text-sm font-bold underline"
          >
            Login SuperChinese{" "}
          </Link>
          <Image src={iconPop} height={16} width={16} alt="icon-pop" />
        </div>
        <div className="flex justify-center items-center">
          <Image
            src={logoCubmu}
            height={40}
            width={40}
            alt="logo-superchinese"
            className="mr-1"
          />
          <Link
            href={`/`}
            className="text-dark-primary-2 text-sm font-bold underline"
          >
            Login Cubmu{" "}
          </Link>
          <Image src={iconPop} height={16} width={16} alt="icon-pop" />
        </div>
        <div className="flex justify-center items-center">
          <Image
            src={logoIblooming}
            height={40}
            width={40}
            alt="logo-superchinese"
            className="mr-1"
          />
          <Link
            href={`/`}
            className="text-dark-primary-2 text-sm font-bold underline"
          >
            Login iblooming{" "}
          </Link>
          <Image src={iconPop} height={16} width={16} alt="icon-pop" />
        </div>
      </div> */}
      </div>
      <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-4 max-sm:p-0">
        <div className="p-4 flex gap-4 items-center">
          <Image src={starIcon} alt="star-icon" height={40} width={40} />
          <h3 className="text-2xl font-bold max-sm:text-[16px]">Akun Anda</h3>
        </div>
        <ProfileLabel label="Nama Lengkap" data="Sugeng Prasetyo" />
        <div className="flex items-center justify-between mr-4">
          <ProfileLabel label="Nomor Handphone" data="08212348889012" />
          <p
            onClick={() => {}}
            className="max-sm:text-xs text-xl text-dark-primary-2 font-bold cursor-pointer"
          >
            Verifikasi
          </p>
        </div>
        <ProfileLabel label="Email" data="sugengpresetio@mail.com" />
        <ProfileLabel
          label="Alamat"
          data="BINONG KAMPUNG CIJENGIR GANG GURU LILI NO 178 CURUG 00403 KAB TANGERANG 15810"
        />

        <div className="flex max-sm:flex-col max-sm:gap-2 gap-6 justify-between p-4">
          <div className="flex max-sm:text-xs text-lg items-center gap-2 cursor-pointer">
            <Image src={editIcon} alt="edit-icon" />
            <p>Edit Profil</p>
          </div>
          <div className="flex max-sm:text-xs text-lg text-red-primary items-center gap-2 cursor-pointer">
            <Image src={exitIcon} alt="edit-icon" />
            <p>Keluar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePacket;
