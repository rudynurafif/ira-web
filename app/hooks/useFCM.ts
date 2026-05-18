import { useEffect, useState } from "react";
import {
  getMessagingSafe,
  requestNotificationPermission,
} from "../lib/firebase";
import { onMessage, Messaging } from "firebase/messaging";
import toast from "react-hot-toast";

export const useFCM = () => {
  const [tokenFCM, setTokenFCM] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [messagingInstance, setMessagingInstance] = useState<Messaging | null>(
    null,
  );

  // 1. Cek Dukungan Browser saat Mount
  useEffect(() => {
    const checkSupport = async () => {
      // Cek fitur dasar browser
      const hasServiceWorker = "serviceWorker" in navigator;
      const hasPushManager = "PushManager" in window;

      if (hasServiceWorker && hasPushManager) {
        // Jika fitur dasar ada, cek Firebase specific support
        const msg = await getMessagingSafe();
        if (msg) {
          setIsSupported(true);
          setMessagingInstance(msg);
        }
      } else {
        console.log(
          "Browser tidak mendukung Service Worker / Push (Kemungkinan WhatsApp In-App).",
        );
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // 2. Jalankan Logic FCM HANYA jika isSupported = true
  useEffect(() => {
    if (!isSupported || !messagingInstance) return; // <--- PENTING: Stop di sini jika tidak support

    const initFCM = async () => {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setTokenFCM(fcmToken);
      }
    };

    initFCM();

    // Listen for foreground messages
    const unsubscribe = onMessage(messagingInstance, (payload: any) => {
      console.log("Foreground message received:", payload);
      setNotification(payload);
      // Opsional: Tampilkan toast custom jika dapat pesan
      // toast.success(`Pesan Baru: ${payload.notification?.title}`);
    });

    return () => {
      unsubscribe();
    };
  }, [isSupported, messagingInstance]);

  // Fungsi helper lainnya tetap sama, tapi pastikan cek isSupported dulu
  const refreshToken = async () => {
    if (!isSupported) return null;
    const newToken = await requestNotificationPermission();
    if (newToken) setTokenFCM(newToken);
    return newToken;
  };

  const checkNotificationPermission =
    async (): Promise<NotificationPermission> => {
      if (typeof window === "undefined" || !("Notification" in window))
        return "denied";
      return Notification.permission;
    };

  const requestPermissionIfNeeded = async (): Promise<boolean> => {
    if (!isSupported) return false;
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
      "Notifikasi dinonaktifkan. Silakan buka di browser Google Chrome untuk mengaktifkan notifikasi.",
      {
        duration: 8000,
        icon: "🔔",
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
