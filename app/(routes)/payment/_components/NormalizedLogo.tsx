"use client";
import { useEffect, useState } from "react";
import { StaticImageData } from "next/image";

interface NormalizedLogoProps {
  src: string | StaticImageData;
  alt: string;
  /** Lebar fixed yang diinginkan dalam px — tinggi mengikuti aspek rasio konten (default 80) */
  targetWidth?: number;
  className?: string;
}

/** Resolve StaticImageData atau string ke URL string */
function resolveUrl(src: string | StaticImageData): string {
  if (typeof src === "string") return src;
  return src.src; // Next.js StaticImageData
}

/**
 * Komponen logo yang autocrop transparent padding dari PNG.
 * Semua logo akan punya LEBAR yang sama (targetWidth), tinggi menyesuaikan aspek rasio konten asli.
 * Fallback gracefully jika CORS tidak diizinkan server.
 */
export function NormalizedLogo({
  src,
  alt,
  targetWidth = 80,
  className = "",
}: NormalizedLogoProps) {
  const [croppedSrc, setCroppedSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) return;

    const url = resolveUrl(src);
    let cancelled = false;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { setFailed(true); return; }

        ctx.drawImage(img, 0, 0);

        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Cari bounding box pixel non-transparan (alpha > 10)
        let minX = width, minY = height, maxX = 0, maxY = 0;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 10) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        if (cropW <= 0 || cropH <= 0) {
          if (!cancelled) setCroppedSrc(url);
          return;
        }

        // Crop canvas ke content bounds
        const outCanvas = document.createElement("canvas");
        outCanvas.width = cropW;
        outCanvas.height = cropH;
        const outCtx = outCanvas.getContext("2d");
        if (!outCtx) { setFailed(true); return; }
        outCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

        if (!cancelled) setCroppedSrc(outCanvas.toDataURL("image/png"));
      } catch {
        // SecurityError CORS → fallback
        if (!cancelled) setFailed(true);
      }
    };

    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };

    img.src = url;

    return () => { cancelled = true; };
  }, [src]);

  // Loading skeleton
  if (!croppedSrc && !failed) {
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded ${className}`}
        style={{ width: targetWidth, height: targetWidth * 0.4 }}
      />
    );
  }

  // Fallback — CORS block atau error, tampil dengan width fixed, height auto
  if (failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveUrl(src)}
        alt={alt}
        className={`object-contain ${className}`}
        style={{ width: targetWidth, height: "auto" }}
      />
    );
  }

  // Sukses autocrop — width fixed, height mengikuti aspek rasio konten yang sudah dicrop
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={croppedSrc!}
      alt={alt}
      className={`block ${className}`}
      style={{ width: targetWidth, height: "auto" }}
    />
  );
}
