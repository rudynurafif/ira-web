"use client";
import Image from "next/image";
import React, { useState } from "react";

import logoIra from "@/public/assets/icon/logo-starlite.webp";
import logoWeave from "@/public/assets/icon/logo-weave.webp";
import userIcon from "@/public/assets/icon/user-icon.svg";

import Link from "next/link";
import { useRouter } from "next/navigation";

function Header() {
  const router = useRouter();
  const [modalLogin, setModalLogin] = useState<boolean>(false);

  return (
    <div className="flex justify-center">
      <div className="max-w-480 w-full px-[5%] min-[1261px]:px-[10%] py-5 bg-white">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-3 sm:gap-5 md:gap-10 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              alt="ira-logo"
              src={logoIra}
              className="w-8.75 md:w-17.5"
            />
            <Image
              alt="weave-logo"
              src={logoWeave}
              className="w-18.75 md:w-37.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
