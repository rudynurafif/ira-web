import { useEffect, useState } from "react";
import { useFCM } from "../hooks/useFCM";
import { PushFCMToken } from "../_api/Notification/Notification";

const FCM_TOKEN_STORAGE_KEY = "fcm_token_stored";

export const Notification = () => {
  const { token, notification, isSupported, refreshToken } = useFCM();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (notification) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!isSupported || !token) return;

    const storedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

    // Hanya kirim jika token berbeda atau belum pernah disimpan
    if (storedToken !== token) {
      const body = {
        fcm_token: token,
        platform: "web",
      };

      PushFCMToken(body)
        .then(() => {
          localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        })
        .catch((error) => {
          console.error("❌ Gagal mengirim FCM token:", error);
        });
    }
  }, [token, isSupported]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="z-9999 w-full overflow-hidden">
      {/* {token && (
        <div className="p-4 bg-green-100 text-green-700 rounded mb-4">
          FCM Token: {token}
        </div>
      )} */}

      {showNotification && notification && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-fade-in">
          <div className="flex items-start">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🔔</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {notification.notification?.title ?? "-"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.notification?.body ?? "-"}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
