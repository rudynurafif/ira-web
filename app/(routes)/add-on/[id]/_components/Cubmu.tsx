"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import CubmuLoginModal from "./CubmuLoginModal";

type CubmuProps = { items: any[] };

const Cubmu = ({ items }: CubmuProps) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem("cubmu_login");
    if (!savedData) return;

    try {
      const parsed = JSON.parse(savedData);
      const connected = !!parsed?.connected;

      setIsConnected(connected);
      setUsername(parsed?.username ?? "");
      setPassword(parsed?.password ?? "");
    } catch {
      // ignore
    }
  }, []);

  const maskedUser = useMemo(() => {
    // contoh: "C**** S******"
    const fallback = "C**** S******";
    if (!username?.trim()) return fallback;

    const parts = username.trim().split(/\s+/);
    const first = parts[0] ?? "";
    const second = parts[1] ?? "";

    const mask = (s: string) => {
      if (!s) return "";
      if (s.length === 1) return "*";
      // bikin terasa seperti screenshot: huruf awal + bintang banyak
      return `${s[0]}****`;
    };

    const out = `${mask(first)} ${mask(second)}`.trim();
    return out || fallback;
  }, [username]);

  const maskedPass = useMemo(() => "********", []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative w-full">
        {/* Mobile: tinggi lebih pendek + adaptif */}
        <div className="relative h-[620px] w-full sm:h-[680px] md:h-130 md:h-140">
          {/* bg image */}
          <Image
            src="/assets/Images/cubmu-hero-bg.png"
            alt="CubMu Hero"
            fill
            priority
            className="object-cover object-center"
          />

          {/* overlay 1: dark wash */}
          <div className="absolute inset-0 bg-black/35" />

          {/* overlay 2: red dotted/pixel pattern */}
          <div
            className="absolute inset-0 opacity-35 mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,70,70,0.55) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="absolute inset-0 bg-[#b10000]/20" />

          {/* overlay 3: bottom heavy gradient */}
          <div className="absolute inset-x-0 bottom-0 h-60 bg-linear-to-b from-black/0 via-black/35 to-black/90" />

          {/* topbar (state 2 & 3) */}
          {isConnected && (
            <div className="absolute left-0 right-0 top-0 z-30">
              {/* Mobile: jadi stacked (user info + button) */}
              <div className="bg-black/30 backdrop-blur-md">
                <div className="mx-auto container px-4 sm:px-6 py-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* left user info */}
                    <div className="hidden sm:flex flex-col gap-2 text-white/95">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
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
                        <span className="text-sm font-semibold tracking-wide">
                          {maskedUser}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-white/85">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
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
                        <span className="text-sm font-semibold tracking-wide">
                          {maskedPass}
                        </span>
                      </div>
                    </div>

                    {/* right pill button */}
                    <button
                      onClick={() => setShowCredentialModal(true)}
                      className={[
                        "w-full md:w-auto",
                        "rounded-full bg-white",
                        "px-6 sm:px-10 py-3",
                        "text-xs sm:text-sm font-extrabold text-red-600",
                        "shadow-[0_18px_45px_rgba(0,0,0,0.35)] ring-1 ring-white/40",
                        "transition hover:-translate-y-px hover:shadow-[0_22px_60px_rgba(0,0,0,0.45)] active:translate-y-0",
                      ].join(" ")}
                    >
                      Lihat username dan kata sandi untuk login
                    </button>
                  </div>
                </div>
              </div>

              {/* subtle bottom divider */}
              <div className="h-px w-full bg-white/10" />
            </div>
          )}

          {/* hero content */}
          <div
            className={[
              "absolute inset-0 z-20",
              isConnected ? "pt-28 sm:pt-30" : "pt-16 sm:pt-18",
            ].join(" ")}
          >
            <div className="mx-auto h-full container px-4 sm:px-6">
              {/* logos */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                <Image
                  src="/assets/Images/logo-ira-white.png"
                  alt="Internet Rakyat"
                  width={150}
                  height={48}
                  className="h-9 sm:h-11 w-auto"
                  priority
                />
                <Image
                  src="/assets/Images/cubmu/logo-cubmu.png"
                  alt="CubMu"
                  width={150}
                  height={48}
                  className="h-9 sm:h-11 w-auto"
                  priority
                />
              </div>

              {/* Mobile: jadi 1 kolom (text) + download muncul di bawah */}
              <div className="mt-10 sm:mt-12 flex h-auto md:h-90 flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
                <div className="max-w-none md:max-w-215">
                  <h1 className="text-[30px] leading-[1.08] sm:text-[40px] md:text-[54px] font-extrabold tracking-[-0.02em]">
                    Internet cepat sudah kamu punya.
                    <br />
                    Sekarang saatnya nikmati hiburannya!
                  </h1>

                  <p className="mt-4 sm:mt-5 max-w-none md:max-w-190 text-sm sm:text-lg md:text-xl text-white/90">
                    Nonton film, series, anime, sampai channel TV favorit kamu
                    di aplikasi CubMu.
                  </p>

                  {/* CTA */}
                  <button
                    className={[
                      "mt-6 sm:mt-8 inline-flex items-center justify-center",
                      "w-full sm:w-auto",
                      "rounded-full px-8 sm:px-12 py-3.5 sm:py-4",
                      "text-base sm:text-xl font-extrabold text-red-600",
                      "shadow-[0_18px_55px_rgba(0,0,0,0.45)]",
                      "ring-1 ring-white/55",
                      "bg-linear-to-r from-white via-[#ffe1e1] to-white",
                      "transition hover:-translate-y-px active:translate-y-0",
                    ].join(" ")}
                  >
                    Mulai Streaming Sekarang!
                  </button>

                  {/* Download quick (mobile) - biar gak “kosong” karena yang kanan hidden */}
                  <div className="mt-6 lg:hidden">
                    <div className="mb-3 text-sm font-bold text-white/95">
                      Download Aplikasi CubMu
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <Image
                        src="/assets/Images/cubmu/app-store-button.png"
                        alt="App Store"
                        width={190}
                        height={60}
                        className="h-12 sm:h-14.5 w-auto"
                        priority
                      />
                      <Image
                        src="/assets/Images/cubmu/google-play-button.png"
                        alt="Google Play"
                        width={190}
                        height={60}
                        className="h-12 sm:h-14.5 w-auto"
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Download (right) desktop */}
                <div className="hidden lg:flex flex-col items-end">
                  <div className="mb-4 text-lg font-bold text-white">
                    Download Aplikasi CubMu
                  </div>

                  <div className="flex items-center gap-4">
                    <Image
                      src="/assets/Images/cubmu/app-store-button.png"
                      alt="App Store"
                      width={190}
                      height={60}
                      className="h-14.5 w-auto"
                      priority
                    />
                    <Image
                      src="/assets/Images/cubmu/google-play-button.png"
                      alt="Google Play"
                      width={190}
                      height={60}
                      className="h-14.5 w-auto"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto container px-4 sm:px-6 mt-6 sm:mt-8">
        <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
          {/* left pill */}
          <div className="shrink-0">
            <div className="inline-flex rounded-full bg-[#b30d0d] px-8 sm:px-14 py-4 sm:py-7 text-lg sm:text-2xl font-extrabold shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
              Trending Now
            </div>
          </div>

          {/* posters */}
          <div className="flex w-full gap-4 sm:gap-6 overflow-x-auto pb-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="shrink-0 overflow-hidden rounded-2xl shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
                style={{ width: 170 }}
              >
                {item.banner_desktop && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_URL_OBS}${item.banner_desktop}`}
                    alt={item.title}
                    width={210}
                    height={310}
                    className="h-[250px] w-[170px] sm:h-77.5 sm:w-52.5 object-cover object-center"
                    onClick={() => {
                      if (!item.call_to_action) return;
                      const url = item.call_to_action.startsWith("http")
                        ? item.call_to_action
                        : `https://${item.call_to_action}`;
                      window.open(url, "_blank");
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal (state 3) */}
      {showCredentialModal && (
        <CubmuLoginModal
          isOpen={showCredentialModal}
          onClose={() => setShowCredentialModal(false)}
          username={username}
          password={password}
        />
      )}
    </div>
  );
};

export default Cubmu;
