"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import FloatingContactCS from "@/app/_components/FloatingContactCS";

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
  const [isDesktop, setIsDesktop] = useState(false);

  // Monitor screen size to switch popup assets
  React.useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const activeStepData = steps.find((s) => s.id === activeStep);

  return (
    <>
      {/* MOBILE VERSION */}
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
              <p className="text-white text-lg sm:text-4xl font-medium px-4">
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
      </div>

      {/* DESKTOP VERSION (Grid Layout) */}
      <div
        className="hidden lg:block min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage:
            "url('/assets/check-coverage/background-check-coverage.png')",
        }}
      >
        <div className="relative z-10 py-24 px-8 max-w-[1440px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-16"
          >
            <div className="flex flex-row items-center justify-center w-full mb-6">
              {/* Image Container (Fixed Width for Balance) */}
              <div className="relative w-40 h-40 shrink-0">
                <Image
                  src="/assets/Images/panduanVADesktop-0-new.png"
                  alt="Bayar Internet Ga Pake Telat!"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Stylized Figma Text */}
              <div className="flex flex-col gap-3">
                <p
                  style={{
                    color: "#FFF",
                    textAlign: "center",
                    textShadow:
                      "0 5px 0 #E54B48, 3px 3px 3px rgba(0, 0, 0, 0.4)",
                    WebkitTextStrokeWidth: "2.5px",
                    WebkitTextStrokeColor: "#D7201D",
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    fontSize: "56px", // Disesuaikan sedikit agar muat sebaris
                    fontStyle: "normal",
                    fontWeight: 900,
                    lineHeight: "110%",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap", // Paksa satu baris
                  }}
                >
                  Bayar internet ga pake telat!
                </p>

                <p className="text-white text-3xl text-center font-bold tracking-tight">
                  Lakukan pembayaran Via Virtual Account Bank dengan mengikuti
                  langkah berikut
                </p>
              </div>
            </div>
          </motion.div>

          {/* Grid Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setActiveStep(step.id)}
                className="group relative cursor-pointer"
              >
                <div className="relative w-full aspect-16/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
                  <Image
                    src={`/assets/Images/panduanVADesktop-${step.id}.png`}
                    alt={step.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-white text-black font-bold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                      Lihat Detail
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center justify-center bg-primary text-white w-8 h-8 rounded-full font-bold mb-2 shadow-lg">
                    {step.id}
                  </span>
                  <h3 className="text-white font-bold text-lg px-4 truncate">
                    {step.label}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SHARED POPUP OVERLAY */}
      <AnimatePresence>
        {activeStep !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveStep(null)}
            className="fixed inset-0 z-100 overflow-y-auto flex flex-col items-center justify-start bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[340px] sm:max-w-lg lg:max-w-7xl flex flex-col items-center my-3"
            >
              {/* Tutup Button Original */}
              <button
                onClick={() => setActiveStep(null)}
                className="mb-4 px-6 py-2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-lg font-bold border border-white/30 hover:bg-white/40 shadow-lg"
              >
                Tutup &times;
              </button>

              <div
                className={`relative w-full mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
                  isDesktop
                    ? "aspect-video max-h-[75vh]"
                    : "aspect-9/16 max-h-[75vh]"
                }`}
              >
                <Image
                  src={
                    isDesktop
                      ? `/assets/Images/panduanVADesktop-${activeStep}-popup-new.png`
                      : `/assets/Images/panduanVAmobile-${activeStep}-popup.png`
                  }
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

      <FloatingContactCS />
    </>
  );
};

export default PanduanCaraBayar;
