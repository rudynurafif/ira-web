import { useEffect } from "react";
import toast from "react-hot-toast";

export const useBrowserDetection = () => {
  useEffect(() => {
    const ua = navigator.userAgent;
    const isAllowedBrowser =
      (/Chrome|CriOS/i.test(ua) || /Safari/i.test(ua)) &&
      !/Edg|OPR|Opera|UCBrowser|SamsungBrowser|MiuiBrowser/i.test(ua);

    if (!isAllowedBrowser) {
      toast(
        (t) => (
          <div className="flex items-start gap-3 w-full max-w-sm">
            <div className="text-yellow-500 mt-0.5 text-xl shrink-0">⚠️</div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-semibold text-gray-800 text-sm">
                Deteksi Browser
              </span>
              <p className="text-xs text-gray-600">
                Anda tidak menggunakan Google Chrome atau Safari. Demi
                kelancaran dan keamanan Anda, silakan buka internetrakyat.id di
                web browser Google Chrome atau Safari.
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-800 focus:outline-none shrink-0 text-sm font-bold pl-2"
            >
              ✕
            </button>
          </div>
        ),
        {
          id: "browser-warning-toast",
          duration: 10_000,
          position: "bottom-center",
        },
      );
    }
  }, []);
};
