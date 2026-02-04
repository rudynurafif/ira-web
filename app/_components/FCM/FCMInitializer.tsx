"use client";

import { useEffect, useState } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import NotificationToast from "../NotificationToast";
import { countNotif, PushFCMToken } from "../../_api/Notification/Notification";
import toast from "react-hot-toast";
import { useAppContext } from "../../_shared/context/AppContext";
import { usePathname } from "next/navigation";

export default function FCMInitializer() {
  const [notification, setNotification] = useState<{
    title: string;
    body: string;
    url?: string;
  } | null>(null);
  const { countNotification, setCountNotification } = useAppContext();

  async function pushToken(token: string) {
    try {
      const payload = {
        fcm_token: token,
      };
      const res_token = await PushFCMToken(payload);
      // console.log(res_token);

      if (res_token?.data?.statusCode === 201) {
      }
    } catch (err: any) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err?.response?.data?.message);
      } else {
        toast.error("Push Token Error");
      }
    }
  }

  async function getCountNotif() {
    try {
      const res_notif = await countNotif();
      // console.log(res_notif);
      if (res_notif?.data?.statusCode === 200) {
        setCountNotification(res_notif?.data?.count);
      }
    } catch (err: any) {
      // console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err?.response?.data?.message);
      } else {
        toast.error("Count Notif Gagal");
      }
    }
  }

  useEffect(() => {
    if (!messaging) return;

    const setupFCM = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );

        console.log(registration, "<<< registration");

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        console.log(permission, "<< permission");

        console.log(messaging, "<<< messaging");

        const token = await getToken(messaging, {
          vapidKey:
            "BBKnzRgbLhXbQJMMXpDEhuMkDQpaSld-VweX-fTgDLCAsa7CZ7EREEllQIg6k7khdn2N0xcFMlXq3oZ3FSOXifQ",
          serviceWorkerRegistration: registration,
        });

        console.log(token, "<< token");

        if (token) {
          console.log("FCM Token:", token);
          localStorage.setItem("fcm_token", token);

          // Kirim ke backend kalau perlu
          pushToken(token);
        } else {
          toast.error("Gagal mendapatkan token FCM");
        }
      } catch (error) {
        console.error("FCM error:", error);
      }
    };

    setupFCM();

    onMessage(messaging, (payload: any) => {
      console.log(payload, "foreground");
      getCountNotif();

      setNotification({
        title: payload.notification?.title || "New Notification",
        body: payload.notification?.body || "",
        url: payload?.fcmOptions?.link || "",
      });
    });
  }, []);

  return (
    <>
      {notification && (
        <NotificationToast
          title={notification?.title || ""}
          body={notification?.body || ""}
          url={notification?.url || ""}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}
