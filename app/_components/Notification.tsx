import { useEffect, useState } from "react";
import {
  UpdateFCMToken,
  StoreFCMToken,
} from "../_api/Notification/Notification";
import logoIra from "@/public/assets/Icons/Logo-Ira-Red.svg";
import Image from "next/image";
import { useAppContext } from "../_shared/context/AppContext";
import { HiOutlineX } from "react-icons/hi";

type FcmMode = "store" | "update";
const FCM_TOKEN_STORAGE_KEY = "fcm_token_stored";

export const Notification = ({ body, mode }: { body: any; mode: FcmMode }) => {
  const [showNotification, setShowNotification] = useState(false);
  const { fcmToken, fcmNotification, fcmIsSupported, fcmRefreshToken } =
    useAppContext();

  useEffect(() => {
    if (fcmNotification) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [fcmNotification]);

  useEffect(() => {
    if (!fcmIsSupported) return;
    if (!fcmToken) return;

    const storedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

    let req: Promise<any> | null = null;

    if (mode === "update") {
      req = UpdateFCMToken(body);
    } else if (mode === "store" && storedToken !== fcmToken) {
      req = StoreFCMToken(body);
    }

    if (req) {
      req
        .then(() => localStorage.setItem(FCM_TOKEN_STORAGE_KEY, fcmToken))
        .catch((error) => console.error("❌ Gagal kirim FCM token:", error));
    }
  }, [fcmToken, fcmIsSupported, mode, body]);

  if (!fcmIsSupported) {
    return null;
  }

  return (
    <div className="z-9999 w-full overflow-hidden">
      {/* {token && (
        <div className="p-4 bg-green-100 text-green-700 rounded mb-4">
          FCM Token: {token}
        </div>
      )} */}

      {showNotification && fcmNotification && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-fade-in">
          <div className="flex items-start">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
                <Image
                  src={logoIra}
                  alt="IRA Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fcmNotification?.notification?.title ?? "-"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {fcmNotification?.notification?.body ?? "-"}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
