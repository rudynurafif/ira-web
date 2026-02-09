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
    // Check if FCM is supported
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

    // Request permission and get token on mount
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

  return {
    tokenFCM,
    notification,
    isSupported,
    refreshToken,
  };
};
