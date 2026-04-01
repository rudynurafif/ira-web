"use client";

import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import toast from "react-hot-toast";
import { MdMyLocation } from "react-icons/md";

// Hardcoded Token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapMapboxLiteProps {
  onPlaceChange?: (payload: {
    latitude: number;
    longitude: number;
    postcode?: string;
    address?: string;
    raw_result?: any;
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  isInteractive?: boolean;
}

const MapMapboxLite: React.FC<MapMapboxLiteProps> = ({
  onPlaceChange,
  initialLatitude,
  initialLongitude,
  isInteractive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [location, setLocation] = useState<{ lat: number; lng: number }>(() => {
    if (initialLatitude && initialLongitude && initialLatitude !== 0) {
      return { lat: initialLatitude, lng: initialLongitude };
    }
    return { lat: -6.2088, lng: 106.8456 }; // Default Jakarta
  });

  const onPlaceChangeRef = useRef(onPlaceChange);
  useEffect(() => {
    onPlaceChangeRef.current = onPlaceChange;
  }, [onPlaceChange]);

  const lastReverseCoordsRef = useRef<{ lat: number; lng: number } | null>(
    null,
  );

  // Initial Location Setup
  useEffect(() => {
    if (
      initialLatitude &&
      initialLongitude &&
      initialLatitude !== 0 &&
      initialLongitude !== 0
    ) {
      const newLoc = { lat: initialLatitude, lng: initialLongitude };
      setLocation(newLoc);
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [initialLongitude, initialLatitude] });
      }
    }
  }, [initialLatitude, initialLongitude, isInteractive]);

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [location.lng, location.lat],
      zoom: 16,
      interactive: isInteractive,
    });

    if (isInteractive) {
      map.addControl(new mapboxgl.NavigationControl(), "top-left");
    }

    const marker = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    if (isInteractive) {
      // Marker follows center
      map.on("move", () => {
        const center = map.getCenter();
        marker.setLngLat(center);
      });

      // Fetch address on move end
      map.on("moveend", async () => {
        const center = map.getCenter();
        const lat = center.lat;
        const lng = center.lng;

        // Debounce / Distance check
        const last = lastReverseCoordsRef.current;
        if (
          last &&
          Math.abs(last.lat - lat) < 0.00005 &&
          Math.abs(last.lng - lng) < 0.00005
        ) {
          return;
        }
        lastReverseCoordsRef.current = { lat, lng };

        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,postcode&language=id`,
          );
          const data = await res.json();
          const feature = data.features?.[0];

          if (onPlaceChangeRef.current) {
            // Mapbox geocoding structure is different
            // usually postcode is in context or properties
            const postcodeObj = data.features?.find((f: any) =>
              f.place_type.includes("postcode"),
            );
            const postcode = postcodeObj ? postcodeObj.text : "";

            onPlaceChangeRef.current({
              latitude: lat,
              longitude: lng,
              postcode: postcode,
              address: feature ? feature.place_name : "",
              raw_result: feature, // Send ONLY the first feature, matched backend expectations
            });
          }
        } catch (err) {
          console.error("Mapbox Reverse geocoding failed:", err);
          if (onPlaceChangeRef.current) {
            onPlaceChangeRef.current({ latitude: lat, longitude: lng });
          }
        }
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [location, isInteractive]);

  const handleRefreshLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [longitude, latitude] });
          }
          setIsLoading(false);
        },
        (error) => {
          if (error.code === 1) {
            toast.error(
              "Mohon izinkan akses lokasi (GPS) pada pengaturan browser Anda agar titik pen lokasi bisa ditentukan secara otomatis.",
              { duration: 6000 }
            );
          } else {
            toast.error("Gagal mendeteksi lokasi GPS Anda.");
          }
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000 },
      );
    } else {
      toast.error("Browser Anda tidak mendukung fitur deteksi lokasi.");
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden group min-h-[350px] md:min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Buttons */}
      {isInteractive && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRefreshLocation}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 flex gap-2 items-center justify-center transition-all bg-opacity-90 backdrop-blur-sm border border-gray-100"
            title="Refresh My Location"
          >
            <p className="text-xs">Set Pinpoin Ke Lokasi Saya Sekarang</p>
            <MdMyLocation
              className={`text-2xl text-primary ${isLoading ? "animate-pulse" : ""}`}
            />
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700 font-secondary">
              Mendeteksi Lokasi...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapMapboxLite;
