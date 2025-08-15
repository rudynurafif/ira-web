import Image from "next/image";
import React from "react";
import iconPop from "@/app/assets/Icons/pepicons-pop_open.svg";
import logoSuperChinese from "@/app/assets/images/superchinese-logo.svg";
import logoCubmu from "@/app/assets/images/cubmu-logo.svg";
import logoIblooming from "@/app/assets/images/logo-iblooming.svg";
import checkGreenIcon from "@/app/assets/Icons/mdi_tick-circle.svg";
import Link from "next/link";

const ActivePacket = () => {
  return (
    <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-secondary mb-2">Paket Aktif</h3>
          <p className="font-bold text-dark-primary-2 text-xl">
            Paket Starlite Ngebut Up To 500 Mbps
          </p>
          <p className="text-[16px] text-black mb-2">250.000/Bulan</p>
          {/* <p className="text-sm text-green-primary mb-5">
            Jatuh tempo: 30 Januari 2025
          </p> */}
        </div>
        <div className="flex flex-col items-end gap-5">
          <div className="flex items-center space-x-1">
            <Image
              src={checkGreenIcon}
              alt="check-green"
              width={20}
              height={20}
            />
            <p className="text-sm text-green-primary font-medium">
              Tagihan Lunas
            </p>
          </div>
          <button className="bg-gray-border py-2 px-5 rounded-lg font-medium text-white">
            Bayar tagihan
          </button>
        </div>
      </div>
      {/* <div className="border text-gray-border"></div>
      <div className="text-secondary text-sm mt-4">Langganan Aktif Lainnya</div>
      <div className="mt-3 flex space-x-10 text-xs">
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
  );
};

export default ActivePacket;
