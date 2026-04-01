"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Hardcoded Token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapMapboxProps {
  initialLatitude?: number;
  initialLongitude?: number;
  isInteractive?: boolean;
}

const MapMapbox: React.FC<MapMapboxProps> = ({
  initialLatitude,
  initialLongitude,
  isInteractive = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = initialLatitude || -6.2088;
    const lng = initialLongitude || 106.8456;

    // Initialize Mapbox
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

    // Add Marker
    markerRef.current = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    // Resize handler
    const map = mapRef.current;
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
  }, [initialLatitude, initialLongitude, isInteractive]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MapMapbox;
