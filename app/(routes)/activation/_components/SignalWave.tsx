// components/SignalArc.tsx
"use client";

import { useEffect, useState } from "react";

interface SignalArcProps {
  isLeft?: boolean;
}

const SignalArc = ({ isLeft = true }: SignalArcProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseColor = "#D7201D";

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const items = [0, 1, 2].map((i) => {
    const isActive = i === activeIndex;
    const isDot = i < 2;
    const content = isDot ? "•" : isLeft ? "(" : ")";
    const fontSize = isDot ? "text-sm" : i === 1 ? "text-lg" : "text-xl"; 

    return (
      <span
        key={i}
        className={`transition-all duration-300 ${
          isActive ? "scale-125 opacity-100" : "scale-100 opacity-30"
        } ${fontSize} font-bold`}
        style={{
          color: baseColor,
          padding: "0 0.25rem",
          lineHeight: "1",
          display: "inline-block",
        }}
      >
        {content}
      </span>
    );
  });

  const displayItems = isLeft ? [...items].reverse() : items;

  return <div className="flex items-center">{displayItems}</div>;
};

export default SignalArc;
