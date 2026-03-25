"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRegUser, FaSignOutAlt } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import IraIcon from "@/public/assets/Icons/IraIcon.svg";
import IraWhiteIcon from "@/public/assets/Icons/IraWhiteIcon.svg";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { getProfileInfo } from "@/app/_api/Customer/CustomerArea";
import { ProfileInfo } from "@/app/_shared/types/customer-area";
import {
  decodeJwt,
  getFirstTwoWords,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import {
  getUser,
  logout,
  setCoverageStatus,
} from "@/app/store/slice/authSlice";
import { DecodedToken } from "@/app/_context/sse.type";
import SkeletonBase from "../skeletons/SkeletonBase";
import { DeleteFCMToken } from "@/app/_api/Notification/Notification";
import { useAppContext } from "@/app/_shared/context/AppContext";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [customerData, setCustomerData] = useState<ProfileInfo>();
  const dispatch = useAppDispatch();
  const { token: tokenfromState, is_coverage } = useAppSelector(
    (state) => state.auth,
  );

  const [token, setToken] = useState<string | null>(null);
  const { fcmToken } = useAppContext();

  const headerRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useAppSelector((state) => state.auth);

  const buttonLabel = pathname === "/auth/login" ? "Daftar" : "Masuk";

  // =============== Token Sync Logic (Tetap sama) ===============
  const syncTokenFromCookie = useCallback(() => {
    const cookieToken = getCookie("token-ira") as string | null;
    setToken(cookieToken);
  }, []);

  useEffect(() => {
    syncTokenFromCookie();
  }, [syncTokenFromCookie]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token-ira-sync") {
        syncTokenFromCookie();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncTokenFromCookie]);

  useEffect(() => {
    const handleTokenUpdate = (e: CustomEvent) => {
      syncTokenFromCookie();
    };
    window.addEventListener(
      "token-ira-updated",
      handleTokenUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "token-ira-updated",
        handleTokenUpdate as EventListener,
      );
    };
  }, [syncTokenFromCookie]);
  // =============================================================

  useEffect(() => {
    const cookieToken = getCookie("token-ira") as string | null;
    const finalToken =
      cookieToken ?? (tokenfromState as string | undefined) ?? null;
    setToken(finalToken);

    const fetchData = async () => {
      try {
        if (finalToken) {
          const decoded = decodeJwt(finalToken) as DecodedToken;
          const resProfile = await getProfileInfo({});
          const customer = resProfile.data.data.customer;

          dispatch(getUser(customer ?? decoded));
          dispatch(setCoverageStatus(decoded.is_coverage));
          setCustomerData(customer ?? decoded);
          setIsLoggedIn(true);
          if (customer) setIsActive(customer?.is_active);
          setShowDropdown(false);
        }
      } catch (error: any) {
        toastErrorFromAPI(error, "Gagal memuat data pelanggan");
        const statusCode =
          error?.response?.data?.statusCode || error?.response?.status;

        if (statusCode === 401) {
          toastErrorFromAPI(
            error,
            "Sesi Anda telah berakhir, silakan login kembali.",
          );
          dispatch(logout());
          setIsLoggedIn(false);
          window.location.href = "/auth/login";
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, pathname, router, tokenfromState]);

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);
      if (fcmToken) await DeleteFCMToken({ fcm_token: fcmToken });
    } catch (e) {
      console.error("Gagal delete fcm token, lanjut logout:", e);
    } finally {
      dispatch(logout());
      setIsLoggedIn(false);
      setLoadingLogout(false);
      window.location.href = "/auth/login";
      toast.success("Logout Berhasil!");
    }
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpenMenu &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsOpenMenu(false);
      }
    };
    const isMobile = window.innerWidth < 1024;
    if (isMobile && isOpenMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenMenu]);

  const handleAuthButton = () => {
    if (pathname === "/auth/login") {
      if (
        typeof window !== "undefined" &&
        typeof (window as any).fbq === "function"
      ) {
        (window as any).fbq("track", "Lead");
      }
      router.push("/auth/register");
    } else if (pathname === "/auth/register") {
      router.push("/auth/login");
    } else {
      router.push("/auth/login");
    }
  };

  // Komponen Tombol Auth untuk Desktop
  const AuthButtonDesktop = () => {
    if (isLoggedIn) {
      return (
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex gap-1 items-center ${
              pathname === "/" ? "bg-button-login" : "bg-primary"
            } rounded-full px-5 py-2.5 font-medium cursor-pointer text-white shadow-sm shadow-white`}
          >
            <FaRegUser />
            Area Pelanggan
            <span className="text-xs ml-1">
              <IoMdArrowDropdown size={24} />
            </span>
          </button>

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
                    ID: {customerData?.customer_code ?? "-"}
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="flex disabled:cursor-not-allowed cursor-pointer w-full items-center gap-3 px-4 py-3 text-primary hover:bg-red-50 transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    return isLoading ? (
      <div className="h-11 w-50 max-sm:h-8 max-sm:w-8 rounded-full">
        <SkeletonBase className="cursor-not-allowed!" height="h-11" />
      </div>
    ) : (
      <button
        onClick={handleAuthButton}
        disabled={isLoading}
        className={`flex gap-1 items-center disabled:bg-slate-400 disabled:cursor-not-allowed! ${
          pathname === "/"
            ? "bg-button-login"
            : "bg-primary hover:bg-dark-primary-2"
        } rounded-full px-5 py-2.5 font-medium cursor-pointer text-white shadow-sm transition`}
      >
        <FaRegUser />
        {buttonLabel}
      </button>
    );
  };

  // Komponen Tombol Auth Kecil untuk Mobile (Hanya jika belum login)
  const MobileAuthButton = () => {
    if (isLoggedIn || isLoading) return null;

    return (
      <button
        onClick={() => {
          handleAuthButton();
          setIsOpenMenu(false);
        }}
        className={`shrink-0 flex items-center justify-center gap-1 ${
          pathname === "/" ? "bg-button-login" : "bg-primary"
        } text-white rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap shadow-sm`}
      >
        <FaRegUser />
        <span>{buttonLabel}</span>
      </button>
    );
  };

  return (
    <div className="relative" ref={headerRef}>
      <div
        className={
          pathname === "/"
            ? `absolute top-0 left-0 right-0 z-50 border-b border-white text-white ${
                isOpenMenu ? "bg-[#910E04]" : "bg-[rgba(118,18,0,0.5)]"
              }`
            : "text-black bg-white shadow-sm"
        }
      >
        {/* Desktop Header */}
        <div className={`container mx-auto px-5 py-3`}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex gap-5 cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  pathname === "/"
                    ? IraWhiteIcon?.src || IraWhiteIcon
                    : IraIcon?.src || IraIcon
                }
                alt="Internet Rakyat"
                className="w-31.25"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-10 items-center">
              <Link
                href="/"
                className={`${pathname === "/" ? "font-bold" : ""} underline-animation-register`}
              >
                IRA
              </Link>

              {!userInfo ||
              userInfo.is_coverage === false ||
              userInfo.status === "canceled-instalation" ? (
                <Link
                  href="/check-coverage"
                  className={`${pathname === "/check-coverage" ? "font-bold" : ""} underline-animation-register`}
                >
                  Cek Jangkauan
                </Link>
              ) : null}

              {isLoggedIn && isActive && is_coverage && (
                <Link
                  href="/payment"
                  className={`${pathname === "/payment" ? "font-bold" : ""} underline-animation-register`}
                >
                  Perpanjang Paket
                </Link>
              )}

              {/* Dynamic Auth Button Desktop */}
              <AuthButtonDesktop />
            </div>

            {/* Mobile Controls: Hamburger + Login Button (if not logged in) */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Tombol Auth (Hanya muncul jika belum login) */}
              <MobileAuthButton />

              {/* Hamburger Icon */}
              <button
                className={`p-1 cursor-pointer text-4xl ${
                  pathname === "/" ? "text-white" : "text-primary"
                }`}
                onClick={() => setIsOpenMenu(!isOpenMenu)}
                aria-label="Toggle Menu"
              >
                <IoMenu />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
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
              className={`${pathname === "/" && "font-bold"}`}
              onClick={() => setIsOpenMenu(false)}
            >
              IRA
            </Link>

            {!userInfo ||
            userInfo.is_coverage === false ||
            userInfo.status === "canceled-instalation" ? (
              <Link
                href="/check-coverage"
                className={`${pathname === "/check-coverage" && "font-bold"}`}
                onClick={() => setIsOpenMenu(false)}
              >
                Cek Jangkauan
              </Link>
            ) : null}

            {isLoggedIn && isActive && is_coverage && (
              <Link
                href="/payment"
                className={`${pathname === "/payment" && "font-bold"}`}
                onClick={() => setIsOpenMenu(false)}
              >
                Perpanjang Paket
              </Link>
            )}

            {/* Bagian Auth di Dalam Dropdown */}
            <div className="">
              {isLoggedIn ? (
                <div className="flex flex-col gap-6">
                  <Link
                    href="/customer-area"
                    className={`${pathname === "/customer-area" ? "font-bold" : ""}`}
                    onClick={() => setIsOpenMenu(false)}
                  >
                    Area Pelanggan
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpenMenu(false);
                    }}
                    disabled={loadingLogout}
                    className={`flex ${
                      pathname === "/"
                        ? "bg-white text-primary"
                        : "bg-primary text-white"
                    } font-bold items-center gap-2 disabled:cursor-not-allowed text-center justify-center rounded-full px-5 py-2.5 w-full`}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              ) : (
                // Pesan opsional jika user belum login tapi tombol sudah ada di header
                // Atau bisa dikosongkan jika tidak butuh duplikasi
                <div className="pt-2 border-t border-gray-200/20 mt-2">
                  <div className="text-sm opacity-80">
                    Silakan login untuk mengakses fitur pelanggan.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
