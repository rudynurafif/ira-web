"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import toast from "react-hot-toast";
import { MdMyLocation, MdSearch, MdClose } from "react-icons/md";

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
  bbox?: [number, number, number, number] | null;
}

const MapMapboxLite: React.FC<MapMapboxLiteProps> = ({
  onPlaceChange,
  initialLatitude,
  initialLongitude,
  isInteractive = true,
  bbox,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const reverseGeocodeTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      // If map is not initialized yet, just set location state which will be used in initialization
      if (!mapRef.current) {
        setLocation(newLoc);
      } else {
        // If map already exists, ONLY flyTo.
        // IMPORTANT: Do not setLocation() because it might be in dependencies (though we'll remove it)
        // Check if the coordinates are really different from current center to avoid loops
        const currentCenter = mapRef.current.getCenter();
        if (
          Math.abs(currentCenter.lat - initialLatitude) > 0.00001 ||
          Math.abs(currentCenter.lng - initialLongitude) > 0.00001
        ) {
          mapRef.current.flyTo({
            center: [initialLongitude, initialLatitude],
            // DO NOT specify zoom here to preserve user's zoom
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteractive]); // Hapus 'initialLatitude', 'initialLongitude' agar tidak terus auto-center

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [location.lng, location.lat],
      zoom: 16,
      interactive: isInteractive,
      // [REMOVE] maxBounds agar map tidak terkunci hanya di area bbox, user bisa scroll bebas ke luar.
    });

    if (isInteractive) {
      map.addControl(new mapboxgl.NavigationControl(), "top-left");
    }

    const marker = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    if (isInteractive) {
      // Marker follows center (with Clamping if bbox provided)
      map.on("move", () => {
        const center = map.getCenter();
        let lng = center.lng;
        let lat = center.lat;

        marker.setLngLat([lng, lat]);

        // [PENTING] Sembunyikan loading dan batalkan timer saat sedang digeser
        // Ini memastikan overlay TIDAK MUNCUL sama sekali selama jari user masih geser-geser
        setIsLoading(false);
        if (reverseGeocodeTimerRef.current) {
          clearTimeout(reverseGeocodeTimerRef.current);
          reverseGeocodeTimerRef.current = null;
        }
      });

      // Sembunyikan loading dan batalkan timer jika gerakan dimulai
      map.on("movestart", () => {
        setIsLoading(false);
        if (reverseGeocodeTimerRef.current) {
          clearTimeout(reverseGeocodeTimerRef.current);
          reverseGeocodeTimerRef.current = null;
        }
      });

      // Fetch address on move end + Cooldown 1.5s
      // Fetch address on move end + Cooldown 1.5s
      map.on("moveend", () => {
        // Clear existing timer
        if (reverseGeocodeTimerRef.current) {
          clearTimeout(reverseGeocodeTimerRef.current);
          reverseGeocodeTimerRef.current = null;
        }

        const center = map.getCenter();
        const lat = center.lat;
        const lng = center.lng;

        // [SYNC IMMEDIATELY] Kirim koordinat saja ke parent (HEMAT API: Jangan hit geocoding di sini)
        if (onPlaceChangeRef.current) {
          onPlaceChangeRef.current({
            latitude: lat,
            longitude: lng,
          });
        }
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      if (reverseGeocodeTimerRef.current)
        clearTimeout(reverseGeocodeTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteractive]);

  const drawBbox = useCallback(
    (map: mapboxgl.Map) => {
      const sourceId = "bbox-boundary";
      const lineLayerId = "bbox-line";
      const maskLayerId = "bbox-mask";

      if (!bbox) {
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
        if (map.getLayer(maskLayerId)) map.removeLayer(maskLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        return;
      }

      // Regular Polygon for the Line
      const polygonCoords = [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[1]],
        [bbox[2], bbox[3]],
        [bbox[0], bbox[3]],
        [bbox[0], bbox[1]],
      ];

      const geojson: any = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [polygonCoords],
        },
      };

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });

        // [REMOVE] Dark Overlay Mask (request user: "tanpa overlay hitam")
        /*
        map.addLayer({
          id: maskLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "#000000",
            "fill-opacity": 0.35,
          },
        });
        */

        // Line Layer (Red Dashed Boundary)
        map.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#2563eb",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });
      }
    },
    [bbox],
  );

  // Update Bounds dynamically if changed
  useEffect(() => {
    if (mapRef.current) {
      // [FUTURE IMPLEMENTATION] Boundary Visuals & Snap to bbox
      if (bbox) {
        // Hapus MaxBounds agar zoom tidak terkunci, kita pakai Snap-Back di moveend.
        mapRef.current.setMaxBounds(undefined as any);

        if (mapRef.current.isStyleLoaded()) {
          drawBbox(mapRef.current);

          // HANYA fitBounds jika TIDAK ADA lokasi awal (lat/lng masih kosong)
          const hasInitial =
            initialLatitude && initialLongitude && initialLatitude !== 0;
          if (!hasInitial) {
            mapRef.current.fitBounds(
              [
                [bbox[0], bbox[1]],
                [bbox[2], bbox[3]],
              ],
              { padding: 100, maxZoom: 18 },
            );
          }
        } else {
          mapRef.current.once("style.load", () => {
            if (mapRef.current && bbox) {
              drawBbox(mapRef.current);

              const hasInitial =
                initialLatitude && initialLongitude && initialLatitude !== 0;
              if (!hasInitial) {
                mapRef.current.fitBounds(
                  [
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                  ],
                  { padding: 100, maxZoom: 18 },
                );
              }
            }
          });
        }
      } else {
        mapRef.current.setMaxBounds(undefined as any);
        if (mapRef.current.isStyleLoaded()) drawBbox(mapRef.current);
      }
    }
  }, [bbox, drawBbox, initialLatitude, initialLongitude]); // Tambahkan initial agar check valid

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
              "Mohon izinkan akses lokasi (GPS) pada pengaturan browser Anda, agar titik pin lokasi bisa ditentukan secara otomatis.",
              { duration: 10_000 },
            );
          } else {
            toast.error("Gagal mendeteksi lokasi GPS Anda.");
          }
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 60000 },
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
        <div className="absolute inset-0 z-9999 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700 font-secondary">
              Mendeteksi Alamat...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapMapboxLite;
