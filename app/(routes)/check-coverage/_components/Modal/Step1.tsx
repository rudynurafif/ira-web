import Image from "next/image";
import React from "react";

import imageSuccess from "@/public/assets/check-coverage/check-success.png";
import imageFailed from "@/public/assets/check-coverage/check-failed.png";

function Step1({
  status,
  setStep,
}: {
  status: boolean;
  setStep: (e: number) => void;
}) {
  return (
    <div className="">
      <div className="w-full">
        <Image
          alt="image-status"
          src={status ? imageSuccess : imageFailed}
          className="w-full"
        />
      </div>
      <div className="my-8 text-center px-5">
        <h1 className="text-primary text-2xl font-bold w-full sm:w-3/4 mx-auto">
          {status
            ? "Selamat! Alamat Anda berada di dalam jangkauan kami."
            : "Maaf, alamat Anda berada di luar jangkauan kami."}
        </h1>
        <p className="mt-3 w-full sm:w-3/4 mx-auto">
          {status
            ? "Klik tombol di bawah ini untuk pilih paket sesuai dengan kebutuhan Anda."
            : "Bantu kami agar wilayah Anda dapat terjangkau dengan mengisi data berikut ini."}
        </p>
        <button
          onClick={() => {
            // if (status) {
            //   setStep(2);
            // } else {
            //   setStep(4);
            // }
            window.location.href = "/auth/register"
          }}
          className="w-full cursor-pointer py-4 text-white font-bold bg-primary rounded-xl mt-6"
        >
          Isi Data
        </button>
      </div>
    </div>
  );
}

export default Step1;
