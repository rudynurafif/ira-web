"use client";

import Image from "next/image";
import { MdHeadsetMic } from "react-icons/md";
import CPEIRA from "@/public/assets/Images/cpe-ira.png";
import SignalWave from "../_components/SignalWave";
import SignalArc from "../_components/SignalWave";

const CpeActivationPage = () => {
  const phoneCS = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 relative flex justify-center items-center">
        {/* Kiri */}
        <div className="absolute left-[-60px] top-1/2 transform -translate-y-1/2 z-0">
          <SignalArc isLeft={true} />
        </div>

        {/* Gambar CPE */}
        <Image
          src={CPEIRA}
          alt="Activating CPE"
          className="w-auto h-auto max-w-[150px] sm:max-w-[300px] z-10 relative"
        />

        {/* Kanan */}
        <div className="absolute right-[-60px] top-1/2 transform -translate-y-1/2 z-0">
          <SignalArc isLeft={false} />
        </div>
      </div>

      <div className="text-center max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold  mb-4">
          Hooray! Proses Aktivasi CPE Sedang Berlangsung
        </h1>
        <p className="text-sm sm:text-base  leading-relaxed">
          Aktivasi CPE membutuhkan waktu sekitar <strong>[menit]</strong>.
          Jangan khawatir, setelah selesai kamu akan dapat notifikasi lewat
          WhatsApp atau bisa langsung cek statusnya di aplikasi Internet Rakyat.
          Jika kamu punya pertanyaan silakan hubungi customer service kami.
        </p>
      </div>

      <button
        onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
        className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-dark-primary-2 transition shadow-lg"
      >
        Hubungi Customer Service <MdHeadsetMic size={20} />
      </button>
    </div>
  );
};

export default CpeActivationPage;
