"use client";

import { useGeoPermission } from "@/app/hooks/useGeoPermission";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { MdMyLocation } from "react-icons/md";

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY || "";

function MapGeoapifyLite({
  onPlaceChange,
  initialLatitude,
  initialLongitude,
  isInteractive = true,
}: {
  onPlaceChange?: (payload: {
    latitude: number;
    longitude: number;
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  isInteractive?: boolean;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );



  const lastReverseCoordsRef = useRef<{ lat: number; lng: number } | null>(
    null,
  );

  const { status } = useGeoPermission();

  useEffect(() => {
    // If we have an initial value provided explicitly, use it instantly.
    if (initialLatitude && initialLongitude && initialLatitude !== 0 && initialLongitude !== 0) {
      setLocation({ lat: initialLatitude, lng: initialLongitude });
      
      if (isInteractive) {
        onPlaceChange?.({
          latitude: initialLatitude,
          longitude: initialLongitude,
        });
      }
    } else if (isInteractive) {
      // If interactive and no initial coords, try getting from GPS
      if (status === "denied") {
        setLocation({ lat: -6.2088, lng: 106.8456 }); // Fallback Jakarta
        return;
      }

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });

            onPlaceChange?.({
              latitude,
              longitude,
            });
          },
          (error) => {
            console.error("Gagal dapat lokasi:", error?.message);
            // Fallback Jakarta
            setLocation({ lat: -6.2088, lng: 106.8456 });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          },
        );
      } else {
        toast.error("Browser tidak mendukung geolocation");
        setLocation({ lat: -6.2088, lng: 106.8456 }); // Fallback Jakarta
      }
    } else {
      // mode non interaktif tapi belum ada koordinat
      setLocation({ lat: -6.2088, lng: 106.8456 }); // Fallback Jakarta  
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLatitude, initialLongitude, isInteractive]);



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
    if (mapRef.current && location && !isInteractive) {
      const map = mapRef.current;
      const marker = markerRef.current;

      const currentCenter = map.getCenter();
      if (
        Math.abs(currentCenter.lat - location.lat) > 0.00005 ||
        Math.abs(currentCenter.lng - location.lng) > 0.00005
      ) {
        map.setView([location.lat, location.lng], 18);
      }
      marker.setLatLng([location.lat, location.lng]);
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [location, isInteractive]);

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

    if (mapRef.current) {
      return;
    }

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
      draggable: false, 
    }).addTo(map);

    if (isInteractive) {
      map.on("move", () => {
        marker.setLatLng(map.getCenter());
      });

      map.on("moveend", () => {
        const { lat, lng } = map.getCenter();
        setLocation({ lat, lng });

        const last = lastReverseCoordsRef.current;
        if (
          last &&
          Math.abs(last.lat - lat) < 0.00005 &&
          Math.abs(last.lng - lng) < 0.00005
        ) {
          return;
        }

        lastReverseCoordsRef.current = { lat, lng };
        if (onPlaceChange) {
          onPlaceChange({ latitude: lat, longitude: lng });
        }
      });
    }

    mapRef.current = map;
    markerRef.current = marker;
    
    // Fix leafet grey/white map in modal by firing resize events
    [100, 300, 600, 1000].forEach((timeout) => {
      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, timeout);
    });
  };

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Peta */}
      <div
        className="w-full h-full rounded-xl relative overflow-hidden group min-h-[350px] md:min-h-[400px]"
      >
        {!location && (
          <div className="absolute inset-0 z-1000 flex items-center justify-center h-full bg-gray-100 text-gray-500">
            <span>Memuat Peta...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full relative z-0" />

        {/* Tombol My Location (Refresh Map) */}
        {isInteractive && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    if (mapRef.current) {
                      mapRef.current.setView([lat, lng], 18);
                    }
                    setLocation({ lat, lng });
                    
                    if (onPlaceChange) {
                        onPlaceChange({ latitude: lat, longitude: lng });
                    }
                  },
                  (error) => {
                    toast.error("Gagal mendeteksi lokasi GPS Anda saat ini.");
                  },
                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
              } else {
                toast.error("Browser tidak mendukung geolocation");
              }
            }}
            className="absolute bottom-24 md:bottom-6 right-4 z-1000 bg-white p-3 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-transform transform active:scale-95"
            title="Kembali ke lokasi Anda"
          >
            <MdMyLocation
              size={24}
              className="text-gray-700 hover:text-primary"
            />
          </button>
        )}
      </div>
    </>
  );
}

export default MapGeoapifyLite;
