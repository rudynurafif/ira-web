// components/SignalArc.tsx
"use client";

import { useEffect, useState } from "react";

interface SignalArcProps {
  isLeft?: boolean;
}

const SignalArc = ({ isLeft = true }: SignalArcProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseColor = "#D7201D";

  // Animasi bergantian setiap 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3); // 3 elemen
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Buat 3 elemen: ukuran makin besar dari dalam ke luar
  const items = [0, 1, 2].map((i) => {
    const isActive = i === activeIndex;
    const char = isLeft ? "(" : ")";
    const fontSize = `${40 + i * 8}px`; // 40, 48, 56px
    const opacity = isActive ? 1 : 0.3;
    const scale = isActive ? 1.2 : 1.0;

    return (
      <span
        key={i}
        className="inline-block transition-all duration-250 ease-out"
        style={{
          color: baseColor,
          fontSize,
          fontWeight: "900",
          transform: `scale(${scale})`,
          opacity,
          padding: "0 0.1rem",
          lineHeight: "1",
        }}
      >
        {char}
      </span>
    );
  });

  // Jika kiri → tampilkan urutan: (( ( → jadi reverse tampilan
  const displayItems = isLeft ? [...items].reverse() : items;

  return <div className="flex items-center">{displayItems}</div>;
};

export default SignalArc;
