"use client";

import { useGeoPermission } from "@/app/hooks/useGeoPermission";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY || "";

function MapGeoapify({
  getAddress,
  onPlaceChange,
  initialLatitude,
  initialLongitude,
  mode,
  isInteractive = true,
}: {
  mode: "register" | "reregister" | "update_address";
  getAddress: (address: string, meta?: { source: "init" | "user" }) => void;
  onPlaceChange?: (payload: {
    address: string;
    raw_result: any;
    latitude: number;
    longitude: number;
    source: "init" | "user";
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  isInteractive?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [predictions, setPredictions] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownCount, setCooldownCount] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // simpan query autocomplete terakhir yang sudah di-fetch
  const lastAutocompleteQueryRef = useRef<string | null>(null);

  // simpan koordinat reverse geocoding terakhir (untuk dragend)
  const lastReverseCoordsRef = useRef<{ lat: number; lng: number } | null>(
    null,
  );

  const { status, requestLocation, refresh } = useGeoPermission();

  // ref untuk menyimpan address terbaru (dipakai di fetch setelah cooldown)
  const latestAddressRef = useRef(address);
  useEffect(() => {
    latestAddressRef.current = address;
  }, [address]);

  // ref untuk debounce "berhenti ngetik"
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "denied") return;

    if (initialLatitude && initialLongitude) {
      setLocation({ lat: initialLatitude, lng: initialLongitude });

      // Optionally, you can get the address from these coordinates (reverse geocoding)
      fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${initialLatitude}&lon=${initialLongitude}&apiKey=${GEOAPIFY_API_KEY}&lang=id`,
      )
        .then((res) => res.json())
        .then((data) => {
          const feature = data.features[0];
          if (feature) {
            const addr = feature.properties.formatted;
            setAddress(addr);
            if (inputRef.current) inputRef.current.value = addr;

            // Hanya trigger onPlaceChange jika mode interaktif
            if (isInteractive) {
              onPlaceChange?.({
                address: addr,
                raw_result: feature,
                latitude: initialLatitude,
                longitude: initialLongitude,
                source: "init",
              });
            }
            getAddress(addr, { source: "init" });
          }
        })
        .catch((err) => {
          console.error("Reverse geocoding failed:", err);
          toast.error("Gagal memuat alamat dari koordinat");
        });
    } else if (isInteractive) {
      // Hanya ambil lokasi otomatis jika mode interaktif
      if ("geolocation" in navigator) {
        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });

            // Ambil alamat dari koordinat (reverse geocoding)
            try {
              const res = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=id`,
              );
              const data = await res.json();
              const feature = data.features[0];

              if (feature) {
                const addr = feature.properties.formatted;
                setAddress(addr);
                if (inputRef.current) inputRef.current.value = addr;

                feature.query = data?.query || null;

                onPlaceChange?.({
                  address: addr,
                  raw_result: feature,
                  latitude,
                  longitude,
                  source: "init",
                });
                getAddress(addr, { source: "init" });
              }
            } catch (err: any) {
              toast.error("Reverse geocoding gagal:", err);
              // Tetap lanjutkan dengan koordinat meski tanpa alamat
              onPlaceChange?.({
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                raw_result: null,
                latitude,
                longitude,
                source: "init",
              });
              getAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, {
                source: "init",
              });
            } finally {
              setIsLoading(false);
            }
          },
          (error) => {
            console.error("Gagal dapat lokasi:", error?.message);
            toast.error(
              "Mohon izinkan akses lokasi dan gunakan browser Google Chrome untuk melakukan pendaftaran.",
            );
            setIsLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          },
        );
      } else {
        toast.error("Browser tidak mendukung geolocation");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLatitude, initialLongitude, isInteractive]);

  // === Fungsi start cooldown (dengan onFinish) ===
  const startCooldown = (duration: number = 10, onFinish?: () => void) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setIsCooldown(true);
    setCooldownCount(duration);

    cooldownRef.current = setInterval(() => {
      setCooldownCount((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          setIsCooldown(false);
          if (onFinish) onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Fungsi terpusat: handle autocomplete dengan cooldown & deduplikasi
  const performAutocompleteSearch = (query: string) => {
    if (!isInteractive) return;

    if (!query || query.length < 3) {
      setPredictions([]);
      return;
    }

    if (isCooldown) {
      toast.error(
        `Harap tunggu ${cooldownCount} detik lagi sebelum mencari lagi`,
      );
      return;
    }

    if (lastAutocompleteQueryRef.current === query) return;

    lastAutocompleteQueryRef.current = query;
    setIsLoading(true);

    startCooldown(10, async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query,
          )}&filter=countrycode:id&lang=id&apiKey=${GEOAPIFY_API_KEY}`,
        );
        const data = await res.json();
        setPredictions(data.features || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        toast.error("Gagal memuat saran alamat");
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Autocomplete Alamat: countdown setelah user berhenti ngetik
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInteractive) return;

    const value = e.target.value;
    setAddress(value);

    // if (typingTimeoutRef.current) {
    //   clearTimeout(typingTimeoutRef.current);
    // }

    // if (value.length < 3) {
    //   setPredictions([]);
    //   return;
    // }

    // // Gunakan debounce sekian detik
    // typingTimeoutRef.current = setTimeout(() => {
    //   performAutocompleteSearch(value);
    // }, 5000);
  };

  // === Pilih dari Dropdown ===
  const handleSuggestionClick = (feature: any) => {
    if (!isInteractive) return;

    const { properties, geometry } = feature;
    const addr = properties.formatted;

    feature.query = null;

    if (inputRef.current) {
      inputRef.current.value = addr;
    }

    setAddress(addr);
    setPredictions([]); // ✅ list langsung ditutup

    const lat = geometry.coordinates[1];
    const lng = geometry.coordinates[0];

    setLocation({ lat, lng });

    onPlaceChange?.({
      address: addr,
      raw_result: feature,
      latitude: lat,
      longitude: lng,
      source: "user",
    });
    getAddress(addr, { source: "user" });
  };

  // === Inisialisasi Peta ===
  useEffect(() => {
    if (!mapContainerRef.current || !location) return;

    if (!(window as any).L) {
      loadLeafletAndMap();
    } else {
      renderMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isInteractive]);

  useEffect(() => {
    if ((window as any).mapInstance && location) {
      const map = (window as any).mapInstance;
      const marker = (window as any).markerInstance;

      map.setView([location.lat, location.lng], 18);
      marker.setLatLng([location.lat, location.lng]);
    }
  }, [location]);

  const loadLeafletAndMap = () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      setTimeout(renderMap, 500);
    };
    document.head.appendChild(script);
  };

  const renderMap = () => {
    if (!location || !mapContainerRef.current) return;

    const L = (window as any).L;

    // Kalau sudah ada mapInstance, jangan init ulang – cukup update view/marker
    if ((window as any).mapInstance) {
      const map = (window as any).mapInstance;
      const marker = (window as any).markerInstance;

      map.setView([location.lat, location.lng], 18);
      marker.setLatLng([location.lat, location.lng]);
      return;
    }

    // Belum ada map, init baru
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      dragging: isInteractive,
      touchZoom: isInteractive,
      scrollWheelZoom: isInteractive,
      doubleClickZoom: isInteractive,
      boxZoom: isInteractive,
      keyboard: isInteractive,
    }).setView([location.lat, location.lng], 18);

    L.tileLayer(
      `https://maps.geoapify.com/v1/tile/osm-liberty/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
      {
        attribution:
          'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
      },
    ).addTo(map);

    const marker = L.marker([location.lat, location.lng], {
      draggable: isInteractive,
    }).addTo(map);

    if (isInteractive) {
      marker.off("dragend");

      marker.on("dragend", (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        setLocation({ lat, lng });

        setIsLoading(true);

        startCooldown(10, async () => {
          const last = lastReverseCoordsRef.current;
          if (last && last.lat === lat && last.lng === lng) {
            setIsLoading(false);
            return;
          }
          lastReverseCoordsRef.current = { lat, lng };

          try {
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`,
            );
            const data = await res.json();
            const feature = data.features[0];

            if (feature && inputRef.current) {
              const addr = feature.properties.formatted;
              inputRef.current.value = addr;
              setAddress(addr);

              feature.query = data?.query || null;

              onPlaceChange?.({
                address: addr,
                raw_result: feature,
                latitude: lat,
                longitude: lng,
                source: "user",
              });
              getAddress(addr, { source: "user" });
            }
          } catch (err) {
            console.error("Reverse geocoding gagal:", err);
          } finally {
            setIsLoading(false);
          }
        });
      });
    }

    (window as any).mapInitialized = true;
    (window as any).mapInstance = map;
    (window as any).markerInstance = marker;
  };

  useEffect(() => {
    return () => {
      // bersihkan interval & timeout
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // bersihkan map Leaflet global
      if (typeof window !== "undefined") {
        const w = window as any;
        if (w.mapInstance) {
          w.mapInstance.remove();
          delete w.mapInstance;
        }
        if (w.markerInstance) {
          delete w.markerInstance;
        }
      }
    };
  }, []);

  // === Clear Input ===
  const clearInput = () => {
    if (!isInteractive) return;

    if (inputRef.current) inputRef.current.value = "";
    setAddress("");
    setPredictions([]);
    setLocation(null);

    onPlaceChange?.({
      address: "",
      raw_result: null,
      latitude: 0,
      longitude: 0,
      source: "user",
    });
    getAddress("", { source: "user" });
  };

  return (
    <div className="relative">
      {/* Input Alamat */}
      {isInteractive && (
        <div className="absolute top-4 z-1000 w-full px-2 sm:px-5">
          <div className="relative w-full flex items-center justify-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (inputRef.current) {
                  const query = inputRef.current.value || "";

                  // Batalkan debounce yang sedang menunggu
                  // if (typingTimeoutRef.current) {
                  //   clearTimeout(typingTimeoutRef.current);
                  //   typingTimeoutRef.current = null;
                  // }

                  // Jalankan pencarian langsung
                  performAutocompleteSearch(query);
                }
              }}
              className="flex items-center justify-center gap-2 bg-white p-2 shadow-md rounded-lg cursor-pointer text-gray-500 hover:text-gray-700"
            >
              <p className="text-black font-semibold"><span>Cari</span></p>
              <FaSearch size={16} color="black" />
            </button>

            <input
              ref={inputRef}
              type="text"
              disabled={isLoading}
              placeholder="Masukkan alamat Anda, tekan Enter atau Tombol Cari untuk mencari.."
              value={address}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  // Batalkan debounce yang sedang menunggu
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                  }

                  // Jalankan pencarian langsung
                  performAutocompleteSearch(e.currentTarget.value);
                }
              }}
              className="w-full disabled:cursor-not-allowed! bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {address && (
              <button
                type="button"
                onClick={clearInput}
                className=" bg-white p-2 shadow-md rounded-full cursor-pointer text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} color="black" />
              </button>
            )}
          </div>

          {/* Loading & Predictions */}
          {isLoading && (
            <div className="bg-white mt-3 border rounded-lg px-4 py-2 w-full">
              <span>Mencari lokasi... </span>
              {cooldownCount > 0 && <span>{cooldownCount}</span>}
            </div>
          )}

          {!isLoading && predictions.length > 0 && (
            <div className="bg-white border rounded-lg shadow-lg w-full mt-3 max-h-70 overflow-y-auto">
              {predictions.map((feature, i) => (
                <div
                  key={i}
                  onClick={() => handleSuggestionClick(feature)}
                  className="cursor-pointer p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <p className="font-medium"><span>{feature.properties.formatted}</span></p>
                  <p className="text-sm text-gray-600">
                    <span>
                      {feature?.properties?.city ??
                        feature?.properties?.county ??
                        "Kota"}
                      , {feature?.properties?.state ?? "Provinsi"},{" "}
                      {feature?.properties?.country ?? "Negara"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Peta */}
      <div
        ref={mapContainerRef}
        className="w-full h-100 rounded-xl border border-gray-300 relative  overflow-hidden"
        style={{ minHeight: "300px" }}
      >
        {!location && (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
            <span>Sedang mengambil lokasi Anda...</span>
          </div>
        )}
      </div>

      {/* Overlay Cooldown */}
      {/* {isCooldown && (
        <div className="absolute bottom-7 right-5 flex items-center justify-center z-1000 rounded-xl">
          <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
            <p>
              Sedang mencari... {" "}
              <span className="text-primary">({cooldownCount})</span>
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default MapGeoapify;
