import React from "react";
import Image from "next/image";
import CPEActivation from "@/public/assets/Images/cpe-activation.png";
import HeadsetIcon from "@/public/assets/Icons/headset.svg";
import { MdHeadsetMic } from "react-icons/md";

const CpeActivationStatus = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-6 max-w-[1100px] mx-auto">
        <div className="flex items-center justify-center">
          <Image
            src={CPEActivation}
            alt="CPE Router"
            width={177}
            height={130}
          />
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">
            Proses aktivasi CPE sedang berlangsung. Sabar ya, sebentar lagi
            aktif!
          </h2>
          <p className="text-sm  mb-4">
            Aktivasi CPE membutuhkan waktu sekitar [menit]. Jangan khawatir,
            setelah selesai kamu akan dapat notifikasi lewat WhatsApp atau bisa
            langsung cek statusnya di aplikasi Internet Rakyat. Jika kamu punya
            pertanyaan silakan hubungi customer service kami.
          </p>

          <button className="inline-flex w-fit items-center cursor-pointer justify-center gap-2 py-2 px-4 border border-primary text-primary rounded-full hover:bg-red-50 font-medium transition">
            Hubungi Customer Service <MdHeadsetMic />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CpeActivationStatus;
