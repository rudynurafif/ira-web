import { useEffect } from "react";
import toast from "react-hot-toast";

export const useBrowserDetection = () => {
  useEffect(() => {
    const ua = navigator.userAgent;
    const isChrome =
      /Chrome|CriOS/i.test(ua) &&
      !/Edg|OPR|Opera|UCBrowser|SamsungBrowser|MiuiBrowser/i.test(ua);

    if (!isChrome) {
      toast.error(
        "Deteksi Browser: Anda tidak menggunakan Google Chrome. \n\n" +
          "Demi kelancaran dan keamanan, silakan buka internetrakyat.id di web browser Google Chrome.",
        {
          id: "browser-warning-toast",
          duration: 15_000,
          position: "bottom-center",
          style: { whiteSpace: "pre-line" },
        },
      );
    }
  }, []);
};
