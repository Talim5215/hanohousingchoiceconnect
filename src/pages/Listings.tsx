import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROPERTY_TYPES = ["all", "voucher", "apartment", "house", "townhouse", "duplex"] as const;
const BEDROOM_OPTIONS = [0, 1, 2, 3, 4] as const;

const Listings = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProperties(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.zip_code && p.zip_code.includes(q));
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "voucher" && p.accepts_vouchers) ||
        p.property_type === typeFilter;
      const matchesBeds = p.bedrooms >= minBeds;
      const matchesBaths = p.bathrooms >= minBaths;
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = p.price >= min && p.price <= max;
      return matchesSearch && matchesType && matchesBeds && matchesBaths && matchesPrice;
    });
  }, [properties, search, typeFilter, minBeds, minBaths, minPrice, maxPrice]);

  const hasActiveFilters = minBeds > 0 || minBaths > 0 || minPrice || maxPrice;

  const clearFilters = () => {
    setMinBeds(0);
    setMinBaths(0);
    setMinPrice("");
    setMaxPrice("");
    setTypeFilter("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">Available Properties</h1>
          <p className="text-muted-foreground">Find your next home in New Orleans</p>
        </div>

        {/* Search + filter toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, address, city, or zip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              maxLength={100}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">!</span>
            )}
          </Button>
        </div>

        {/* Property type pills */}
        <div className="flex gap-2 flex-wrap mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {PROPERTY_TYPES.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                typeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "voucher" ? "Vouchers" : f}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="bg-card border rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Refine Results</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Min Bedrooms</Label>
                <div className="flex gap-1">
                  {BEDROOM_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setMinBeds(n)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                        minBeds === n
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {n === 0 ? "Any" : `${n}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Min Bathrooms</Label>
                <div className="flex gap-1">
                  {BEDROOM_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setMinBaths(n)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                        minBaths === n
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {n === 0 ? "Any" : `${n}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="minPrice" className="text-xs text-muted-foreground mb-1 block">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min={0}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-xs text-muted-foreground mb-1 block">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="No max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min={0}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-lg border overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-2">No properties found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear All Filters</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PropertyCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
