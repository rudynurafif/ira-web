"use client";

import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Hardcoded Token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapMapboxProps {
  initialLatitude?: number;
  initialLongitude?: number;
  isInteractive?: boolean;
  bbox?: [number, number, number, number] | null;
  isLoading?: boolean;
}

const MapMapbox: React.FC<MapMapboxProps> = ({
  initialLatitude,
  initialLongitude,
  isInteractive = false,
  bbox,
  isLoading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Initial Map Load
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = initialLatitude || -6.2088;
    const lng = initialLongitude || 106.8456;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: 15,
      interactive: isInteractive,
    });

    if (isInteractive && mapRef.current) {
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    markerRef.current = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    const map = mapRef.current;
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteractive]);

  // Update center/marker when initialLatitude/Longitude changes (from outside)
  useEffect(() => {
    if (
      mapRef.current &&
      markerRef.current &&
      initialLatitude &&
      initialLongitude
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
