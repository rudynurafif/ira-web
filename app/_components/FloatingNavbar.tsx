import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { FaRegUserCircle } from "react-icons/fa";

const FloatingNavbar = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-[85%] max-w-4xl h-12 md:h-[60px] rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex items-stretch border-[1.5px] border-white/60 overflow-hidden bg-linear-to-r from-[#e7c7c7] via-[#e2cfcf] to-[#e5caca] backdrop-blur-md">
      {/* Left Section (Red Block with Logo) */}
      <div className="bg-[#b31b1b] h-full pl-3 pr-4 md:pl-5 md:pr-6 flex items-center justify-center border-r-[1.5px] border-white/40">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/Icons/IraWhiteIcon.svg"
            alt="Logo"
            className="h-8 md:h-9 object-contain"
            width={100}
            height={100}
            fallback-src="/assets/Images/LogoIra.png"
            onError={(e: any) => {
              e.currentTarget.src = "/assets/Images/LogoIra.png";
            }}
          />
        </div>
      </div>

      {/* Center Links */}
      <div className="flex items-center justify-center mx-auto gap-3 sm:gap-4 md:gap-8 px-4 md:px-8 text-black font-semibold text-[11px] sm:text-[12px] md:text-[14px]">
        <a href="#apps" className="hover:text-red-700 transition">
          Apps
        </a>
        <a href="#faq" className="hover:text-red-700 transition">
          FAQ
        </a>
        <a
          href="#cek-jangkauan"
          className="hover:text-red-700 transition hidden sm:inline"
        >
          Cek Jangkauan
        </a>
      </div>

      {/* Right Section (Login Button) */}
      <div className="h-full flex items-center pr-1.5 pl-2">
        <button
          className="bg-[#da251c] hover:bg-[#b01e1a] transition-all h-[75%] md:h-[80%] rounded-full flex items-center pl-3 md:pl-6 pr-1 gap-1.5 md:gap-4 shadow-md border border-[#da251c]"
          onClick={() => router.push("/auth/login")}
        >
          <span className="text-white font-medium text-[13px] md:text-[15px] tracking-wide">
            Login
          </span>
          <div className="bg-[#ece0e0] rounded-full p-[3px] shadow-inner h-7 w-7 md:h-[38px] md:w-[38px] flex items-center justify-center shrink-0">
            <div className="bg-white rounded-full h-full w-full flex items-center justify-center shadow-sm border border-gray-100">
              <FaRegUserCircle className="text-[#da251c] w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
};

export default FloatingNavbar;
