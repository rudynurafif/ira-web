"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Rectangle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";

// Indonesia Boundary [min_lat, min_lng], [max_lat, max_lng]
const IDN_BOUNDS: L.LatLngBoundsExpression = [
  [-11.0, 94.0], // Southwest
  [6.0, 141.0], // Northeast
];

// Fix Leaflet marker icon issue in Next.js
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

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

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
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Component to handle map center changes from props
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Component to handle map move events
const MapEvents = ({
  isInteractive,
  isLoading,
  onPlaceChange,
  lastGeocodedPosRef,
  geocodeTimerRef,
  setMarkerPos,
}: {
  isInteractive: boolean;
  isLoading: boolean;
  onPlaceChange: any;
  lastGeocodedPosRef: React.MutableRefObject<{
    lat: number;
    lng: number;
  } | null>;
  geocodeTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  setMarkerPos: (pos: L.LatLng) => void;
}) => {
  const map = useMapEvents({
    move: () => {
      if (isInteractive) {
        setMarkerPos(map.getCenter());
      }
    },
    moveend: async () => {
      if (!isInteractive) return;

      const center = map.getCenter();
      const lat = center.lat;
      const lng = center.lng;

      setMarkerPos(center);

      // 1. Kirim koordinat segera ke parent
      if (onPlaceChange) {
        onPlaceChange({ latitude: lat, longitude: lng });
      }

      // 2. CEK JARAK (Hanya hit Geocoding jika geser > 50m)
      const lastPos = lastGeocodedPosRef.current;
      const distanceMoved = lastPos
        ? calculateDistance(lastPos.lat, lastPos.lng, lat, lng)
        : 99999;

      if (distanceMoved < 50) return;

      // 3. Set Timer Geocoding (Debounce 5s)
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

      geocodeTimerRef.current = setTimeout(async () => {
        if (isLoading) return;

        try {
          // reverse geocoding via Google Maps API
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=id`;
          const res = await fetch(url);
          const data = await res.json();
          const result = data.results?.[0];

          if (result && onPlaceChange) {
            let postcode = "";
            result.address_components.forEach((comp: any) => {
              if (comp.types.includes("postal_code")) postcode = comp.long_name;
            });

            onPlaceChange({
              latitude: lat,
              longitude: lng,
              postcode: postcode,
              address: result.formatted_address,
              raw_result: result,
            });

            lastGeocodedPosRef.current = { lat, lng };
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        } finally {
          geocodeTimerRef.current = null;
        }
      }, 5000);
    },
    movestart: () => {
      if (geocodeTimerRef.current) {
        clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = null;
      }
    },
  });
  return null;
};

const MapLeaflet: React.FC<MapLeafletProps> = ({
  initialLatitude,
  initialLongitude,
  isInteractive = false,
  bbox,
  isLoading = false,
  onPlaceChange,
}) => {
  const geocodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeocodedPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const [center, setCenter] = useState<[number, number]>(() => {
    if (initialLatitude && initialLongitude && initialLatitude !== 0) {
      return [initialLatitude, initialLongitude];
    }
    return [-6.2088, 106.8456]; // Default Jakarta
  });

  const [markerPos, setMarkerPos] = useState<[number, number]>(center);

  useEffect(() => {
    if (initialLatitude && initialLongitude && initialLatitude !== 0) {
      setCenter([initialLatitude, initialLongitude]);
      setMarkerPos([initialLatitude, initialLongitude]);
    }
  }, [initialLatitude, initialLongitude]);

  return (
    <div className="w-full h-full relative group min-h-[300px]">
      <MapContainer
        center={center}
        zoom={15}
        maxBounds={IDN_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={isInteractive}
        dragging={isInteractive}
        touchZoom={isInteractive}
        doubleClickZoom={isInteractive}
        className={`w-full h-full z-0 transition-all duration-300 ${isLoading ? "grayscale opacity-70 pointer-events-none" : ""}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} />
        
        {/* Geofencing Boundary (BBox Visualizer) */}
        {bbox && (
          <Rectangle
            bounds={[
              [bbox[1], bbox[0]], // Southwest [lat, lng]
              [bbox[3], bbox[2]], // Northeast [lat, lng]
            ]}
            pathOptions={{
              color: "#2563eb",
              dashArray: "4, 4",
              weight: 3,
              fill: false,
            }}
          />
        )}

        <Marker position={markerPos} />
        <MapEvents
          isInteractive={isInteractive}
          isLoading={isLoading}
          onPlaceChange={onPlaceChange}
          lastGeocodedPosRef={lastGeocodedPosRef}
          geocodeTimerRef={geocodeTimerRef}
          setMarkerPos={(pos) => setMarkerPos([pos.lat, pos.lng])}
        />
      </MapContainer>

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

export default MapLeaflet;
