"use client";
import React, { useState } from "react";
import Image from "next/image";
import ModalTemplate from "./modal/ModalTemplate";
import { handleDownloadClick } from "../_shared/utils";
import csIcon from "@/public/assets/Icons/CS-Button.png";
import logoRedIra from "@/public/assets/Icons/Logo-Ira-Red.png";
import googlePlay from "@/public/assets/Images/GooglePlayBlack2.png";
import appStore from "@/public/assets/Images/AppStoreBlack2.png";

const FloatingContactCS = () => {
  const [isCSModalOpen, setIsCSModalOpen] = useState(false);
  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[999]">
        {" "}
        {/* ✅ Perbaiki z-999 */}
        <button
          onClick={() => setIsCSModalOpen(true)}
          className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          title="Hubungi CS"
        >
          <Image
            src={csIcon}
            alt="Hubungi CS"
            width={64} // ✅ Tambahkan width
            height={64} // ✅ Tambahkan height
            className="w-16 h-16 object-contain"
            sizes="64px" // ✅ Tambahkan sizes
            loading="lazy" // ✅ Tambahkan (below fold)
          />
        </button>
      </div>

      {/* Modal Hubungi CS */}
      {isCSModalOpen && (
        <ModalTemplate
          closeModal={() => setIsCSModalOpen(false)}
          width="max-w-sm"
        >
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mx-auto mb-6">
              <Image
                src={logoRedIra}
                alt="Logo IRA"
                width={80}
                height={80}
                className="object-contain"
                sizes="80px" // ✅ Tambahkan sizes
                loading="lazy" // ✅ Tambahkan (modal)
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Download Aplikasi IRA
            </h3>
            <p className="text-gray-700 text-sm mb-8">
              Silahkan download aplikasi IRA untuk terhubung dengan Customer
              Service kami.
            </p>

            <div className="flex justify-center items-center gap-6 bg-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadClick("apple");
                }}
                className="transition-transform hover:scale-105 active:scale-95"
              >
                <Image
                  alt="Download on the App Store"
                  src={appStore}
                  width={220}
                  height={65}
                  className="w-40 sm:w-60 h-auto rounded"
                  sizes="(max-width: 640px) 160px, 240px" // ✅ Tambahkan sizes
                  loading="lazy" // ✅ Tambahkan (modal)
                />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadClick("google");
                }}
                className="transition-transform hover:scale-105 active:scale-95"
              >
                <Image
                  alt="Get it on Google Play"
                  src={googlePlay}
                  width={220}
                  height={65}
                  className="w-40 sm:w-60 h-auto rounded"
                  sizes="(max-width: 640px) 160px, 240px" // ✅ Tambahkan sizes
                  loading="lazy" // ✅ Tambahkan (modal)
                />
              </button>
            </div>
          </div>
        </ModalTemplate>
      )}
    </>
  );
};

export default FloatingContactCS;
