/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);

// Firebase config (boleh aman ditaruh di client; ini bukan secret)
firebase.initializeApp({
  apiKey: "AIzaSyD22D0K7nTBvXiOocXDLVehMzskzTAt-rI",
  authDomain: "ira-fwa.firebaseapp.com",
  databaseURL:
    "https://ira-fwa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ira-fwa",
  storageBucket: "ira-fwa.firebasestorage.app",
  messagingSenderId: "470048206690",
  appId: "1:470048206690:web:a5d219a7dd1c11370a063b",
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Notifikasi";
  const options = {
    body: payload?.notification?.body,
    // icon: "/icon-192.png",
    data: payload?.data || {},
  };

  self.registration.showNotification(title, options);
});

// // Handle click event
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const clickUrl = event.notification?.data?.click_action || "/attendance";
  const urlToOpen = new URL(clickUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          // Fokuskan dan navigasi jika tab sudah ada
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(urlToOpen);
            }
          }
        }
        // Kalau belum ada tab, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
