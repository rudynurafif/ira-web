import { jwtDecode } from "jwt-decode";
import moment from "moment";
import toast from "react-hot-toast";

export const PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
export const PHONE_REGEX2 = /^\d{8,15}$/;
export const regexEmail =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const NAME_REGEX = /^[a-zA-Z\s.\-]*$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function convertToCurrency(
  number: number | undefined,
  locale = "id-ID",
  currency = "IDR"
) {
  if (number) {
    return number.toLocaleString(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    });
  } else {
    return "";
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0"); // Pastikan menit selalu 2 digit
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0"); // Pastikan detik selalu 2 digit
  return `${minutes}:${remainingSeconds}`;
};

export function addUrlParam(param: string, value: any) {
  const url = new URL(window.location.href);

  url.searchParams.set(param, value);
  window.history.replaceState(null, "", url.toString());
}

export function resetUrlParam(param: string) {
  const url = new URL(window.location.href);

  url.searchParams.delete(param);
  window.history.replaceState(null, "", url.toString());
}

export function decodeJwt(token: string) {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return null;
  }
}

export function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function getFirstTwoWords(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/);

  return words.slice(0, 2).join(" ");
}

export function formatDate(expireAt: string): string {
  const date = new Date(expireAt);

  // Konversi ke WIB (UTC+7)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined,
  };

  const formatted = new Intl.DateTimeFormat("id-ID", options).format(date);

  // Ganti titik dengan titik dua jika perlu, dan tambahkan "WIB"
  return `${formatted} WIB`;
}

export const formatDateFilter = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // "2025-12-01"
};

export function formatISODate(
  isoString: string | null,
  timezoneOffsetHours: number = 7
): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  // Sesuaikan ke zona waktu tertentu (misal WIB = UTC+7)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const targetTime = new Date(utc + 3600000 * timezoneOffsetHours);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("id-ID", options);
  const parts = formatter.formatToParts(targetTime);

  // Ekstrak bagian untuk susun ulang secara eksplisit jika diperlukan
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const second = parts.find((p) => p.type === "second")?.value;

  return `${day} ${month} ${year}, pukul ${hour}:${minute}:${second} WIB`;
}

export function daysUntil(dateISO: string): number {
  if (!dateISO) return 0;

  const [y, m, d] = dateISO.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.trunc((target.getTime() - today.getTime()) / msPerDay);
}

export function packageCountdown(endDateISO: string) {
  const days = daysUntil(endDateISO);

  if (days > 0) {
    return {
      days,
      status: "active" as const,
      label: `${days} Hari`,
      note: `Berakhir dalam ${days} hari`,
    };
  }
  if (days <= 3 && days > 0) {
    return {
      days,
      status: "3_days_remaining" as const,
      label: `${days} Hari`,
      note: `Berakhir dalam ${days} hari`,
    };
  }
  if (days === 0) {
    return {
      days,
      status: "expires_today" as const,
      label: "Berakhir hari ini",
      note: "Paket berakhir hari ini",
    };
  }
  return {
    days: 0,
    status: "expired" as const,
    label: "Sudah berakhir",
    note: "Masa aktif telah berakhir",
  };
}

export function formatPaymentNumber(va: string): string {
  return (
    va
      ?.replace(/\s/g, "")
      .match(/.{1,4}/g)
      ?.join(" ") || ""
  );
}

export const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch(() => {
      toast.error("Failed to copy to clipboard");
    });
};

export const toastErrorFromAPI = (
  error: any,
  defaultMessage = "Terjadi kesalahan"
) => {
  // const errorStatusCode = error?.response?.data?.statusCode ?? "(status code)";
  const errorMsg =
    error?.response?.data?.message ??
    error?.message ??
    "Terjadi kesalahan, silakan coba lagi.";

  // toast.error(`Error ${errorStatusCode}: ${errorMsg}`);
  toast.error(errorMsg);
};

export const formattedDate = (dateString: string) => {
  const date = moment(dateString);
  return date.format("DD MMMM YYYY");
};

export function formatNamaWilayah(nama: string): string {
  return nama.replace(/^kab\./i, "kabupaten");
}

export const maskPassword = (password: string) => {
  return "*".repeat(password.length);
};
