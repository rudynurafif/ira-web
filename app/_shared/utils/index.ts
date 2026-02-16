import { Level } from "@/app/(routes)/activation/_components/SignalChecking";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { deleteCookie } from "cookies-next";

export const PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
export const PASSWORD_ALLOWED_CHARS_REGEX = /^[a-zA-Z0-9#!_]+$/;
export const PASSWORD_INPUT_FILTER_REGEX = /[a-zA-Z0-9#!_]/g;
export const PHONE_LIVE_REGEX = /^(08|62)\d{5,13}$/;
export const PHONE_REGEX2 = /^\d{8,15}$/;
export const regexEmail =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const NAME_REGEX = /^[a-zA-Z\s.\-]*$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function convertToCurrency(
  number: number | undefined,
  locale = "id-ID",
  currency = "IDR",
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

export function convertToCurrency2(
  number: string | number,
  locale = "id-ID",
  currency = "IDR",
) {
  // Mengonversi string ke number
  const num = typeof number === "string" ? parseFloat(number) : number;

  // Validasi angka yang benar
  if (!isNaN(num)) {
    return num.toLocaleString(locale, {
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
  delay: number,
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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // bulan dimulai dari 0
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateFilter2 = (date: Date | null): string | undefined => {
  if (!date) return undefined;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export function formatISODate(
  isoString: string | null,
  timezoneOffsetHours: number = 7,
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

  // Ambil hanya bagian tanggal (YYYY-MM-DD) untuk menghindari zona waktu
  const datePart = dateISO.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.trunc((target.getTime() - today.getTime()) / msPerDay);
}

export function packageCountdown(endDateISO: string | null) {
  const totalDays = daysUntil(endDateISO ?? "");

  // Handle expired or today
  if (totalDays < 0) {
    return {
      days: totalDays,
      status: "expired" as const,
      label: "Sudah berakhir",
      note: "Masa aktif telah berakhir",
    };
  }

  if (totalDays === 0) {
    return {
      days: 0,
      status: "expires_today" as const,
      label: "Berakhir hari ini",
      note: "Paket berakhir hari ini",
    };
  }

  // Hitung tahun dan hari sisa
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;

  let label: string;
  let note: string;
  let status: "active" | "3_days_remaining" = "active";

  if (totalDays <= 3) {
    status = "3_days_remaining";
    label = `${totalDays} Hari`;
    note = `Berakhir dalam ${totalDays} hari`;
  } else if (years > 0) {
    // Format: "X Tahun Y Hari"
    label = `${years} Tahun ${remainingDays} Hari`;
    note = `Berakhir dalam ${years} tahun dan ${remainingDays} hari`;
  } else {
    // Kurang dari 1 tahun, hanya hari
    label = `${totalDays} Hari`;
    note = `Berakhir dalam ${totalDays} hari`;
  }

  return {
    days: totalDays,
    status,
    label,
    note,
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

export const toastErrorFromAPI = (error: any, id?: string) => {
  const httpStatus = error?.response?.status;
  const fallbackStatusCode = error?.response?.data?.statusCode;
  const errorStatusCode =
    typeof httpStatus === "number"
      ? httpStatus
      : typeof fallbackStatusCode === "number"
        ? fallbackStatusCode
        : null;

  const errorMsg =
    (typeof error?.response?.data?.message === "string" &&
      error.response.data.message) ||
    (typeof error?.message === "string" && error.message) ||
    "Terjadi kesalahan, silakan coba lagi.";

  if (errorStatusCode === 403) {
    toast.error("Hak akses tidak tersedia. Silakan login kembali.", { id });
    deleteCookie("token-ira");
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 2000);
    return;
  }

  if (
    errorStatusCode !== null &&
    errorStatusCode >= 500 &&
    errorStatusCode < 600
  ) {
    toast.error("Terjadi kesalahan. Silakan coba lagi.", {
      id,
    });
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
    return;
  }

  toast.error(errorMsg, { id });
};

export const formattedDate = (dateString: string | null) => {
  const date = moment(dateString);
  return date.format("DD MMMM YYYY");
};

export function formatNamaWilayah(nama: string): string {
  return nama.replace(/^kab\./i, "kabupaten");
}

export const maskPassword = (password: string) => {
  return "*".repeat(password.length);
};

export const getSignalLevel = (
  rsrp?: number,
  rsrq?: number,
  sinr?: number,
): "verygood" | "good" | "poor" | "bad" | "disconnected" => {
  if (rsrp == null) {
    return "disconnected";
  }

  // Sesuai tabel RSRP
  if (rsrp >= -80) return "verygood"; // Excellent
  if (rsrp >= -90) return "good"; // Good
  if (rsrp >= -100) return "poor"; // Fair to Poor
  return "bad"; // Poor
};

export const mapSignalToLevel = (
  rsrp: number | null,
  rsrq: number | null,
  sinr: number | null,
): Level => {
  if (rsrp === null) return 0;

  // Sesuai tabel RSRP
  if (rsrp >= -80) return 4; // Excellent
  if (rsrp >= -90) return 3; // Good
  if (rsrp >= -100) return 2; // Fair to Poor
  return 1; // Poor
};

export const htmlToPdf = async (
  htmlString: string,
  filename: string = "invoice.pdf",
) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  tempDiv.style.width = "700px"; // sesuaikan dengan desain invoice
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

    // ✅ Langsung download, jangan buka tab baru
    pdf.save(filename);

    // Cleanup
    document.body.removeChild(tempDiv);
  } catch (err) {
    console.error("Gagal generate PDF:", err);
    document.body.removeChild(tempDiv);
    throw err;
  }
};

const PHONE_HISTORY_KEY = "ira_phone_login_history";
const MAX_HISTORY = 10;

export const savePhoneToHistory = (phone: string) => {
  if (!phone) return;
  try {
    const history = JSON.parse(
      localStorage.getItem(PHONE_HISTORY_KEY) || "[]",
    ) as string[];
    const filtered = history.filter((p) => p !== phone);
    const newHistory = [phone, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(PHONE_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (e) {
    console.warn("Failed to save phone history", e);
  }
};

export const getPhoneHistory = (): string[] => {
  try {
    return JSON.parse(
      localStorage.getItem(PHONE_HISTORY_KEY) || "[]",
    ) as string[];
  } catch (e) {
    return [];
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};
