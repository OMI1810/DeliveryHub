"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "./map-marker.css";

// Динамический импорт Leaflet-компонентов только на клиенте
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

interface Props {
  center: [number, number];
  label?: string;
}

export function CourierMap({ center, label }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [markerPosition, setMarkerPosition] =
    useState<[number, number]>(center);
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Импортируем Leaflet и CSS только на клиенте
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(
      ([L]) => {
        const customIcon = L.divIcon({
          html: `
          <div class="custom-marker-pin">
            <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#ef4444" stroke="#fff" stroke-width="2"/>
              <circle cx="16" cy="15" r="6" fill="#fff"/>
              <circle cx="16" cy="15" r="3" fill="#ef4444"/>
            </svg>
          </div>
        `,
          className: "",
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -42],
        });
        setIcon(customIcon);
      },
    );
  }, []);

  useEffect(() => {
    setMarkerPosition(center);
  }, [center]);

  if (!isMounted || !icon) {
    return (
      <div className="w-full h-[250px] bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
        Карта загружается...
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "250px", width: "100%", borderRadius: "8px" }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        position={markerPosition}
        icon={icon}
        {...(label ? { title: label } : {})}
      />
    </MapContainer>
  );
}
