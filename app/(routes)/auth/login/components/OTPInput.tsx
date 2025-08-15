"use client";

import { Figtree } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type Props = {
  length?: number;
  onChange?: (value: string) => void;
};

const OtpInput = ({ length = 6, onChange }: Props) => {
  const [values, setValues] = useState<string[]>(
    Array.from({ length }, () => "")
  );
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    onChange?.(values.join(""));
  }, [values, onChange]);

  const setAt = (idx: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    setValues((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
  };

  const handleChange =
    (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Hanya ambil angka, tolak huruf/simbol
      const v = raw.replace(/[^0-9]/g, "");

      // Kalau kosong, update lalu stop
      if (v === "") {
        setAt(i, "");
        return;
      }

      // Ambil hanya 1 digit terakhir
      const digit = v.slice(-1);
      setAt(i, digit);

      // Fokus ke input berikutnya jika ada angka valid
      if (digit && refs.current[i + 1]) {
        refs.current[i + 1]?.focus();
      }
    };

  const handleKeyDown =
    (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !values[i] && refs.current[i - 1]) {
        refs.current[i - 1]?.focus();
      }
      if (e.key === "ArrowLeft" && refs.current[i - 1])
        refs.current[i - 1]?.focus();
      if (e.key === "ArrowRight" && refs.current[i + 1])
        refs.current[i + 1]?.focus();
    };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    const next = Array.from({ length }, (_, i) => data[i] ?? "");
    setValues(next);
    const lastFilled = Math.min(data.length, length) - 1;
    if (lastFilled >= 0) refs.current[lastFilled]?.focus();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((d, i) => (
        <div key={i} className="flex items-center">
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={d}
            onChange={handleChange(i)}
            onKeyDown={handleKeyDown(i)}
            onPaste={handlePaste}
            className={`${figtree.className} h-[51px] w-[48px] rounded-xl bg-primary-spectrum border border-gray-border text-center text-lg font-medium outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100`}
          />
          {/* Tambahkan strip setelah digit ke-3 */}
          {i === Math.floor(length / 2) - 1 && (
            <span className="ms-2 text-gray-500 text-lg">-</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default OtpInput;
