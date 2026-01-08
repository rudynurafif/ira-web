import Link from "next/link";
import React from "react";
import Image from "next/image";

import imageRegis from "@/public/assets/Images/register-logo.svg";

function RegisterNowCard() {
  return (
    <div className="background-card-register px-[42px] py-8 max-sm:p-6 rounded-xl relative flex justify-between">
      <div>
        <p className="text-2xl max-sm:text-base mb-4 max-lg:w-4/5">
          📦 Daftar sekarang, perangkat langsung kami kirim!
        </p>
        <Link
          href="/auth/register"
          className="text-primary underline underline-animation-register text-2xl max-sm:text-base font-bold"
        >
          Register Sekarang {">"}
        </Link>
      </div>

      <div className="absolute bottom-0 right-10 max-sm:-right-3">
        <Image
          alt="register"
          src={imageRegis}
          className="w-[300px] max-[415px]:max-w-[120px] max-lg:w-[150px]"
        />
      </div>
    </div>
  );
}

export default RegisterNowCard;
