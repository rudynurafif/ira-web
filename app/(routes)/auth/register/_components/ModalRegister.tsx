import Image from "next/image";
import React from "react";
import Lottie from "lottie-react";
import gifBox from "@/public/assets/Icons/box-gif.json";
import gifConstruction from "@/public/assets/Icons/construction.json";

import { deleteCookie, getCookie } from "cookies-next";

function ModalRegister({
  isCovered,
  mode,
}: {
  isCovered?: boolean;
  mode?: "register" | "reregister" | "update_address";
}) {
  const token = getCookie("token-ira");

  const handleNext = () => {
    if (token && (mode === "reregister" || mode === "update_address")) {
      window.location.href = "/customer-area";
    } else {
      deleteCookie("token-ira");
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="">
      <div className="flex justify-center">
        <Lottie
          width={104}
          height={104}
          className="w-42.5 sm:w-47.5 md:w-50 lg:w-60 lg:h-60"
          animationData={isCovered ? gifBox : gifConstruction}
        />
      </div>
      <div className="text-center">
        <h1 className="text-xl text-dark-primary-2 font-bold mt-3">
          {mode === "register" || mode === "reregister"
            ? "Terima kasih, pendaftaran Anda berhasil!"
            : "Terima kasih, data Anda berhasil diperbarui!"}
        </h1>
        <p className="text-sm mt-3">
          {isCovered
            ? "Tim Internet Rakyat akan segera menghubungi Anda & perangkat dalam antrian untuk segera dikirim."
            : "Kami dalam proses pembangunan di daerah Anda. Kami akan menghubungi Anda dalam waktu dekat."}
        </p>
      </div>
      <div className="text-center">
        <button
          className="w-full py-3 font-bold text-white bg-primary hover:bg-dark-primary-2 mt-8 rounded-xl cursor-pointer"
          onClick={handleNext}
        >
          {mode === "register" ? "Selanjutnya" : "Kembali ke halaman utama"}
        </button>
      </div>
    </div>
  );
}

export default ModalRegister;
