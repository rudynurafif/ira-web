// app/components/Html5BarcodeScanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { IoFlash, IoFlashOff } from "react-icons/io5";
import IconScanBarcode from "@/public/assets/Icons/icon-scan-barcode.svg";
import Image from "next/image";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import ModalScan from "./ModalScan";
import toast from "react-hot-toast";
import { CiBarcode } from "react-icons/ci";
import { MdOutlineQrCodeScanner } from "react-icons/md";

// 👉 MUI (Material UI) toggle
import { FormControlLabel, Switch } from "@mui/material";
import { QrDimensions } from "html5-qrcode/esm/core";

type Props = {
  setActiveSection: (val: string) => void;

  onDetected: (text: string) => void;
  onManual?: () => void;
};

// -------- utils aman utk stop/clear ----------
function stopSilently(qr: Html5Qrcode | null) {
  if (!qr) return Promise.resolve();
  try {
    const p = (qr as any).stop?.();
    if (p && typeof p.then === "function")
      return (p as Promise<void>).catch(() => {});
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}
function clearSilently(qr: Html5Qrcode | null) {
  if (!qr) return Promise.resolve();
  try {
    const p = (qr as any).clear?.();
    if (p && typeof p.then === "function")
      return (p as Promise<void>).catch(() => {});
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}
async function safeApply(track: MediaStreamTrack | null, c: any) {
  if (!track) return;
  try {
    await (track as any).applyConstraints?.(c);
  } catch (e) {
    console.warn("applyConstraints failed", e);
  }
}
// ---------------------------------------------

// pilih kamera sesuai user-agent
function pickByUserAgent(
  cams: { id: string; label?: string }[],
  ua: string
): { id: string; label?: string } {
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isDesktop = !isAndroid && !isIOS;

  if (isDesktop) {
    return cams[0]; // laptop/desktop: index 0
  }

  if (isAndroid) {
    // target: "camera 0, facing back"
    const exact = cams.find((c) =>
      /camera\s*0.*facing\s*back/i.test(c.label || "")
    );
    if (exact) return exact;

    // fallback: label mengandung back/rear/environment
    const backish = cams.find((c) =>
      /back|rear|environment/i.test(c.label || "")
    );
    if (backish) return backish;

    return cams[0];
  }

  // iOS
  if (isIOS) {
    const iosBack = cams.find((c) => /^back camera/i.test(c.label || ""));
    if (iosBack) return iosBack;

    // fallback: back/rear
    const backish = cams.find((c) =>
      /back|rear|environment/i.test(c.label || "")
    );
    if (backish) return backish;

    return cams[0];
  }

  // default fallback
  return cams[0];
}

export default function Html5BarcodeScanner({
  onDetected,
  onManual,
  setActiveSection,
}: Props) {
  const containerId = "reader-container";
  const qrRef = useRef<Html5Qrcode | null>(null);

  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // kontrol kamera
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [caps, setCaps] = useState<any | null>(null);
  const [zoomVal, setZoomVal] = useState<number | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [afContinuous, setAfContinuous] = useState(false);
  const [afSingleShot, setAfSingleShot] = useState(false);

  const [isModalSuccessScan, setIsModalSuccessScan] = useState(false);

  // hasil deteksi menunggu konfirmasi
  const [pending, setPending] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const modalScanRef = useRef<boolean | null>(null);

  // --- NEW: bentuk qrbox, device id terakhir, dan flag desktop ---
  const [qrBoxShape, setQrBoxShape] = useState<"rect" | "square">("rect");
  const lastDeviceIdRef = useRef<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const isDesktopRef = useRef<boolean | null>(null);

  // default zoom yang diminta
  const DEFAULT_ZOOM = 3.5;

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    modalScanRef.current = isModalSuccessScan;
  }, [isModalSuccessScan]);

  useEffect(() => {
    isDesktopRef.current = isDesktop;
  }, [isDesktop]);

  // deteksi desktop dari UA saat mount
  useEffect(() => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    setIsDesktop(!isAndroid && !isIOS);
  }, []);

  async function setupControlsFromVideo() {
    const video = document.querySelector<HTMLVideoElement>(
      `#${containerId} video`
    );
    const t =
      video && (video.srcObject as MediaStream | null)?.getVideoTracks()[0];
    if (!t) return;
    setTrack(t);

    const c: any = (t as any).getCapabilities?.() || {};
    const s: any = (t as any).getSettings?.() || {};
    setCaps(c);

    if (c.zoom)
      setZoomVal(typeof s.zoom === "number" ? s.zoom : c.zoom.min ?? 1);
    if (c.torch !== undefined) setTorchOn(Boolean(s.torch));
    const modes: string[] = Array.isArray(c.focusMode) ? c.focusMode : [];
    setAfContinuous(modes.includes("continuous"));
    setAfSingleShot(modes.includes("single-shot"));
  }

  // helper kecil: tunggu track siap
  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function startWith(deviceId: string) {
    const qr = qrRef.current!;
    setStarting(true);
    setError(null);
    await stopSilently(qr);

    lastDeviceIdRef.current = deviceId;

    const baseConfig: Html5QrcodeCameraScanConfig = {
      fps: 60,
      qrbox: (vw: number, vh: number): QrDimensions => {
        const size = Math.floor(Math.min(vw, vh) * 0.75);
        return qrBoxShape === "square"
          ? { width: 200, height: 200 }
          : { width: size, height: 50 };
      },
    };
    const config: any = {
      ...baseConfig,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
    };

    try {
      await qr.start(
        deviceId,
        config,
        (text) => {
          if (modalScanRef.current == false) {
            setPending(text);

            // AUTO OPEN MODAL kalau desktop/laptop
          }

          // ini kalo mau automatis scan
          // if (isDesktopRef.current == true) setIsModalSuccessScan(true);

          setIsModalSuccessScan(true);
          qr.pause();
        },
        () => {}
      );

      // ---- AMBIL TRACK LANGSUNG, JANGAN ANDALKAN STATE ----
      await sleep(30);
      const video = document.querySelector<HTMLVideoElement>(
        `#${containerId} video`
      );

      const media = video?.srcObject as MediaStream | null;
      const t = media?.getVideoTracks()[0] || null;

      if (t) {
        const c: any = (t as any).getCapabilities?.() || {};
        const s: any = (t as any).getSettings?.() || {};

        // simpan ke state untuk UI (slider, torch, dll)
        setTrack(t);
        setCaps(c);

        if (c.zoom) {
          const minZoom = c.zoom.min ?? 1;
          const maxZoom = c.zoom.max ?? 5;
          const targetZoom = Math.min(Math.max(DEFAULT_ZOOM, minZoom), maxZoom);
          const cur = typeof s.zoom === "number" ? s.zoom : minZoom;

          if (Math.abs(cur - targetZoom) > 1e-3) {
            await safeApply(t, { advanced: [{ zoom: targetZoom }] });
          }
          setZoomVal(targetZoom);
        }

        if (c.torch !== undefined) setTorchOn(Boolean(s.torch));
        const modes: string[] = Array.isArray(c.focusMode) ? c.focusMode : [];
        setAfContinuous(modes.includes("continuous"));
        setAfSingleShot(modes.includes("single-shot"));
      }

      if (isDesktopRef.current) {
        const video = document.querySelector<HTMLVideoElement>(
          `#${containerId} video`
        );
        if (video) {
          video.style.transform = "scaleX(-1)";
        }
      }

      setStarting(false);
    } catch (e: any) {
      setError(e?.message || "Gagal membuka kamera");
      setStarting(false);
    }
  }

  useEffect(() => {
    let unmounted = false;
    const qr = new Html5Qrcode(containerId);
    qrRef.current = qr;

    (async () => {
      try {
        // pre-permission agar label kamera terbaca
        try {
          const tmp = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          tmp.getTracks().forEach((t) => t.stop());
        } catch {}

        const list = await Html5Qrcode.getCameras();
        if (!list.length) throw new Error("Tidak ada kamera");

        const ua = navigator.userAgent;
        const chosen = pickByUserAgent(list, ua);

        if (!unmounted) {
          await startWith(chosen.id);
        }
      } catch (err: any) {
        if (!unmounted) {
          setError(err?.message || "Gagal memuat kamera");
          setStarting(false);
        }
      }
    })();

    return () => {
      unmounted = true;
      void stopSilently(qr);
      void clearSilently(qr);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDetected]);

  // --- Restart otomatis saat toggle bentuk qrbox berubah ---
  useEffect(() => {
    const id = lastDeviceIdRef.current;
    if (!id) return;
    (async () => {
      try {
        await startWith(id);
      } catch (e) {
        console.warn("restart after qrBoxShape change failed", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrBoxShape, isDesktop]); // ikutkan isDesktop agar callback terbaru terpakai

  // handlers kontrol
  const toggleTorch = async () => {
    if (caps?.torch === undefined) return;
    const next = !torchOn;
    setTorchOn(next);
    await safeApply(track, { advanced: [{ torch: next }] });
  };
  const setAF_Continuous = async () => {
    if (!afContinuous) return;
    await safeApply(track, { advanced: [{ focusMode: "continuous" as any }] });
  };
  const setAF_SingleShot = async () => {
    if (!afSingleShot) return;
    await safeApply(track, { advanced: [{ focusMode: "single-shot" as any }] });
  };
  const changeZoom = async (v: number) => {
    setZoomVal(v);
    await safeApply(track, { advanced: [{ zoom: v as any }] });
  };

  // aksi konfirmasi
  const confirmUse = async () => {
    if (!pending) return;
    onDetected(pending); // ← baru dipanggil saat tombol diklik
    setPending(null); // lanjut scanning setelah diambil
    // Kalau ingin berhenti setelah ambil:
    await stopSilently(qrRef.current);
    setActiveSection("input");
  };
  const rejectPending = () => {
    setPending(null); // buang hasil & lanjut cari lagi
  };

  // flags UI
  const zoomCap = caps?.zoom;
  const hasZoom = !!zoomCap && zoomVal !== null;
  const hasTorch = caps?.torch !== undefined;
  const hasAF = afContinuous || afSingleShot;

  function resumeQr() {
    const qr = qrRef.current!;
    qr.resume();
  }

  return (
    <>
      <div className="max-w-[480px] mx-auto w-full text-center">
        <h1 className="text-[24px] sm:text-[28px] font-bold ">Scan Barcode</h1>

        {!starting && (
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={qrBoxShape === "square"}
                  onChange={(e) =>
                    setQrBoxShape(e.target.checked ? "square" : "rect")
                  }
                />
              }
              label={
                <>
                  {qrBoxShape === "square" ? (
                    <>
                      <CiBarcode size={30} style={{ marginRight: 8 }} />
                      {/* QR Box: Kotak */}
                    </>
                  ) : (
                    <>
                      <MdOutlineQrCodeScanner
                        size={30}
                        style={{ marginRight: 8 }}
                      />
                      {/* QR Box: Persegi Panjang */}
                    </>
                  )}
                </>
              }
            />
          </div>
        )}

        <div style={{ display: "inline-block", position: "relative" }}>
          {/* html5-qrcode render video/canvas ke sini */}
          <div
            id={containerId}
            className="md:w-[480px] w-[100vw] h-full bg-black rounded-[8px] overflow-hidden"
          />

          {!starting && (
            <>
              {/* tombol torch */}
              {hasTorch && (
                <div className="absolute top-2 right-2 z-10">
                  {torchOn ? (
                    <IoFlashOff
                      onClick={toggleTorch}
                      size={25}
                      className="text-white cursor-pointer"
                    />
                  ) : (
                    <IoFlash
                      onClick={toggleTorch}
                      size={25}
                      className="text-white cursor-pointer "
                    />
                  )}
                </div>
              )}

              {/* slider zoom */}
              {hasZoom && (
                <div className="absolute bottom-2 left-0 px-2 w-full z-10">
                  <label
                    className="text-white"
                    style={{
                      display: "block",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Zoom: {zoomVal?.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={zoomCap.min ?? 1}
                    max={zoomCap.max ?? 5}
                    step={zoomCap.step ?? 0.1}
                    value={zoomVal ?? zoomCap.min ?? 1}
                    onChange={(e) => changeZoom(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              {/* Tombol Scan Barcode: DISSEMBUNYIKAN di desktop */}
              {/* {!isDesktop && (
                <div
                  className={`absolute w-full flex justify-center left-1/2 ${
                    qrBoxShape === "square" ? "bottom-[10%]" : "top-[70%]"
                  }  transform -translate-x-1/2 -translate-y-1/2`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (pending) {
                        setIsModalSuccessScan(true);
                      }
                    }}
                    className="bg-white py-2 px-5 rounded-[12px] font-bold flex gap-2 items-center"
                  >
                    <div>
                      <Image src={IconScanBarcode} alt="icon barcode" />
                    </div>
                    <div>Scan Barcode</div>
                  </button>
                </div>
              )} */}
            </>
          )}
        </div>

        {starting && (
          <p style={{ color: "#6b7280", marginTop: 12 }}>Membuka kamera…</p>
        )}
        {error && <p style={{ color: "crimson", marginTop: 8 }}>{error}</p>}

        <div className="px-10 pt-3">
          <button
            onClick={() => {
              setActiveSection("input");
            }}
            className="bg-[#005FB8] hover:bg-[#014280] p-2 cursor-pointer text-white font-bold w-full rounded-[12px] "
            type="button"
          >
            Input Manual
          </button>
        </div>
        {/* Kontrol tambahan */}
        {/* <div
          style={{
            display: "grid",
            gap: 10,
            marginTop: 16,
            width: 560,
            maxWidth: "86vw",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            contoh: tombol AF kalau ingin ditampilkan
            <button
              onClick={setAF_Continuous}
              disabled={!afContinuous}
              className="px-3 py-1 rounded border border-gray-300"
            >
              Auto Focus
            </button>
            <button
              onClick={setAF_SingleShot}
              disabled={!afSingleShot}
              className="px-3 py-1 rounded border border-gray-300"
            >
              Single-shot AF
            </button>
            <button onClick={onManual}>Input Manual</button>
          </div>
        </div> */}
      </div>

      {isModalSuccessScan && (
        <ModalTemplate
          closeModal={() => {
            rejectPending();
            setIsModalSuccessScan(false);
            resumeQr();
          }}
          classNameModal="w-[90%] sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 px-5 py-10"
        >
          <ModalScan
            scanAgain={(e: boolean) => {
              if (e) {
                rejectPending();
              } else {
                confirmUse();
              }

              resumeQr();
              setIsModalSuccessScan(false);
            }}
            dataScan={pending}
          />
        </ModalTemplate>
      )}
    </>
  );
}
