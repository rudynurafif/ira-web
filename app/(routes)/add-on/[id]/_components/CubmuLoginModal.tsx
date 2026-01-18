"use client";

import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import React, { useMemo, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  password: string;
};

const CopyIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M9 9h10v10H9V9Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function CubmuLoginModal({
  isOpen,
  onClose,
  username,
  password,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<"username" | "password" | null>(
    null
  );

  const safeUsername = useMemo(() => username || "-", [username]);
  const safePassword = useMemo(() => password || "-", [password]);

  if (!isOpen) return null;

  const doCopy = async (text: string, key: "username" | "password") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      // fallback minimal
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1200);
    }
  };

  return (
    <ModalTemplate closeModal={onClose} classNameModal="!max-w-[760px]">
      <div className="px-10 py-8">
        <h3 className="text-lg font-extrabold text-black">
          Berikut username dan kata sandi untuk login aplikasi CubMu
        </h3>

        <div className="mt-6 space-y-5">
          {/* Username */}
          <div>
            <div className="mb-2 text-sm font-semibold text-black/60">
              Username
            </div>

            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-[#f6f7fb] px-4 py-3">
              <input
                value={safeUsername}
                readOnly
                className="w-full bg-transparent text-base font-medium text-black outline-none"
              />

              <button
                onClick={() => doCopy(safeUsername, "username")}
                className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-black/70 transition hover:bg-black/5"
                aria-label="Copy username"
              >
                <CopyIcon />
              </button>
            </div>

            {copiedKey === "username" && (
              <div className="mt-2 text-xs font-semibold text-green-600">
                Username berhasil disalin
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 text-sm font-semibold text-black/60">
              Kata Sandi
            </div>

            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-[#f6f7fb] px-4 py-3">
              <input
                value={safePassword}
                readOnly
                className="w-full bg-transparent text-base font-medium text-black outline-none"
              />

              <button
                onClick={() => doCopy(safePassword, "password")}
                className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-black/70 transition hover:bg-black/5"
                aria-label="Copy password"
              >
                <CopyIcon />
              </button>
            </div>

            {copiedKey === "password" && (
              <div className="mt-2 text-xs font-semibold text-green-600">
                Kata sandi berhasil disalin
              </div>
            )}
          </div>
        </div>

        {/* Button bottom */}
        <button
          onClick={onClose}
          className="mt-8 h-[56px] w-full rounded-full bg-[#d10f0f] text-base font-extrabold text-white shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:brightness-110 active:brightness-95"
        >
          Tutup
        </button>
      </div>
    </ModalTemplate>
  );
}
