"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { IoMdClose } from "react-icons/io";

interface NotificationToastProps {
  title: string;
  body: string;
  url?: string;
  duration?: number; // in ms, default 5000
  onClose: () => void;
}

export default function NotificationToast({
  title,
  body,
  url,
  duration = 10000,
  onClose,
}: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  const router = useRouter();

  const handleClick = () => {
    if (url) {
      router.push(url);
    }
    onClose();
  };

  return (
    <div className="relative max-w-[480px]">
      <div
        onClick={handleClick}
        className="w-[95%] fixed top-6 right-2 z-50 cursor-pointer bg-white border border-gray-200 shadow-lg rounded-xl p-4 hover:shadow-xl transition"
      >
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent redirect on close button click
              onClose();
            }}
            className=" text-gray-500 hover:text-gray-800"
          >
            <IoMdClose size={20} className="text-black" />
          </button>
        </div>
        {/* <div className="flex justify-between items-start"> */}
        <div>
          <p className="text-base font-semibold text-gray-800 text-ellipsis">
            {title}
          </p>
          <p className="text-sm text-gray-600 mt-1 text-ellipsis">{body}</p>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}
