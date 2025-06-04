"use client";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
    iconUrl: markerIcon.src ?? markerIcon,
    shadowUrl: markerShadow.src ?? markerShadow,
  });
}

interface ClientMapProps {
  searchedLocation: { latitude: number; longitude: number } | null;
  userLocation: { latitude: number; longitude: number } | null;
}

import { useEffect } from "react";
import { useMap } from "react-leaflet";

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function ClientMap({ searchedLocation, userLocation }: ClientMapProps) {
  if (!searchedLocation || !userLocation) return null;
  console.log("ClientMap", searchedLocation, userLocation);
  const center: [number, number] = [
    (searchedLocation.latitude + userLocation.latitude) / 2,
    (searchedLocation.longitude + userLocation.longitude) / 2,
  ];
  return (
    <MapContainer
      center={center}
      zoom={3}
      style={{ height: "500px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <RecenterMap center={center} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <Marker position={[searchedLocation.latitude, searchedLocation.longitude]} />
      <Marker position={[userLocation.latitude, userLocation.longitude]} />
      <Polyline
        positions={[
          [searchedLocation.latitude, searchedLocation.longitude],
          [userLocation.latitude, userLocation.longitude],
        ]}
        pathOptions={{ color: 'green', weight: 4 }}
      />
    </MapContainer>
  );
}
