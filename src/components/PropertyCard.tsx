import { Link } from "react-router-dom";
import { Bath, Bed, MapPin, Ruler, BadgeCheck } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  property_type: string;
  accepts_vouchers: boolean;
  images: string[] | null;
}

const PropertyCard = ({ id, title, address, city, state, price, bedrooms, bathrooms, square_feet, property_type, accepts_vouchers, images }: PropertyCardProps) => {
  const imageUrl = images && images.length > 0 ? images[0] : "/placeholder.svg";

  return (
    <Link to={`/listings/${id}`} className="group block">
      <div className="bg-card rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {accepts_vouchers && (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> Vouchers Accepted
            </div>
          )}
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full capitalize">
            {property_type}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-serif font-semibold text-foreground text-lg leading-tight line-clamp-1">{title}</h3>
            <span className="text-secondary font-bold text-lg shrink-0 ml-2">${price.toLocaleString()}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3.5 w-3.5" /> {address}, {city}, {state}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {bedrooms} Bed</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {bathrooms} Bath</span>
            {square_feet && <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {square_feet} sqft</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
