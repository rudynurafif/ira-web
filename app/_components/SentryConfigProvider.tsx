"use client";

import { useEffect } from "react";
import { getSetting } from "../_api/Settings/Settings"; // Sesuaikan path import

export default function SentryConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const fetchSentryStatus = async () => {
      try {
        // 1. Panggil API
        const response = await getSetting("sentry_status");
        const status = response.data?.data?.value; // Asumsi "on" / "off"

        // 2. Simpan ke LocalStorage
        const isEnabled = status === "on";
        localStorage.setItem("SENTRY_CONFIG_STATUS", String(isEnabled));

        // 3. Cek apakah perlu reload
        const previousStatus = localStorage.getItem("SENTRY_CONFIG_LOADED");
        const currentStatusStr = String(isEnabled);

        if (previousStatus !== null && previousStatus !== currentStatusStr) {
          // Status berubah, reload agar sentry.client.config.ts membaca nilai baru
          window.location.reload();
        }

        // Tandai sudah load
        localStorage.setItem("SENTRY_CONFIG_LOADED", currentStatusStr);
      } catch (error) {
        console.error("Gagal mengambil status Sentry dari API:", error);
        // Fail-safe: Default ON jika error
        localStorage.setItem("SENTRY_CONFIG_STATUS", "true");
        localStorage.setItem("SENTRY_CONFIG_LOADED", "true");
      }
    };

    fetchSentryStatus();
  }, []);

  return <>{children}</>;
}
