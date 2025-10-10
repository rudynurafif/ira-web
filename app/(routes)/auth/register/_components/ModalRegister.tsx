import Image from "next/image";
import React from "react";
import Lottie from "lottie-react";
import gifBox from "@/public/assets/Icons/box-gif.json";
import gifConstruction from "@/public/assets/Icons/construction.json";

import registerIcon from "@/public/assets/Icons/success-register.svg";

function ModalRegister({ isCovered }: { isCovered?: boolean }) {
  return (
    <div>
      <div className="flex justify-center">
        <Lottie
          width={104}
          height={104}
          className="w-[170px] sm:w-[190px] md:w-[200px] lg:w-[240px] lg:h-[240px]"
          animationData={isCovered ? gifBox : gifConstruction}
        />
      </div>
      <div className="text-center">
        <h1 className="text-xl text-dark-primary-2 font-bold mt-3">
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
