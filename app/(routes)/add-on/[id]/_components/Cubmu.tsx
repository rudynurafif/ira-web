/* eslint-disable @next/next/no-img-element */
// app/cubmu/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import CubmuLoginModal from "./CubmuLoginModal";

const Cubmu = ({ items }: { items: any[] }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const savedData = localStorage.getItem("cubmu_login");
    if (!savedData) return;

    try {
      const parsed = JSON.parse(savedData);
      const connected = !!parsed?.connected;
      setIsConnected(connected);

      if (parsed?.username) setUsername(parsed.username);
      if (parsed?.password) setPassword(parsed.password);
    } catch {
      // ignore
    }
  }, []);

  const maskedUser = useMemo(() => {
    // contoh mask seperti gambar: "C**** S******"
    if (!username) return "C**** S******";
    const parts = username.split(" ");
    const first = parts[0] ?? "";
    const second = parts[1] ?? "";
    const mask = (s: string) => (s.length <= 1 ? "*" : s[0] + "****");
    return `${mask(first)} ${mask(second)}`.trim() || "C**** S******";
  }, [username]);

  const maskedPass = useMemo(() => {
    return password ? "********" : "********";
  }, [password]);

  const handleShowPassword = () => setShowPassword(true);
  const handleCloseModal = () => setShowPassword(false);

  const trending = [
    { title: "LAPOR PAK!", img: "/assets/Images/cubmu/trending-lapor-pak.png" },
    { title: "KHUTULUN", img: "/assets/Images/cubmu/trending-khutulun.png" },
    {
      title: "ANAK NELAYAN & KAPAL SETAN",
      img: "/assets/Images/cubmu/trending-anak-nelayan.png",
    },
    {
      title: "SIMA'S SONG",
      img: "/assets/Images/cubmu/trending-sima-song.png",
    },
    {
      title: "SIMA'S SONG",
      img: "/assets/Images/cubmu/trending-sima-song.png",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* HERO (seperti gambar) */}
      <section className="relative w-full overflow-hidden">
        {/* Background */}
        <div
          className="relative h-[420px] md:h-[460px] w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/Images/cubmu-hero-bg.png')" }}
        >
          {/* overlay gelap tipis biar teks kebaca */}
          <div className="absolute inset-0 bg-black/35" />

          {/* TOP BAR hanya saat connected (seperti gambar ke-2 & ke-3) */}
          {isConnected && (
            <div className="absolute left-0 right-0 top-0 z-20 h-[72px] bg-black/35 backdrop-blur-[2px]">
              <div className="flex h-full items-center justify-between px-10">
                {/* user info kiri (2 baris) */}
                <div className="flex flex-col gap-2 text-white/90">
                  <div className="flex items-center gap-3">
                    {/* icon user */}
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <path
                          d="M20 22c0-4.418-3.582-8-8-8s-8 3.582-8 8"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-medium">{maskedUser}</span>
                  </div>

                  <div className="flex items-center gap-3 text-white/80">
                    {/* icon lock */}
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 11V8a5 5 0 0 1 10 0v3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6 11h12v10H6V11Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-medium">{maskedPass}</span>
                  </div>
                </div>

                {/* tombol pill kanan */}
                <button
                  onClick={handleShowPassword}
                  className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-red-600 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                >
                  Lihat username dan kata sandi untuk login
                </button>
              </div>
            </div>
          )}

          {/* CONTENT HERO */}
          <div
            className={[
              "absolute inset-0 z-10 flex h-full w-full flex-col px-10",
              isConnected ? "pt-[92px]" : "pt-[56px]",
            ].join(" ")}
          >
            {/* Logo row kiri atas (seperti gambar) */}
            <div className="flex items-center gap-6">
              <Image
                src="/assets/Images/logo-ira-white.png"
                alt="Internet Rakyat"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <Image
                src="/assets/Images/cubmu/logo-cubmu.png"
                alt="CubMu"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>

            {/* Main hero row: kiri text + kanan download (seperti gambar) */}
            <div className="mt-10 flex flex-1 items-center justify-between gap-10">
              {/* LEFT TEXT */}
              <div className="max-w-[760px] text-white">
                <h1 className="text-[44px] leading-[1.08] font-extrabold tracking-tight">
                  Internet cepat sudah kamu punya.
                  <br />
                  Sekarang saatnya nikmati hiburannya!
                </h1>

                <p className="mt-5 text-lg text-white/90">
                  Nonton film, series, anime, sampai channel TV favorit kamu di
                  aplikasi CubMu.
                </p>

                {/* CTA putih dengan teks merah (seperti gambar) */}
                <button className="mt-8 rounded-full bg-white px-10 py-4 text-xl font-extrabold text-red-600 shadow-[0_14px_35px_rgba(0,0,0,0.35)]">
                  Mulai Streaming Sekarang!
                </button>
              </div>

              {/* RIGHT DOWNLOAD (di dalam hero, kanan) */}
              <div className="hidden lg:flex flex-col items-end">
                <div className="mb-4 text-lg font-semibold text-white">
                  Download Aplikasi CubMu
                </div>

                <div className="flex items-center gap-4">
                  <Image
                    src="/assets/Images/cubmu/app-store-button.png"
                    alt="App Store"
                    width={170}
                    height={56}
                    className="h-[56px] w-auto"
                    priority
                  />
                  <Image
                    src="/assets/Images/cubmu/google-play-button.png"
                    alt="Google Play Store"
                    width={170}
                    height={56}
                    className="h-[56px] w-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING NOW (pill kiri + poster horizontal, seperti gambar) */}
      <section className="px-10 pb-10">
        <div className="flex items-start gap-8">
          {/* pill besar kiri */}
          <div className="shrink-0">
            <div className="rounded-full bg-red-700 px-12 py-6 text-2xl font-extrabold text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              Trending Now
            </div>
          </div>

          {/* posters row */}
          <div className="flex w-full gap-6 overflow-x-auto pb-3">
            {/* {trending.map((item, i) => (
              <div
                key={i}
                className="shrink-0 overflow-hidden rounded-2xl"
                style={{ width: 190 }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-67.5 w-full object-cover"
                />
              </div>
            ))} */}
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg">
                {item.banner_desktop && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_URL_OBS}${item.banner_desktop}`}
                    alt={item.title}
                    width={190}
                    height={135}
                    className="mt-3 rounded-md max-w-full h-auto rounded"
                    onClick={() =>
                      item.call_to_action &&
                      window.open(
                        item.call_to_action.startsWith("http")
                          ? item.call_to_action
                          : `https://${item.call_to_action}`
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Download versi mobile (kalau layar kecil, pindah ke bawah) */}
        <div className="mt-8 lg:hidden text-center">
          <h2 className="text-lg font-bold text-white mb-4">
            Download Aplikasi CubMu
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Image
              src="/assets/Images/cubmu/app-store-button.png"
              alt="App Store"
              width={170}
              height={56}
              className="h-[56px] w-auto"
            />
            <Image
              src="/assets/Images/cubmu/google-play-button.png"
              alt="Google Play Store"
              width={170}
              height={56}
              className="h-[56px] w-auto"
            />
          </div>
        </div>
      </section>

      {/* Modal Login */}
      {showPassword && (
        <CubmuLoginModal
          isOpen={showPassword}
          onClose={handleCloseModal}
          username={username}
          password={password}
        />
      )}
    </div>
  );
};

export default Cubmu;
