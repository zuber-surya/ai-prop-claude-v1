"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { PropertyListItem } from "@/lib/properties";
import { formatInrPaise } from "@/lib/format";

// Leaflet's default marker icon references relative image paths that break
// under Next.js's bundler (a well-known Leaflet+webpack/Turbopack issue).
// Point at the exact installed Leaflet version's marker images on unpkg
// instead of trying to bundle them - same tier of external request this
// feature already requires for the OSM tile server itself.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Surat, Gujarat - matches the seed data's locations (SCHEMA.md §5).
const DEFAULT_CENTER: [number, number] = [21.1702, 72.8311];

export function PropertyMap({
  properties,
}: {
  properties: PropertyListItem[];
}) {
  const geocoded = properties.filter(
    (p): p is PropertyListItem & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null
  );

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-md border border-outline-variant">
      <MapView geocoded={geocoded} ungeocodedCount={properties.length - geocoded.length} />
    </div>
  );
}

function MapView({
  geocoded,
  ungeocodedCount,
}: {
  geocoded: (PropertyListItem & { latitude: number; longitude: number })[];
  ungeocodedCount: number;
}) {
  const center =
    geocoded.length > 0
      ? ([geocoded[0].latitude, geocoded[0].longitude] as [number, number])
      : DEFAULT_CENTER;

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
        <FitBounds geocoded={geocoded} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geocoded.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <Link href={`/property/${property.id}`} className="font-semibold text-primary">
                {property.title}
              </Link>
              <br />
              {formatInrPaise(property.price)} · {property.bedrooms} BHK
              <br />
              {property.location}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {ungeocodedCount > 0 ? (
        <p className="absolute bottom-2 left-2 z-[1000] rounded bg-surface-container-lowest/90 px-3 py-1 text-xs text-on-surface-variant shadow-sm">
          {ungeocodedCount} {ungeocodedCount === 1 ? "listing isn't" : "listings aren't"} shown on
          the map yet (not geocoded)
        </p>
      ) : null}
    </div>
  );
}

function FitBounds({
  geocoded,
}: {
  geocoded: { latitude: number; longitude: number }[];
}) {
  const map = useMap();

  useEffect(() => {
    if (geocoded.length < 2) return;
    const bounds = L.latLngBounds(geocoded.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [32, 32] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocoded.length]);

  return null;
}
