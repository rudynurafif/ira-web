import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { firebaseApp } from "./firebaseClient";

export function getBrowserMessaging(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  return getMessaging(firebaseApp);
}

export async function registerFCMAndGetToken() {
  const messaging = getBrowserMessaging();
  if (!messaging) return null;

  // 1) Request permission
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return null;

  // 2) Register service worker (file harus ada di /public)
  const swReg = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  // 3) Get FCM token (pakai VAPID key)
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    serviceWorkerRegistration: swReg,
  });

  return token || null;
}

export function onForegroundMessage(cb: (payload: any) => void) {
  const messaging = getBrowserMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}
