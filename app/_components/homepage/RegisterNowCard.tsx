import Link from "next/link";
import React from "react";
import Image from "next/image";

import imageRegis from "@/public/assets/Images/register-logo.svg";

function RegisterNowCard() {
  return (
    <div className="background-card-register px-[42px] py-8 rounded-xl relative">
      <p className="text-2xl mb-4">
        📦 Daftar sekarang, perangkat langsung kami kirim!
      </p>
      <Link
        href="/auth/register"
        className="text-dark-primary underline-animation-register text-2xl font-bold"
      >
        Register Sekarang {">"}
      </Link>

      <div className="absolute bottom-0 right-10">
        <Image alt="register" src={imageRegis} className="w-[300px]" />
      </div>
    </div>
  );
}

export default RegisterNowCard;
