// hooks/useFCM.ts
import { useEffect, useState } from "react";
import {
  messaging,
  onMessageListener,
  requestNotificationPermission,
} from "../lib/firebase";
import toast from "react-hot-toast";

export const useFCM = () => {
  const [tokenFCM, setTokenFCM] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !messaging) return;

    const initFCM = async () => {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setTokenFCM(fcmToken);
      }
    };

    initFCM();

    // Listen for foreground messages
    const unsubscribe = onMessageListener((payload: any) => {
      console.log("Foreground message received:", payload);
      setNotification(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [isSupported]);

  const refreshToken = async () => {
    const newToken = await requestNotificationPermission();
    console.log(newToken, "<<< new token");
    if (newToken) {
      setTokenFCM(newToken);
    }
    return newToken;
  };

  const checkNotificationPermission =
    async (): Promise<NotificationPermission> => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        return "denied";
      }
      return Notification.permission;
    };

  const requestPermissionIfNeeded = async (): Promise<boolean> => {
    try {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setTokenFCM(fcmToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  };

  const showPermissionGuide = () => {
    toast(
      "Notifikasi dinonaktifkan. Untuk mengaktifkan, buka Settings browser → Site Settings → Notifications → Cari website ini → Ubah ke Allow",
      {
        duration: 8000,
        icon: "🔔",
        style: {
          background: "#fff",
          color: "#333",
          border: "1px solid #e5e7eb",
        },
      },
    );
  };

  return {
    tokenFCM,
    notification,
    isSupported,
    refreshToken,
    checkNotificationPermission,
    requestPermissionIfNeeded,
    showPermissionGuide,
  };
};
