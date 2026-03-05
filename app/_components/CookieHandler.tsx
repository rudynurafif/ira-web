// Untuk keperluan auto login dari in app browser IRA


"use client";
import { useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function CookieHandler() {
  const router = useRouter();

  useEffect(() => {
    // Ambil token dari URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      // Simpan ke cookie
      setCookie("token-ira", tokenFromUrl);

      // Simpan ke localStorage sebagai trigger untuk sinkronisasi
      localStorage.setItem("token-ira-sync", tokenFromUrl);

      // Hapus parameter 'token' dari URL tanpa refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("token");

      // Ganti URL tanpa memicu refresh
      window.history.replaceState({}, document.title, newUrl.toString());

      // Picu Custom Event untuk memberi tahu komponen lain di tab yang sama
      window.dispatchEvent(
        new CustomEvent("token-ira-updated", { detail: tokenFromUrl }),
      );

      // Refresh halaman setelah URL diupdate
      window.location.reload();
    }

    // Opsional: Redirect jika diperlukan setelah penghapusan parameter
    // router.replace(newUrl.toString(), { scroll: false });
  }, []);

  return null;
}
