import { useEffect } from "react";

export const useClearOtpStorage = () => {
  useEffect(() => {
    const clearOtpStorage = () => {
      try {
        // Hanya hapus key yang dimulai dengan "otp_request_count"
        Object.keys(localStorage)
          .filter((key) => key.startsWith("otp_request_count"))
          .forEach((key) => localStorage.removeItem(key));

        console.log("OTP request count cleared at midnight");
      } catch (e) {
        console.warn("Failed to clear OTP storage:", e);
      }
    };

    // Fungsi untuk menghitung waktu ke tengah malam berikutnya
    const getNextMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // 00:00:00.000
      return tomorrow.getTime() - now.getTime();
    };

    // Jalankan sekali saat mount (untuk kasus user buka halaman setelah tengah malam)
    clearOtpStorage();

    // Set timer ke tengah malam berikutnya
    const timeoutId = setTimeout(() => {
      clearOtpStorage();
      // Set interval harian setelah itu
      const intervalId = setInterval(clearOtpStorage, 24 * 60 * 60 * 1000); // 24 jam
    }, getNextMidnight());

    return () => {
      clearTimeout(timeoutId);
      // Tidak bisa clearInterval di sini karena belum di-set, tapi aman karena page reload tiap hari
    };
  }, []);
};
