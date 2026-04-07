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

const ButtonChannel: React.FC<ButtonChannelProps> = ({
  channel,
  handleClick,
  Logo,
  selected,
}) => {
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
        <>
          {/* Uncomment NormalizedLogo di bawah jika logo dari DB tidak seragam paddingnya */}
          {/* <NormalizedLogo src={Logo} alt={channel.name} targetWidth={72} /> */}
          <Image
            src={Logo}
            alt={channel.name}
            width={72}
            height={40}
            className="object-contain w-[72px] min-h-10"
          />
        </>
      ) : (
        <span className="text-xs text-gray-500 text-center w-[72px]">
          {channel.name}
        </span>
      )}
    </button>
  );
};

export default ButtonChannel;
