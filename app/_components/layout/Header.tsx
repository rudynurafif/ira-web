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
import IraIcon from "@/public/assets/Icons/IraIcon.svg";
import IraWhiteIcon from "@/public/assets/Icons/IraWhiteIcon.svg";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { ProfileInfo } from "@/app/_shared/types/customer-area";
import { getFirstTwoWords, toastErrorFromAPI } from "@/app/_shared/utils";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { getUser, logout } from "@/app/store/slice/authSlice";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isActive, setIsActive] = useState(true);
  const [customerData, setCustomerData] = useState<ProfileInfo>();
  const dispatch = useAppDispatch();
  const { token: tokenfromState } = useAppSelector((state) => state.auth);
  // const token = getCookie("token-ira") ?? tokenfromState;
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const cookieToken = getCookie("token-ira") as string | null;
    const finalToken =
      cookieToken ?? (tokenfromState as string | undefined) ?? null;
    setToken(finalToken);

    const fetchData = async () => {
      try {
        if (finalToken) {
          const resProfile = await getProfileInfo({});
          const customer = resProfile.data.data.customer;

          dispatch(getUser(customer));
          setCustomerData(customer);
          setIsLoggedIn(true);
          if (customer) setIsActive(customer?.is_active);
          setShowDropdown(false);
        }
      } catch (error: any) {
        toastErrorFromAPI(error, "Gagal memuat data pelanggan");
        const statusCode =
          error?.response?.data?.statusCode || error?.response?.status;

        if (statusCode === 500 && pathname !== "/500") {
          toast.error(
            "Terjadi gangguan pada server. Mengalihkan ke halaman error..."
          );
          router.push(`/500?from=${encodeURIComponent(pathname)}`);
          return;
        }

        if (statusCode === 401) {
          toastErrorFromAPI(
            error,
            "Sesi Anda telah berakhir, silakan login kembali."
          );
          dispatch(logout());
          setIsLoggedIn(false);
          window.location.href = "/auth/login";
        }
      }
    };

    fetchData();
  }, [dispatch, tokenfromState]);

  const handleLogout = () => {
    dispatch(logout());

    setIsLoggedIn(false);

    window.location.href = "/auth/login";
    toast.success("Logout Berhasil!");
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
                className="flex cursor-pointer w-full items-center gap-3 px-4 py-3 text-primary hover:bg-red-50 transition"
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
            ? "bg-button-login"
            : "bg-primary hover:bg-dark-primary-2"
        } rounded-full px-5 py-2.5 font-medium cursor-pointer text-white shadow-sm transition`}
      >
        <FaRegUser />
        Masuk/Daftar
      </Link>
    );
  };

  return (
    <div className="relative">
      <div
        className={
          pathname === "/"
            ? `absolute top-0 left-0 right-0 z-50 border-b border-white text-white ${
                isOpenMenu
                  ? "bg-[#910E04]"
                  : "bg-[rgba(118,18,0,0.5)]"
              }`
            : "text-black bg-white shadow-sm"
        }
      >
        {/* Desktop Header */}
        <div className={`container mx-auto px-5 py-3`}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex gap-5 cursor-pointer">
              <Image
                src={pathname === "/" ? IraWhiteIcon : IraIcon}
                alt="Internet Rakyat"
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
                IRA
              </Link>

              <Link
                href="/check-coverage"
                className={`${
                  pathname === "/check-coverage" ? "font-bold" : ""
                } underline-animation-register`}
              >
                Cek Jangkauan
              </Link>

              {isLoggedIn && isActive && (
                <Link
                  href="/payment"
                  className={`${
                    pathname === "/payment" ? "font-bold" : ""
                  } underline-animation-register`}
                >
                  Perpanjang Paket
                </Link>
              )}

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
          <div className="flex flex-col gap-5 text-center">
            <Link
              href="/"
              className={` ${pathname === "/" && "font-bold"}`}
              onClick={() => setIsOpenMenu(false)}
            >
              IRA
            </Link>

            <Link
              href="/check-coverage"
              className={` ${pathname === "/check-coverage" && "font-bold"}`}
              onClick={() => setIsOpenMenu(false)}
            >
              Cek Jangkauan
            </Link>

            {isLoggedIn && (
              <Link
                href="/payment"
                className={` ${pathname === "/payment" && "font-bold"}`}
                onClick={() => setIsOpenMenu(false)}
              >
                Perpanjang Paket
              </Link>
            )}

            <div>
              {isLoggedIn ? (
                <div className="flex flex-col gap-6">
                  <Link
                    href="/customer-area"
                    className={`${
                      pathname === "/customer-area" ? "font-bold" : ""
                    }`}
                  >
                    Area Pelanggan
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpenMenu(false);
                    }}
                    className={`flex ${
                      pathname === "/"
                        ? "bg-white text-primary"
                        : "bg-primary text-white"
                    } font-bold items-center gap-2 text-center justify-center rounded-full px-5 py-2.5`}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className={`flex gap-1 justify-center items-center ${
                    pathname === "/" ? "bg-button-login" : "bg-primary"
                  } text-white rounded-full px-5 py-2.5 font-medium`}
                  onClick={() => setIsOpenMenu(false)}
                >
                  <FaRegUser /> Masuk/Daftar
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
