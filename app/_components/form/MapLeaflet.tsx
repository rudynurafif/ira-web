"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Indonesia Boundary
const IDN_BOUNDS: [[number, number], [number, number]] = [
  [-11.0, 94.0], // Southwest [lat, lng] -> Leaflet uses [lat, lng]
  [10.0, 141.0], // Northeast [lat, lng]
];

interface MapLeafletProps {
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

const MapLeaflet: React.FC<MapLeafletProps> = ({
  initialLatitude,
  initialLongitude,
  isInteractive = false,
  bbox,
  isLoading = false,
  onPlaceChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const bboxLayerRef = useRef<L.Polygon | null>(null);
  const geocodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeocodedPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const [location] = useState<{ lat: number; lng: number }>(() => {
    if (initialLatitude && initialLongitude && initialLatitude !== 0) {
      return { lat: initialLatitude, lng: initialLongitude };
    }
    return { lat: -6.2088, lng: 106.8456 }; // Default Jakarta
  });

  const onPlaceChangeRef = useRef(onPlaceChange);
  useEffect(() => {
    onPlaceChangeRef.current = onPlaceChange;
  }, [onPlaceChange]);

  // Fix Leaflet Default Icon issue in Next.js
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // Map Initialization
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !mapContainerRef.current ||
      mapRef.current
    )
      return;

    const map = L.map(mapContainerRef.current, {
      center: [location.lat, location.lng],
      zoom: 16,
      dragging: isInteractive,
      touchZoom: isInteractive,
      scrollWheelZoom: isInteractive,
      doubleClickZoom: isInteractive,
      boxZoom: isInteractive,
      zoomControl: false,
      maxBounds: L.latLngBounds(IDN_BOUNDS),
      maxBoundsViscosity: 0.8,
    });

    if (isInteractive) {
      L.control.zoom({ position: "topright" }).addTo(map);
    }

    // Tile Layer - OpenStreetMap Standard (Classic, highly detailed)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([location.lat, location.lng], {
      interactive: false, // marker follows map center
    }).addTo(map);

    if (isInteractive) {
      map.on("move", () => {
        const center = map.getCenter();
        marker.setLatLng(center);

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
        if (isProgrammaticMoveRef.current) return;

        const center = map.getCenter();
        const lat = center.lat;
        const lng = center.lng;

        if (onPlaceChangeRef.current) {
          onPlaceChangeRef.current({ latitude: lat, longitude: lng });
        }

        const lastPos = lastGeocodedPosRef.current;
        const distanceMoved = lastPos
          ? calculateDistance(lastPos.lat, lastPos.lng, lat, lng)
          : 99999;

        if (distanceMoved < 50) return;

        if (geocodeTimerRef.current) {
          clearTimeout(geocodeTimerRef.current);
        }

        geocodeTimerRef.current = setTimeout(async () => {
          if (isLoading) return;

          try {
            // Menggunakan Mapbox API agar sinkron dengan batasan kode pos
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            const revUrl = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}&types=address,postcode&language=id`;
            const resRev = await fetch(revUrl);
            const dataRev = await resRev.json();
            const feature = dataRev.features?.[0];

            if (feature && onPlaceChangeRef.current) {
              const detectedPostcode =
                feature?.properties?.context?.postcode?.name ||
                feature?.properties?.name ||
                "";
              const detectedAddress = feature?.properties?.full_address || "";

              onPlaceChangeRef.current({
                latitude: lat,
                longitude: lng,
                postcode: detectedPostcode,
                address: detectedAddress,
                raw_result: dataRev,
              });

              lastGeocodedPosRef.current = { lat, lng };
            }
          } catch (error) {
            console.error(
              "Reverse geocoding failed (Leaflet/Nominatim):",
              error,
            );
          } finally {
            geocodeTimerRef.current = null;
          }
        }, 5000);
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    // Fix for Leaflet tiles not loading properly using ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteractive]);

  // Update center when initialLatitude/Longitude changes
  const isProgrammaticMoveRef = useRef(false);

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
        isProgrammaticMoveRef.current = true;
        mapRef.current.flyTo([initialLatitude, initialLongitude], 16, {
          duration: 1.5,
        });
        markerRef.current.setLatLng([initialLatitude, initialLongitude]);

        // Reset the flag after animation theoretically finishes
        setTimeout(() => {
          isProgrammaticMoveRef.current = false;
        }, 2000);

        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    }
  }, [initialLatitude, initialLongitude]);

  // Handle BBox Drawing
  useEffect(() => {
    if (!mapRef.current) return;

    if (bboxLayerRef.current) {
      mapRef.current.removeLayer(bboxLayerRef.current);
      bboxLayerRef.current = null;
    }

    if (bbox) {
      // bbox: [minX, minY, maxX, maxY] -> [minLng, minLat, maxLng, maxLat]
      const latlngs: [number, number][] = [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[0]],
        [bbox[3], bbox[2]],
        [bbox[1], bbox[2]],
      ];

      const polygon = L.polygon(latlngs, {
        color: "#2563eb",
        weight: 3,
        fill: false,
        dashArray: "5, 5",
      }).addTo(mapRef.current);

      bboxLayerRef.current = polygon;
    }
  }, [bbox]);

  return (
    <div className="w-full h-full relative group bg-gray-50/50">
      <div
        className={`absolute inset-0 z-[1] ${isLoading ? "pointer-events-none" : ""}`}
      >
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ zIndex: 1 }}
        />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-[1000] animate-in fade-in duration-300">
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

export default MapLeaflet;
