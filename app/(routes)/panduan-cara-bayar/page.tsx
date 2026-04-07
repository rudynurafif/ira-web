"use client";

import React, { useState } from "react";
import Image from "next/image";
import FloatingNavbar from "@/app/_components/FloatingNavbar";
import Footer from "@/app/_components/layout/Footer";
import { AnimatePresence, motion } from "framer-motion";

const steps = [
  {
    id: 1,
    text: "Buka aplikasi Internet Rakyat. Klik 'Login' atau 'Area Pelanggan'",
    label: "Masuk Aplikasi IRA",
  },
  {
    id: 2,
    text: "Masukkan nomor telepon untuk Login",
    label: "Login Akun IRA",
  },
  {
    id: 3,
    text: "Klik 'Perpanjang Paket' di bagian Home",
    label: "Perpanjang Paket IRA",
  },
  {
    id: 4,
    text: "Pilih paket lalu klik 'Bayar'",
    label: "Pilih Paket IRA yang Diinginkan",
  },
  {
    id: 5,
    text: "Pilih metode pembayaran, dan selesaikan sesuai instruksi yang ada",
    label: "Bayar Paket IRA",
  },
  {
    id: 6,
    text: "Pembayaran Berhasil",
    label: "Perpanjangan Paket IRA Berhasil",
  },
];

const PanduanCaraBayar = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const activeStepData = steps.find((s) => s.id === activeStep);

  return (
    <>
      {/* MOBILE VERSION (Red Background) */}
      <div
        className="min-h-screen relative overflow-hidden lg:hidden"
        style={{
          backgroundImage: "url('/assets/Images/banner-panduan-mobile.png')",
        }}
      >
        {/* Hero Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30 pointer-events-none z-0" />

        <div className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Header Image & Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-12 text-center"
            >
              <div className="relative w-full max-w-[600px] aspect-4/1 mb-4">
                <Image
                  src="/assets/Images/panduanVAmobile-0.png"
                  alt="Bayar Internet Ga Pake Telat!"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-white text-lg font-medium max-w-md px-4">
                Lakukan pembayaran dengan mengikuti langkah berikut
              </p>
            </motion.div>

            {/* Steps Section */}
            <div className="w-full space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative w-full aspect-[16/9.5] bg-transparent rounded-2xl overflow-hidden drop-shadow-xl cursor-pointer"
                  onClick={() => setActiveStep(step.id)}
                >
                  <Image
                    src={`/assets/Images/panduanVAmobile-${step.id}.png`}
                    alt={`Langkah ${step.id}: ${step.text}`}
                    fill
                    className="object-contain"
                  />
                  <span className="sr-only">
                    Step {step.id}: {step.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* POPUP OVERLAY */}
        <AnimatePresence>
          {activeStep !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStep(null)}
              className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[340px] flex flex-col items-center max-h-[95vh]"
              >
                {/* Close Button above the image */}
                <button
                  onClick={() => setActiveStep(null)}
                  className="mb-4 px-6 py-2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-lg font-bold border border-white/30 hover:bg-white/40 transition-colors shadow-lg"
                >
                  Tutup &times;
                </button>

                <div className="relative w-full aspect-9/16 max-h-[75vh] mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <Image
                    src={`/assets/Images/panduanVAmobile-${activeStep}-popup.png`}
                    alt={activeStepData?.label || ""}
                    fill
                    className="object-contain rounded-3xl"
                  />
                </div>

                <h3 className="text-xl font-bold text-white text-center leading-tight px-4 drop-shadow-lg">
                  {activeStepData?.label}
                </h3>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP VERSION (Simple Full Image) */}
      <div className="hidden lg:block w-full">
        <Image
          src="/assets/Images/panduanVA.png"
          alt="Panduan Cara Bayar Desktop"
          width={1920}
          height={1080}
          className="w-full h-auto"
          priority
        />
      </div>
    </>
  );
};

export default PanduanCaraBayar;
