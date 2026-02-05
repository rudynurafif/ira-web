// lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase Messaging instance
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;

// Request permission and get token
export const requestNotificationPermission = async () => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BBKnzRgbLhXbQJMMXpDEhuMkDQpaSld-VweX-fTgDLCAsa7CZ7EREEllQIg6k7khdn2N0xcFMlXq3oZ3FSOXifQ",
      });
      // console.log("FCM Token:", token);
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
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};
