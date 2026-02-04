import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

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

// Inisialisasi hanya sekali (hindari duplikasi saat hot reload)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
// const app = initializeApp(firebaseConfig);

// Hanya aktifkan messaging di sisi client
export const messaging: any =
  typeof window !== "undefined" && "Notification" in window
    ? getMessaging(app)
    : null;
// export const messaging: any = getMessaging(app);
