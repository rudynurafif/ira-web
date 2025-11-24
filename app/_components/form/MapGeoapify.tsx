"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY || "";

function MapGeoapify({
  getAddress,
  onPlaceChange,
}: {
  getAddress: (address: string) => void;
  onPlaceChange?: (payload: {
    address: string;
    raw_result: any;
    latitude: number;
    longitude: number;
  }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [predictions, setPredictions] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
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
    null
  );

  // ref untuk menyimpan address terbaru (dipakai di fetch setelah cooldown)
  const latestAddressRef = useRef(address);
  useEffect(() => {
    latestAddressRef.current = address;
  }, [address]);

  // ref untuk debounce "berhenti ngetik"
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ambil Lokasi Saat Ini Saat Pertama Kali Load
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          // Ambil alamat dari koordinat (reverse geocoding)
          try {
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`
            );
            const data = await res.json();
            const feature = data.features[0];

            if (feature) {
              const addr = feature.properties.formatted;
              setAddress(addr);
              if (inputRef.current) inputRef.current.value = addr;

              onPlaceChange?.({
                address: addr,
                raw_result: feature,
                latitude,
                longitude,
              });
              getAddress(addr);
            }
          } catch (err: any) {
            toast.error("Reverse geocoding gagal:", err);
            // Tetap lanjutkan dengan koordinat meski tanpa alamat
            onPlaceChange?.({
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              raw_result: null,
              latitude,
              longitude,
            });
            getAddress(`${latitude}, ${longitude}`);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Gagal dapat lokasi:", error);
          toast.error("Tidak bisa mengakses lokasi Anda. Silakan isi manual.");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      toast.error("Browser tidak mendukung geolocation");
    }
  }, []);

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

  // Autocomplete Alamat: countdown setelah user berhenti ngetik
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);

    // setiap ketik, reset debounce
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.length < 3) {
      setPredictions([]);
      return;
    }

    // kalau masih cooldown, biarin user ngetik tapi jangan mulai countdown baru
    if (isCooldown) return;

    // debounce: tunggu user berhenti ngetik dulu (misal 2000ms)
    typingTimeoutRef.current = setTimeout(() => {
      setIsLoading(true);

      startCooldown(10, async () => {
        const query = latestAddressRef.current;

        if (!query || query.length < 3) {
          setIsLoading(false);
          setPredictions([]);
          return;
        }

        // ✅ Cegah autocomplete ke-hit 2x untuk query yang sama
        if (lastAutocompleteQueryRef.current === query) {
          setIsLoading(false);
          return;
        }
        lastAutocompleteQueryRef.current = query;

        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
              query
            )}&filter=countrycode:id&apiKey=${GEOAPIFY_API_KEY}`
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
    }, 2000); // durasi "berhenti ngetik" sebelum countdown mulai
  };

  // === Pilih dari Dropdown ===
  const handleSuggestionClick = (feature: any) => {
    const { properties, geometry } = feature;
    const addr = properties.formatted;

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
    });
    getAddress(addr);
  };

  // === Inisialisasi Peta ===
  useEffect(() => {
    if (!mapContainerRef.current || !location) return;

    if (!(window as any).L) {
      loadLeafletAndMap();
    } else {
      renderMap();
    }
  }, [location]);

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
    const map = L.map(mapContainerRef.current).setView(
      [location.lat, location.lng],
      18
    );

    L.tileLayer(
      `https://maps.geoapify.com/v1/tile/osm-liberty/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
      {
        attribution:
          'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
      }
    ).addTo(map);

    const marker = L.marker([location.lat, location.lng], {
      draggable: true,
    }).addTo(map);

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
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
          );
          const data = await res.json();
          const feature = data.features[0];

          if (feature && inputRef.current) {
            const addr = feature.properties.formatted;
            inputRef.current.value = addr;
            setAddress(addr);

            onPlaceChange?.({
              address: addr,
              raw_result: feature,
              latitude: lat,
              longitude: lng,
            });
            getAddress(addr);
          }
        } catch (err) {
          console.error("Reverse geocoding gagal:", err);
        } finally {
          setIsLoading(false);
        }
      });
    });

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
    if (inputRef.current) inputRef.current.value = "";
    setAddress("");
    setPredictions([]);
    setLocation(null);
    onPlaceChange?.({
      address: "",
      raw_result: null,
      latitude: 0,
      longitude: 0,
    });
    getAddress("");
  };

  return (
    <div className="relative">
      {/* Input Alamat */}
      <div className="absolute top-4 z-1000 w-[90%] left-[5%]">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Masukkan alamat Anda"
            value={address}
            onChange={handleInputChange}
            className="w-full bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {address && (
            <button
              onClick={clearInput}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <IoClose size={24} />
            </button>
          )}
        </div>

        {/* Loading & Predictions */}
        {isLoading && (
          <div className="bg-white border rounded-lg px-4 py-2 w-full">
            Mengambil lokasi...
          </div>
        )}

        {!isLoading && predictions.length > 0 && (
          <div className="bg-white border rounded-lg shadow-lg w-full max-h-60 overflow-y-auto">
            {predictions.map((feature, i) => (
              <div
                key={i}
                onClick={() => handleSuggestionClick(feature)}
                className="cursor-pointer p-3 border-b last:border-b-0 hover:bg-gray-50"
              >
                <p className="font-medium">{feature.properties.formatted}</p>
                <p className="text-sm text-gray-600">
                  {feature?.properties?.city ?? feature?.properties?.county ?? "Kota"},{" "}
                  {feature?.properties?.state ?? "Provinsi"},{" "}
                  {feature?.properties?.country ?? "Negara"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Peta */}
      <div
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-xl border border-gray-300 relative  overflow-hidden"
        style={{ minHeight: "300px" }}
      >
        {!location && (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
            Sedang mengambil lokasi Anda...
          </div>
        )}
      </div>

      {/* Overlay Cooldown */}
      {isCooldown && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-1000 rounded-xl">
          <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
            <p>Mohon menunggu... ({cooldownCount} detik)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapGeoapify;
