"use client";

import { PaymentChannel } from "@/app/_shared/types/payment";
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
      className={`flex items-center justify-center p-4 border border-gray-200 rounded-lg transition ${
        selected ? "bg-blue-100" : ""
      } hover:cursor-pointer hover:bg-blue-50`}
    >
      {Logo ? (
        <Image
          src={Logo}
          alt={channel.name}
          width={80}
          height={24}
          className="max-h-6 object-contain"
        />
      ) : (
        <span className="text-xs text-gray-500 truncate">{channel.name}</span>
      )}
    </button>
  );
};

export default ButtonChannel;
