"use client";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

// image
import starliteWhiteIcon from "@/public/assets/Icons/icon-starlite-white.svg";
import weaveWhiteIcon from "@/public/assets/Icons/icon-weave-white.svg";
import starliteIcon from "@/public/assets/Icons/icon-starlite.svg";
import weaveIcon from "@/public/assets/Icons/icon-weave.svg";
import Link from "next/link";
import { FaRegUser } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";

function Header() {
  const pathname = usePathname();

  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);

  return (
    <div className="relative">
      <div
        className={
          pathname === "/"
            ? `absolute top-0 left-0 right-0 z-50 border-b border-white text-white`
            : "text-dark-primary"
        }
      >
        <div
          className={`container mx-auto px-5 py-3 ${
            pathname === "/" ? " bg-transparent" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center">
            {pathname === "/" ? (
              <div className="flex gap-5">
                <Image
                  src={starliteWhiteIcon}
                  alt="starlite"
                  className="w-[125px]"
                />
                <Image src={weaveWhiteIcon} alt="weave" className="w-[125px]" />
              </div>
            ) : (
              <div className="flex gap-5">
                <Image
                  src={starliteIcon}
                  alt="starlite"
                  className="w-[125px]"
                />
                <Image src={weaveIcon} alt="weave" className="w-[125px]" />
              </div>
            )}
            <div className="hidden lg:flex gap-10 items-center ">
              <Link
                href="/"
                className={`underline-animation ${
                  pathname === "/" && "font-bold"
                }`}
              >
                Starlite FWA
              </Link>

              <Link
                href="/check-coverage"
                className={`underline-animation ${
                  pathname === "/check-coverage" && "font-bold"
                }`}
              >
                Cek Jangkauan
              </Link>

              <Link
                href="/payment"
                className={`underline-animation ${
                  pathname === "/payment" && "font-bold"
                }`}
              >
                Bayar Tagihan
              </Link>
              <button
                type="button"
                className={`flex gap-1 items-center ${
                  pathname === "/" ? "bg-button-login" : "bg-primary"
                } rounded-full px-5 py-2.5 font-bold cursor-pointer text-white`}
              >
                <FaRegUser />
                Login/Register
              </button>
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
              <button
                type="button"
                className={`flex gap-1 items-center ${
                  pathname === "/" ? "bg-button-login" : "bg-primary"
                } rounded-full px-5 py-2.5 font-bold cursor-pointer text-white`}
              >
                <FaRegUser />
                Login/Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
