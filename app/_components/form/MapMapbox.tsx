"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import toast from "react-hot-toast";

// Hardcoded Token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

// Indonesia Boundary [min_lng, min_lat, max_lng, max_lat]
const IDN_BOUNDS: [[number, number], [number, number]] = [
  [94.0, -11.0], // Southwest [lng, lat]
  [141.0, 10.0], // Northeast [lng, lat]
];

interface MapMapboxProps {
  initialLatitude?: number;
  initialLongitude?: number;
  isInteractive?: boolean;
  bbox?: [number, number, number, number] | null;
  isLoading?: boolean;
  onPlaceChange?: (payload: {
    latitude: number;
    longitude: number;
    postcode?: string;
    address?: string;
    raw_result?: any;
  }) => void;
}

// Helper to calculate distance in meters (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

const MapMapbox: React.FC<MapMapboxProps> = ({
  initialLatitude,
  initialLongitude,
  isInteractive = false,
  bbox,
  isLoading = false,
  onPlaceChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const geocodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeocodedPosRef = useRef<{ lat: number; lng: number } | null>(null);

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

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [location.lng, location.lat],
      zoom: 15,
      interactive: isInteractive,
      maxBounds: IDN_BOUNDS, // Kunci peta agar hanya bisa di geser di Indonesia
    });

    if (isInteractive) {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    const marker = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    if (isInteractive) {
      // Marker follows center
      map.on("move", () => {
        const center = map.getCenter();
        marker.setLngLat([center.lng, center.lat]);

        // Clear timer if moving
        if (geocodeTimerRef.current) {
          clearTimeout(geocodeTimerRef.current);
          geocodeTimerRef.current = null;
        }
      });

      map.on("movestart", () => {
        if (geocodeTimerRef.current) {
          clearTimeout(geocodeTimerRef.current);
          geocodeTimerRef.current = null;
        }
      });

      map.on("moveend", () => {
        const center = map.getCenter();
        const lat = center.lat;
        const lng = center.lng;

        // 1. Kirim koordinat segera ke parent (untuk presisi DB) tanpa nunggu geocode
        if (onPlaceChangeRef.current) {
          onPlaceChangeRef.current({ latitude: lat, longitude: lng });
        }

        // 2. CEK JARAK (Hanya hit Geocoding jika geser > 50m)
        const lastPos = lastGeocodedPosRef.current;
        const distanceMoved = lastPos
          ? calculateDistance(lastPos.lat, lastPos.lng, lat, lng)
          : 99999; // Force hit if no last pos

        if (distanceMoved < 50) {
          console.log(
            `[MAP] Geser cuma ${Math.round(distanceMoved)}m. Skip Geocoding.`,
          );
          return;
        }

        // 3. Set Timer Geocoding (Debounce 5s)
        if (geocodeTimerRef.current) {
          clearTimeout(geocodeTimerRef.current);
        }

        geocodeTimerRef.current = setTimeout(async () => {
          try {
            const token = MAPBOX_TOKEN;
            const revUrl = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}&types=address,postcode&language=id`;
            const resRev = await fetch(revUrl);
            const dataRev = await resRev.json();
            const feature = dataRev.features?.[0];

            if (feature && onPlaceChangeRef.current) {
              const detectedPostcode =
                feature?.properties?.context?.postcode?.name ||
                feature?.properties?.name ||
                "";
              const detectedAddress =
                feature?.properties?.full_address ||
                feature?.properties?.name ||
                "";

              // 4. Kirim data lengkap ke parent
              onPlaceChangeRef.current({
                latitude: lat,
                longitude: lng,
                postcode: detectedPostcode,
                address: detectedAddress,
                raw_result: feature,
              });

              // 5. Update titik hit terakhir sukses
              lastGeocodedPosRef.current = { lat, lng };
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          } finally {
            geocodeTimerRef.current = null;
          }
        }, 5000); // 5 Seconds Countdown for Reverse Geocoding (Hemat Token)
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteractive]);

  // Update center/marker when initialLatitude/Longitude changes (from outside - e.g. Step 1 selection)
  useEffect(() => {
    if (
      mapRef.current &&
      markerRef.current &&
      initialLatitude &&
      initialLongitude &&
      initialLatitude !== 0
    ) {
      const center = mapRef.current.getCenter();
      if (
        Math.abs(center.lat - initialLatitude) > 0.0001 ||
        Math.abs(center.lng - initialLongitude) > 0.0001
      ) {
        mapRef.current.flyTo({
          center: [initialLongitude, initialLatitude],
          zoom: 16,
        });
        markerRef.current.setLngLat([initialLongitude, initialLatitude]);
      }
    }
  }, [initialLatitude, initialLongitude]);

  const drawBbox = useCallback(
    (map: mapboxgl.Map) => {
      const sourceId = "bbox-boundary";
      const layerId = "bbox-line";

      if (!bbox) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        return;
      }

      const geojson: any = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [bbox[0], bbox[1]],
              [bbox[2], bbox[1]],
              [bbox[2], bbox[3]],
              [bbox[0], bbox[3]],
              [bbox[0], bbox[1]],
            ],
          ],
        },
      };

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: layerId,
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
      if (bbox) {
        if (mapRef.current.isStyleLoaded()) {
          drawBbox(mapRef.current);
        } else {
          mapRef.current.once("style.load", () => {
            if (mapRef.current && bbox) {
              drawBbox(mapRef.current);
            }
          });
        }
      } else {
        if (mapRef.current.isStyleLoaded()) drawBbox(mapRef.current);
      }
    }
  }, [bbox, drawBbox]);

  return (
    <div className="w-full h-full relative group">
      <div
        ref={mapContainerRef}
        className={`w-full h-full transition-all duration-300 ${isLoading ? "grayscale opacity-70 pointer-events-none" : ""}`}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center z-10 animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded shadow-sm">
              Mensinkronkan Lokasi...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapMapbox;
