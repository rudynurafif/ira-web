"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";

// image
import starliteWhiteIcon from "@/public/assets/Icons/icon-starlite-white.svg";
import weaveWhiteIcon from "@/public/assets/Icons/icon-weave-white.svg";
import starliteIcon from "@/public/assets/Icons/icon-starlite.svg";
import weaveIcon from "@/public/assets/Icons/icon-weave.svg";
import Link from "next/link";
import { FaRegUser, FaUser } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";

function Header() {
  const pathname = usePathname();

  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (pathname === "/customer-area") setIsLoggedIn(true);
  }, []);

  return (
    <div className="relative">
      <div
        className={
          pathname === "/"
            ? `absolute top-0 left-0 right-0 z-50 border-b border-white text-white bg-[rgba(0,61,118,0.5)]`
            : "text-dark-primary bg-white"
        }
      >
        <div
          className={`container mx-auto px-5 py-3 ${
            pathname === "/" ? " bg-transparent" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center">
            {pathname === "/" ? (
              <Link href="/" className="flex gap-5 cursor-pointer">
                <Image
                  src={starliteWhiteIcon}
                  alt="starlite"
                  className="w-[125px]"
                />
                <Image src={weaveWhiteIcon} alt="weave" className="w-[125px]" />
              </Link>
            ) : (
              <Link href="/" className="flex gap-5 cursor-pointer">
                <Image
                  src={starliteIcon}
                  alt="starlite"
                  className="w-[125px]"
                />
                <Image src={weaveIcon} alt="weave" className="w-[125px]" />
              </Link>
            )}
            <div className="hidden lg:flex gap-10 items-center ">
              <Link
                href="/"
                className={`underline-animation ${
                  pathname === "/"
                    ? "font-bold underline-animation"
                    : "underline-animation-register"
                }`}
              >
                Starlite FWA
              </Link>

              <Link
                href="/check-coverage"
                className={`underline-animation ${
                  pathname === "/"
                    ? "font-bold underline-animation"
                    : "underline-animation-register"
                }`}
              >
                Cek Jangkauan
              </Link>

              <Link
                href="/payment"
                className={`underline-animation ${
                  pathname === "/"
                    ? "font-bold underline-animation"
                    : "underline-animation-register"
                }`}
              >
                Bayar Tagihan
              </Link>
              <Link
                href={"/auth/login"}
                type="button"
                className={`flex gap-1 items-center ${
                  pathname === "/" ? "bg-button-login" : "bg-primary"
                } rounded-full px-5 py-2.5 font-medium cursor-pointer text-white  shadow-sm shadow-white`}
              >
                <FaRegUser />
                {isLoggedIn ? "Area Pelanggan" : "Login/Register"}
              </Link>
            </div>
            <div className="block lg:hidden">
              <button
                className={`bg-transparent p-1 cursor-pointer text-4xl ${
                  pathname === "/" ? "text-white" : "text-primary"
                }`}
                onClick={() => setIsOpenMenu(!isOpenMenu)}
              >
                <IoMenu />
              </button>
            </div>
          </div>
        </div>
        <div
          className={`${
            isOpenMenu ? "block fade-in" : "hidden fade-out"
          } lg:hidden ${
            pathname === "/"
              ? "bg-transparent text-white"
              : "bg-white text-dark-primary"
          }  container mx-auto px-5`}
        >
          <div className="flex flex-col gap-5 p-5">
            <Link
              href="/"
              className={` ${pathname === "/" && "font-bold"}`}
              onClick={() => setIsOpenMenu(false)}
            >
              Starlite FWA
            </Link>

            <Link
              href="/check-coverage"
              className={` ${pathname === "/check-coverage" && "font-bold"}`}
              onClick={() => setIsOpenMenu(false)}
            >
              Cek Jangkauan
            </Link>

            <Link
              href="/payment"
              className={` ${pathname === "/payment" && "font-bold"}`}
              onClick={() => setIsOpenMenu(false)}
            >
              Bayar Tagihan
            </Link>
            <div>
              <Link
                href={"/auth/login"}
                type="button"
                className={`flex gap-1 items-center ${
                  pathname === "/" ? "bg-button-login" : "bg-primary"
                } rounded-full px-5 py-2.5 font-bold cursor-pointer text-white`}
              >
                <FaRegUser />
                Login/Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
