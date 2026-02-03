import Image from "next/image";
import React from "react";

import imageSuccess from "@/public/assets/check-coverage/check-success.png";
import imageFailed from "@/public/assets/check-coverage/check-failed.png";
import toast from "react-hot-toast";

function Step1({
  status,
  setStep,
  onClose,
}: {
  status: boolean;
  setStep: (e: number) => void;
  onClose: () => void;
}) {
  const handleNext = () => {
    // jika sudah tercover
    if (status) {
      toast("Please wait, this feature is still on development");
    } else {
      onClose();
    }
  };

  return (
    <div className="rounded-xl overflow-hidden">
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
            : "Layanan di Areamu Segera Hadir"}
        </h1>
        <p className="mt-3 w-full mx-auto">
          {status
            ? "Klik tombol di bawah ini untuk mulai berlangganan paket internet Internet Rakyat."
            : "Jangan khwatir! Kami akan segera memberi tahu kamu melalui WhatsApp dan Aplikasi IRA jika layanan kami tersedia di daerahmu."}
        </p>
        <button
          onClick={handleNext}
          className="w-full cursor-pointer py-4 text-white font-bold bg-primary hover:bg-dark-primary-2 rounded-xl mt-6"
        >
          {status ? "Pilih Paket" : "Tutup"}
        </button>
      </div>
    </div>
  );
}

export default Step1;
