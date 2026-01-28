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
      <section className="relative w-full ">
        <div className="relative h-130 w-full md:h-140">
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

          {/* overlay 2: red dotted/pixel pattern (feel screenshot) */}
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
              <div className="h-21 bg-black/30 backdrop-blur-md">
                <div className="mx-auto flex h-full container px-6 items-center justify-between">
                  {/* left user info */}
                  <div className="flex flex-col gap-2 text-white/95">
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
                    className="rounded-full bg-white px-10 py-3 text-sm font-extrabold text-red-600 shadow-[0_18px_45px_rgba(0,0,0,0.35)] ring-1 ring-white/40 transition hover:-translate-y-px hover:shadow-[0_22px_60px_rgba(0,0,0,0.45)] active:translate-y-0"
                  >
                    Lihat username dan kata sandi untuk login
                  </button>
                </div>
              </div>

              {/* subtle bottom divider like screenshot */}
              <div className="h-px w-full bg-white/10" />
            </div>
          )}

          {/* hero content */}
          <div
            className={[
              "absolute inset-0 z-20",
              isConnected ? "pt-30" : "pt-18",
            ].join(" ")}
          >
            <div className="mx-auto h-full container px-6">
              {/* logos */}
              <div className="flex items-center gap-8">
                <Image
                  src="/assets/Images/logo-ira-white.png"
                  alt="Internet Rakyat"
                  width={150}
                  height={48}
                  className="h-11 w-auto"
                  priority
                />
                <Image
                  src="/assets/Images/cubmu/logo-cubmu.png"
                  alt="CubMu"
                  width={150}
                  height={48}
                  className="h-11 w-auto"
                  priority
                />
              </div>

              {/* left text + right download */}
              <div className="mt-12 flex h-90 items-center justify-between gap-12">
                <div className="max-w-215">
                  <h1 className="text-[46px] font-extrabold leading-[1.06] tracking-[-0.02em] md:text-[54px]">
                    Internet cepat sudah kamu punya.
                    <br />
                    Sekarang saatnya nikmati hiburannya!
                  </h1>

                  <p className="mt-5 max-w-190 text-lg text-white/90 md:text-xl">
                    Nonton film, series, anime, sampai channel TV favorit kamu
                    di aplikasi CubMu.
                  </p>

                  {/* CTA pill (gradient feel seperti screenshot) */}
                  <button
                    className={[
                      "mt-8 inline-flex items-center justify-center",
                      "rounded-full px-12 py-4",
                      "text-xl font-extrabold text-red-600",
                      "shadow-[0_18px_55px_rgba(0,0,0,0.45)]",
                      "ring-1 ring-white/55",
                      "bg-linear-to-r from-white via-[#ffe1e1] to-white",
                      "transition hover:-translate-y-px active:translate-y-0",
                    ].join(" ")}
                  >
                    Mulai Streaming Sekarang!
                  </button>
                </div>

                {/* Download (right) */}
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
      <section className="mx-auto container px-6 mt-8 ">
        <div className="mt-6 flex items-start gap-8">
          {/* left pill */}
          <div className="shrink-0">
            <div className="rounded-full bg-[#b30d0d] px-14 py-7 text-2xl font-extrabold shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
              Trending Now
            </div>
          </div>

          {/* posters */}
          <div className="flex w-full gap-6 overflow-x-auto pb-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="shrink-0 overflow-hidden rounded-2xl shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
                style={{ width: 210 }}
              >
                {item.banner_desktop && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_URL_OBS}${item.banner_desktop}`}
                    alt={item.title}
                    width={210}
                    height={310}
                    className="h-77.5 w-52.5 object-cover object-center"
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

        {/* Download mobile */}
        <div className="mt-10 lg:hidden text-center">
          <div className="mb-4 text-lg font-bold">Download Aplikasi CubMu</div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Image
              src="/assets/Images/cubmu/app-store-button.png"
              alt="App Store"
              width={190}
              height={60}
              className="h-14.5 w-auto"
            />
            <Image
              src="/assets/Images/cubmu/google-play-button.png"
              alt="Google Play"
              width={190}
              height={60}
              className="h-14.5 w-auto"
            />
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
