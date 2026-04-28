import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { PiUserCircleFill } from "react-icons/pi";
import { dmSans } from "@/app/_shared/font/font";

const FloatingNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav
      className={`fixed top-2 sm:top-6 left-1/2 -translate-x-1/2 z-100 w-[95%] sm:w-[85%] max-w-4xl h-12 md:h-[60px] rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex items-stretch border-[1.5px] border-white/60 overflow-hidden bg-[rgba(255,255,255,0.70)] backdrop-blur-md ${dmSans.className}`}
    >
      {/* Left Section (Red Block with Logo) */}
      <div className={`bg-[#b31b1b] ${isHome ? "sm:bg-[#7A0604]" : "sm:bg-[#b31b1b]"} h-full flex items-center justify-center px-2 sm:pl-3 sm:pr-4 md:pl-5 md:pr-6 border-r-[1.5px] border-white/40`}>
        <div className="flex items-center gap-1 md:gap-2">
          <Image
            src="/assets/Icons/IraWhiteIcon.svg"
            alt="Logo"
            className="h-7 sm:h-8 md:h-9 w-auto object-contain cursor-pointer"
            width={80}
            height={80}
            fallback-src="/assets/Images/LogoIra.png"
            onClick={() => router.push("/")}
            onError={(e: any) => {
              e.currentTarget.src = "/assets/Images/LogoIra.png";
            }}
          />
        </div>
      </div>

      {/* Center Links */}
      <div className="flex-1 flex items-center justify-evenly px-2 sm:px-4 gap-1 sm:gap-4 text-black font-semibold text-[11px] sm:text-sm md:text-lg">
        <Link href="/#apps" className="hover:text-red-700 transition">
          Apps
        </Link>
        <Link href="/#faq" className="hover:text-red-700 transition">
          FAQ
        </Link>
        <Link
          href="/check-coverage"
          className="hover:text-red-700 transition text-center whitespace-nowrap"
        >
          Cek Jangkauan
        </Link>
      </div>

      {/* Right Section (Login Button) */}
      <div className="h-full flex items-center pr-1.5 pl-1.5">
        <button
          className="bg-[#da251c] hover:bg-[#b01e1a] transition-all h-[75%] md:h-[80%] rounded-full flex items-center pl-3 md:pl-6 pr-1 gap-1.5 md:gap-4 shadow-md border border-[#da251c]"
          onClick={() => router.push("/auth/login")}
        >
          <span className="text-white font-medium text-[13px] md:text-[15px] tracking-wide">
            Login
          </span>
          <div className="bg-[#ece0e0] rounded-full p-[3px] shadow-inner h-7 w-7 md:h-[38px] md:w-[38px] flex items-center justify-center shrink-0">
            <div className="bg-white rounded-full h-full w-full flex items-center justify-center shadow-sm border border-gray-100">
              <PiUserCircleFill className="text-[#da251c] w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
};

export default FloatingNavbar;
