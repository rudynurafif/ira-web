"use client";

import { PaymentChannel } from "@/app/_shared/types/payment";
// import { NormalizedLogo } from "./NormalizedLogo"; // tersedia jika logo dari DB tidak seragam
import Image from "next/image";
import React from "react";

type ButtonChannelProps = {
  channel: PaymentChannel;
  handleClick: (id: string) => void;
  Logo?: any;
  selected?: boolean;
};

import SecureImage from "@/app/_components/SecureImage";

const ButtonChannel: React.FC<ButtonChannelProps> = ({
  channel,
  handleClick,
  Logo,
  selected,
}) => {
  // Cek apakah Logo adalah path OBS (string) atau static import (object/string http)
  const isObsPath =
    typeof Logo === "string" &&
    !Logo.startsWith("http") &&
    !Logo.startsWith("/_next");

  console.log("logo : ", Logo);

  return (
    <button
      onClick={() => handleClick(channel.id)}
      className={`flex items-center justify-center p-2 border border-gray-300  rounded-lg transition ${
        selected
          ? " border border-primary shadow-[0_0_10px_0_rgba(0,0,0,0.2)]"
          : "bg-white"
      } hover:cursor-pointer hover:bg-blue-50`}
    >
      {Logo ? (
        <div className="flex items-center justify-center w-[72px] h-10">
          {/* {isObsPath ? (
            <SecureImage
              obsPath={Logo}
              alt={channel.name}
              width={72}
              height={40}
              className="object-contain w-full h-full"
            />
          ) : ( */}
          <Image
            src={Logo}
            alt={channel.name}
            width={72}
            height={40}
            className="object-contain w-full h-full"
          />
          {/* )} */}
        </div>
      ) : (
        <span className="text-xs text-gray-500 text-center w-[72px]">
          {channel.name}
        </span>
      )}
    </button>
  );
};

export default ButtonChannel;
