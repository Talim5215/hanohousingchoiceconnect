import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Bed, Bath, BadgeCheck } from "lucide-react";

// Fix default marker icons (Leaflet + bundler issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const primaryIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  accepts_vouchers: boolean;
  latitude: number | null;
  longitude: number | null;
}

/** Fit bounds to markers */
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (positions.length > 0 && !fitted.current) {
      fitted.current = true;
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [positions, map]);
  return null;
};

interface PropertyMapProps {
  properties: MapProperty[];
  className?: string;
  /** If true, popups link to property detail pages */
  linkToDetail?: boolean;
}

const PropertyMap = ({ properties, className = "", linkToDetail = true }: PropertyMapProps) => {
  const mappable = properties.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  const positions: [number, number][] = mappable.map((p) => [
    p.latitude!,
    p.longitude!,
  ]);

  // Default center: New Orleans
  const center: [number, number] = positions.length > 0
    ? positions[0]
    : [29.9511, -90.0715];

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "300px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        {mappable.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude!, p.longitude!]}
            icon={primaryIcon}
          >
            <Popup>
              <div className="text-sm min-w-[180px]">
                <p className="font-semibold text-foreground mb-1">{p.title}</p>
                <p className="text-muted-foreground text-xs mb-1">{p.address}, {p.city}</p>
                <p className="font-bold text-secondary mb-1">${p.price.toLocaleString()}/mo</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" /> {p.bedrooms}</span>
                  <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" /> {p.bathrooms}</span>
                </div>
                {p.accepts_vouchers && (
                  <div className="flex items-center gap-1 text-xs text-accent mb-2">
                    <BadgeCheck className="h-3 w-3" /> Vouchers Accepted
                  </div>
                )}
                {linkToDetail && (
                  <Link
                    to={`/listings/${p.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
