"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRegUser, FaSignOutAlt, FaUser } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMenu } from "react-icons/io5";

import starliteWhiteIcon from "@/public/assets/Icons/icon-starlite-white.svg";
import weaveWhiteIcon from "@/public/assets/Icons/icon-weave-white.svg";
import starliteIcon from "@/public/assets/Icons/icon-starlite.svg";
import weaveIcon from "@/public/assets/Icons/icon-weave.svg";
import { deleteCookie, getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { ProfileInfo } from "@/app/_shared/types/customer-area";
import { getFirstTwoWords } from "@/app/_shared/utils";
import { useAppDispatch } from "@/app/store/store";
import { getUser, login } from "@/app/store/slice/authSlice";
import { useGetProfileQuery } from "@/app/store/slice/customerSlice";
import { skipToken } from "@reduxjs/toolkit/query/react";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<ProfileInfo>();
  const dispatch = useAppDispatch();

  // const {
  //   data: customerData,
  //   isLoading,
  //   error,
  // } = useGetProfileQuery(undefined, {
  //   skip: !isLoggedIn, // Hanya jalankan query jika pengguna sudah login
  // });

  // console.log(customerData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie("token-fwa");
        if (token) {
          const resProfile = await getProfileInfo({});
          const customer = resProfile.data.data.customer;

          dispatch(getUser(customer));
          setCustomerData(customer);

          setIsLoggedIn(true);
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal memuat data pelanggan"
        );
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleLogout = () => {
    deleteCookie("token-fwa");

    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    setIsLoggedIn(false);

    window.location.replace("/auth/login");
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const AuthButton = () => {
    if (isLoggedIn) {
      return (
        <div className="relative flex items-center" ref={dropdownRef}>
          {/* Trigger Dropdown */}
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex gap-1 items-center ${
              pathname === "/" ? "bg-button-login" : "bg-primary"
            } rounded-full px-5 py-2.5 font-medium cursor-pointer text-white  shadow-sm shadow-white`}
          >
            <FaRegUser />
            Area Pelanggan
            <span className="text-xs ml-1">
              <IoMdArrowDropdown size={24} />
            </span>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white shadow-lg border rounded-lg overflow-hidden z-50">
              <Link
                href="/customer-area"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 border-b border-gray-100 transition"
              >
                <FaRegUser />
                <div className="flex-col">
                  <div className="text-primary font-bold">
                    {getFirstTwoWords(customerData?.name ?? "Nama Customer")}
                  </div>
                  <div className="text-muted text-xs">
                    {customerData?.customer_code ?? "ID"}
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex cursor-pointer w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href="/auth/login"
        className={`flex gap-1 items-center ${
          pathname === "/"
            ? "bg-button-login hover:bg-blue-700"
            : "bg-primary hover:bg-[#0a58a4]"
        } rounded-full px-5 py-2.5 font-medium cursor-pointer text-white shadow-sm transition`}
      >
        <FaRegUser />
        Login/Register
      </Link>
    );
  };

  return (
    <div className="relative">
      <div
        className={
          pathname === "/"
            ? `absolute top-0 left-0 right-0 z-50 border-b border-white text-white bg-[rgba(0,61,118,0.5)]`
            : "text-dark-primary bg-white shadow-sm"
        }
      >
        {/* Desktop Header */}
        <div className={`container mx-auto px-5 py-3`}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex gap-5 cursor-pointer">
              <Image
                src={pathname === "/" ? starliteWhiteIcon : starliteIcon}
                alt="Starlite"
                className="w-[125px]"
              />
              <Image
                src={pathname === "/" ? weaveWhiteIcon : weaveIcon}
                alt="Weave"
                className="w-[125px]"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-10 items-center">
              <Link
                href="/"
                className={`${
                  pathname === "/" ? "font-bold" : ""
                } underline-animation-register`}
              >
                Starlite FWA
              </Link>

              <Link
                href="/check-coverage"
                className={`${
                  pathname === "/check-coverage" ? "font-bold" : ""
                } underline-animation-register`}
              >
                Cek Jangkauan
              </Link>

              <Link
                href="/payment"
                className={`${
                  pathname === "/payment" ? "font-bold" : ""
                } underline-animation-register`}
              >
                Bayar Tagihan
              </Link>

              {/* Dynamic Auth Button */}
              <AuthButton />
            </div>

            {/* Mobile Menu Toggle */}
            <div className="block lg:hidden">
              <button
                className={`p-1 cursor-pointer text-4xl ${
                  pathname === "/" ? "text-white" : "text-primary"
                }`}
                onClick={() => setIsOpenMenu(!isOpenMenu)}
              >
                <IoMenu />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            isOpenMenu ? "block" : "hidden"
          } lg:hidden p-5 container mx-auto ${
            pathname === "/" ? "text-white" : "text-dark-primary"
          }`}
        >
          <div className="flex flex-col gap-5">
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
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <span className="font-medium">Area Pelanggan</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpenMenu(false);
                    }}
                    className="flex items-center gap-2 text-red-500"
                  >
                    <FaUser /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className={`flex gap-1 items-center ${
                    pathname === "/" ? "bg-button-login" : "bg-primary"
                  } text-white rounded-full px-5 py-2.5 font-medium`}
                  onClick={() => setIsOpenMenu(false)}
                >
                  <FaRegUser /> Login/Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
