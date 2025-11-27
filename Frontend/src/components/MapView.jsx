import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icons missing in React-Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-zoom
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
};

const MapView = ({ routeCoordinates, routeColor, showBuses }) => {
  // 1. Safety Check: If data is missing, use a default Bangalore path
  const defaultPath = [
    [12.9716, 77.5946],
    [12.9121, 77.6446],
  ];

  const path =
    routeCoordinates && routeCoordinates.length > 0
      ? routeCoordinates
      : defaultPath;

  const color = routeColor || "blue";

  // 2. Extract Start/End points safely
  const startPoint = path[0];
  const endPoint = path[path.length - 1];

  // 3. Prevent crash if points are undefined
  if (!startPoint || !endPoint) return null;

  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", // Simple bus icon
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  const liveBuses = [
    { id: 1, lat: 12.9650, lng: 77.6000, label: "335-E (2 min)" },
    { id: 2, lat: 12.9600, lng: 77.6100, label: "V-500 (5 min)" }
  ]

  return (
    <div className="w-full h-full z-0">
      <MapContainer
        center={startPoint}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={startPoint}>
          <Popup>Start</Popup>
        </Marker>

        <Marker position={endPoint}>
          <Popup>Destination</Popup>
        </Marker>

        <Polyline positions={path} color={color} weight={5} opacity={0.7} />

        <RecenterAutomatically lat={startPoint[0]} lng={startPoint[1]} />

        {showBuses && liveBuses.map(bus => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup className="font-bold text-xs">
               🚌 {bus.label} <br/> Moving...
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
