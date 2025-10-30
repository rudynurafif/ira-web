"use client";
import Image from "next/image";
import React, { useState } from "react";

import logoStarlite from "@/public/assets/icon/logo-starlite.webp";
import logoWeave from "@/public/assets/icon/logo-weave.webp";
import userIcon from "@/public/assets/icon/user-icon.svg";

import Link from "next/link";
import { useRouter } from "next/navigation";

function Header() {
  const router = useRouter();
  const [modalLogin, setModalLogin] = useState<boolean>(false);

  return (
    <div className="flex justify-center">
      <div className="max-w-[1920px] w-full px-[5%] min-[1261px]:px-[10%] py-5 bg-white">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-3 sm:gap-5 md:gap-10 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              alt="starlite-logo"
              src={logoStarlite}
              className="w-[35px] md:w-[70px]"
            />
            <Image
              alt="weave-logo"
              src={logoWeave}
              className="w-[75px] md:w-[150px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
