import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  address?: string;
}

const ClickHandler = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPicker = ({ latitude, longitude, onLocationChange, address }: LocationPickerProps) => {
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const center: [number, number] = latitude && longitude
    ? [latitude, longitude]
    : [29.9511, -90.0715]; // New Orleans default

  const handleGeocode = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "User-Agent": "HousingChoiceConnect/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onLocationChange(lat, lng);
      }
    } catch {
      // silently fail
    } finally {
      setGeocoding(false);
    }
  }, [onLocationChange]);

  const geocodeAddress = () => {
    const query = searchQuery || address || "";
    handleGeocode(query);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Pin Location on Map</span>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Search address or click map..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), geocodeAddress())}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={geocodeAddress}
          disabled={geocoding}
          className="shrink-0"
        >
          <Search className="h-3.5 w-3.5 mr-1" />
          {geocoding ? "..." : "Find"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click the map to set the exact location, or search an address above
      </p>
      <div className="rounded-lg overflow-hidden border" style={{ height: "250px" }}>
        <MapContainer
          center={center}
          zoom={latitude ? 15 : 12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          key={`${center[0]}-${center[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={onLocationChange} />
          {latitude && longitude && (
            <Marker position={[latitude, longitude]} />
          )}
        </MapContainer>
      </div>
      {latitude && longitude && (
        <p className="text-xs text-muted-foreground">
          📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
