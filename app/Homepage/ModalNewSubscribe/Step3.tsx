import Image from "next/image";
import React from "react";

// image
import banner from "@/public/assets/landing/ModalRegis/banner-step-4.webp";
import logoWA from "@/public/assets/icon/whatsapp-icon.png";

function Step3({ closeModal }: { closeModal: () => void }) {
  return (
    <div>
      <Image alt="banner-4" src={banner} />
      <div className="px-10 pt-10 py-20 text-center">
        <h1 className="text-[#003D76] text-lg sm:text-2xl font-bold">
          {/* Terima kasih telah mendaftar di Starlite. */}
          Terima kasih atas permintaan Anda! Kami dalam proses pembangunan di
          daerah Anda.
        </h1>
        <p className="text-black text-sm sm:text-lg mt-3">
          {/* Saat ini areamu belum tercover oleh kami. Namun, jangan khawatir! Tim
          kami akan menghubungi Anda secepat mungkin. */}
          {/* Kami akan menghubungi Anda dalam waktu dekat. */}
          Kami akan menghubungi Anda jika pembangunan daerah anda sudah siap.
        </p>
        <button
          id="button-close-modal-register"
          className="flex gap-1 justify-center items-center md:text-lg sm:text-base text-sm bg-[#FF9500] text-white font-bold rounded-xl py-3 px-10 mt-5 w-full"
          onClick={closeModal}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export default Step3;
