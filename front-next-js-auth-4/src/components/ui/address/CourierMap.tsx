"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "./map-marker.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <MapSkeleton /> },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

function MapSkeleton() {
  return (
    <div className="w-full h-[300px] bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 text-sm">
      Карта загружается...
    </div>
  );
}

export interface MapPoint {
  lat: number;
  lon: number;
  label: string;
  color?: "restaurant" | "customer";
}

interface Props {
  points: MapPoint[];
  showRoute?: boolean;
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds: [number, number][] = points.map((p) => [p.lat, p.lon]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, points]);

  return null;
}

export function CourierMap({ points, showRoute = true }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [icons, setIcons] = useState<Record<string, any>>({});

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((L) => {
      const createIcon = (color: string) =>
        L.divIcon({
          html: `
            <div class="custom-marker-pin">
              <svg width="32" height="42" viewBox="0 0 32 42" fill="none">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
                <circle cx="16" cy="15" r="6" fill="#fff"/>
                <circle cx="16" cy="15" r="3" fill="${color}"/>
              </svg>
            </div>
          `,
          className: "",
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -42],
        });

      setIcons({
        restaurant: createIcon("#3b82f6"),
        customer: createIcon("#ef4444"),
        default: createIcon("#10b981"),
      });
    });
  }, []);

  if (!isMounted || Object.keys(icons).length === 0) {
    return <MapSkeleton />;
  }

  const routeCoords: [number, number][] =
    showRoute && points.length >= 2 ? points.map((p) => [p.lat, p.lon]) : [];

  const defaultCenter: [number, number] =
    points.length > 0 ? [points[0].lat, points[0].lon] : [55.75, 37.61];

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <MapContainer
        key={points.map((p) => `${p.lat}-${p.lon}`).join(",")}
        center={defaultCenter}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
        attributionControl={false}
        zoomControl={false}
      >
        <FitBounds points={points} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {routeCoords.length >= 2 && (
          <Polyline
            positions={routeCoords}
            color="#10b981"
            weight={4}
            dashArray="8, 8"
          />
        )}

        {points.map((point, i) => {
          const iconKey = point.color || "default";
          const icon = icons[iconKey] || icons.default;
          return (
            <Marker key={i} position={[point.lat, point.lon]} icon={icon}>
              <Popup>{point.label}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
