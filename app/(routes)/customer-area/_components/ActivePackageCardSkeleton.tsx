import React from "react";
import Image from "next/image";
import starIcon from "@/public/assets/Icons/icon-star.svg";
import confetti from "@/public/assets/Icons/confetti.svg";
import packageIcon from "@/public/assets/Icons/hargaPaket.svg";
import sandClock from "@/public/assets/Icons/jam-pasir.svg";
import rocket from "@/public/assets/Icons/rocket.svg";
import calendar from "@/public/assets/Icons/calendar-clock.svg";

const ActivePackageCardSkeleton = () => {
  return (
    <div className="bg-linear-to-b from-white via-white to-[#CAE2EC] rounded-xl shadow-lg p-6 max-sm:p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Logo Skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <Image
            src={starIcon}
            alt="Starlite Icon"
            width={28}
            height={28}
            className="opacity-0"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Message */}
      <div className="pt-4">
        <div className="w-6 h-6 bg-gray-200 rounded-full mb-1"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>

      <div className="border-t border-gray-200 my-6"></div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded"></div>
            <div className="mt-3 w-20 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-24 h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivePackageCardSkeleton;
