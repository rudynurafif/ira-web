// useGeoPermission.ts
import { useCallback, useEffect, useRef, useState } from "react";

type GeoStatus = "unsupported" | "granted" | "prompt" | "denied";

export function useGeoPermission() {
  const [status, setStatus] = useState<GeoStatus>("prompt");
  const watcherId = useRef<number | null>(null);

  // Feature detection
  const isSecure = typeof window !== "undefined" && window.isSecureContext;
  const hasPermApi =
    typeof navigator !== "undefined" &&
    !!(navigator.permissions && navigator.permissions.query);

  // Re-check permission (on load, on tab return)
  const refresh = useCallback(async () => {
    if (!isSecure) return setStatus("unsupported");
    if (hasPermApi) {
      try {
        const perm: PermissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        setStatus(perm.state as GeoStatus);
        // listen future changes (e.g., setelah user ubah setting)
        perm.onchange = () => setStatus(perm.state as GeoStatus);
        return;
      } catch {
        // fallthrough
      }
    }
    // Fallback: coba getCurrentPosition untuk infer status
    navigator.geolocation.getCurrentPosition(
      () => setStatus("granted"),
      (err) => {
        if (err.code === 1) setStatus("denied");
        else setStatus("prompt"); // posisi lain: user belum respon / timeout
      },
      { maximumAge: 0, timeout: 5000 }
    );
  }, [hasPermApi, isSecure]);

  useEffect(() => {
    refresh();
    const onVis = () => refresh(); // saat kembali dari Settings
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  // Minta lokasi (akan munculkan prompt *hanya jika* status=prompt)
  const requestLocation = useCallback(
    (): Promise<GeolocationPosition> =>
      new Promise((resolve, reject) => {
        if (!isSecure)
          return reject(
            new Error("Geolocation membutuhkan HTTPS atau context aman.")
          );
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setStatus("granted");
            resolve(pos);
          },
          (err) => {
            if (err.code === 1) setStatus("denied");
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }),
    [isSecure]
  );

  // Optional: watch untuk update realtime, ingat di-clear
  const startWatch = useCallback(
    (cb: (pos: GeolocationPosition) => void) => {
      if (!isSecure) return;
      watcherId.current = navigator.geolocation.watchPosition(cb, () => {}, {
        enableHighAccuracy: true,
        maximumAge: 0,
      });
    },
    [isSecure]
  );
  const stopWatch = useCallback(() => {
    if (watcherId.current != null)
      navigator.geolocation.clearWatch(watcherId.current);
    watcherId.current = null;
  }, []);

  return { status, setStatus, refresh, requestLocation, startWatch, stopWatch };
}
