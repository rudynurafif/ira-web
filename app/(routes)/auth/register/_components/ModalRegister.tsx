import Image from "next/image";
import React from "react";

import registerIcon from "@/public/assets/Icons/success-register.svg";

function ModalRegister({ isCovered }: { isCovered?: boolean }) {
  return (
    <div>
      <div className="flex justify-center">
        <Image alt="register" src={registerIcon} className="w-[13s0px]" />
      </div>
      <div className="text-center">
        <h1 className="text-xl text-dark-primary-2 font-bold mt-10">
          Terima kasih, pendaftaran Anda berhasil!
        </h1>
        <p className="text-sm w-[80%] mx-auto mt-3">
          {isCovered
            ? "Tim Starlite akan segera menghubungi Anda & perangkat akan dikirim dalam 1-2 hari kerja"
            : "Kami dalam proses pembangunan di daerah Anda. Kami akan menghubungi Anda dalam waktu dekat."}
        </p>
      </div>
      {isCovered && (
        <button className="w-full py-3 font-bold text-white bg-primary mt-8 rounded-xl cursor-pointer">
          Pantau pengiriman di sini
        </button>
      )}
    </div>
  );
}

export default ModalRegister;
