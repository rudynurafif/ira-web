// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

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

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
