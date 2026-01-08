import Image from "next/image";
import React from "react";
import Lottie from "lottie-react";
import gifBox from "@/public/assets/Icons/box-gif.json";
import gifConstruction from "@/public/assets/Icons/construction.json";

import registerIcon from "@/public/assets/Icons/success-register.svg";
import { useRouter } from "next/navigation";

function ModalRegister({ isCovered }: { isCovered?: boolean }) {
  const router = useRouter();

  const toCustomerArea = () => {
    window.location.href = "/customer-area";
  };

  const toHomePage = () => {
    window.location.href = "/";
  };

  return (
    <div className="">
      <div className="flex justify-center">
        <Lottie
          width={104}
          height={104}
          className="w-[170px] sm:w-[190px] md:w-[200px] lg:w-60 lg:h-60"
          animationData={isCovered ? gifBox : gifConstruction}
        />
      </div>
      <div className="text-center">
        <h1 className="text-xl text-dark-primary-2 font-bold mt-3">
          Terima kasih, pendaftaran Anda berhasil!
        </h1>
        <p className="text-sm mt-3">
          {isCovered
            ? "Tim Internet Rakyat akan segera menghubungi Anda & perangkat dalam antrian untuk segera dikirim."
            : "Kami dalam proses pembangunan di daerah Anda. Kami akan menghubungi Anda dalam waktu dekat."}
        </p>
      </div>
      {isCovered ? (
        <div className="text-center">
          <button
            className="w-full py-3 font-bold text-white bg-primary mt-8 rounded-xl cursor-pointer"
            onClick={toCustomerArea}
          >
            Pantau pengiriman di sini
          </button>
        </div>
      ) : (
        <div className="text-center">
          <button
            className="w-full py-3 font-bold text-white bg-primary mt-8 rounded-xl cursor-pointer"
            onClick={toHomePage}
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  );
}

export default ModalRegister;
