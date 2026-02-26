// lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  isSupported, // <--- IMPORT INI PENTING
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD22D0K7nTBvXiOocXDLVehMzskzTAt-rI",
  authDomain: "ira-fwa.firebaseapp.com",
  databaseURL:
    "https://ira-fwa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ira-fwa",
  storageBucket: "ira-fwa.firebasestorage.app",
  messagingSenderId: "470048206690",
  appId: "1:470048206690:web:a5d219a7dd1c11370a063b",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// FUNGSI BARU: Ambil instance messaging dengan aman
export const getMessagingSafe = async (): Promise<Messaging | null> => {
  // Cek apakah environment browser mendukung service worker (WhatsApp iOS = False)
  const supported = await isSupported();

  if (supported) {
    try {
      return getMessaging(app);
    } catch (error) {
      console.warn("FCM Init Error:", error);
      return null;
    }
  }

  // Kembalikan null jika tidak didukung (misal: WhatsApp In-App Browser)
  console.log(
    "FCM Not Supported: Browser ini tidak mendukung Service Workers.",
  );
  return null;
};

// Request permission and get token (Diupdate untuk menggunakan fungsi safe)
export const requestNotificationPermission = async () => {
  const messaging = await getMessagingSafe();
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BBKnzRgbLhXbQJMMXpDEhuMkDQpaSld-VweX-fTgDLCAsa7CZ7EREEllQIg6k7khdn2N0xcFMlXq3oZ3FSOXifQ",
      });
      return token;
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = (callback: (payload: any) => void) => {
  // Kita tidak bisa return unsubscribe function secara sinkron lagi karena getMessagingSafe itu async
  // Jadi kita ubah strateginya sedikit di hook useFCM nanti, atau buat wrapper async di sini.
  // Untuk simplicity, kita akan handle logic listen di dalam hook useFCM langsung agar lebih bersih.
  return () => {};
};
