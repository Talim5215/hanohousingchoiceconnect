import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getOwnerSignedUrl } from "@/hooks/use-signed-images";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Image, MessageSquare, Mail, Eye, EyeOff, Clock } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type Tab = "listings" | "inquiries";

/** Thumbnail that resolves a storage path to a signed URL for dashboard previews */
const SignedThumb = ({ path, onRemove }: { path: string; onRemove: () => void }) => {
  const [src, setSrc] = useState("/placeholder.svg");
  useEffect(() => {
    getOwnerSignedUrl(path).then(setSrc);
  }, [path]);
  return (
    <div className="relative w-16 h-16 rounded overflow-hidden">
      <img src={src} alt="" className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-0.5"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};

/** Property card thumbnail that resolves a storage path to a signed URL */
const ListingThumb = ({ path, title }: { path: string; title: string }) => {
  const [src, setSrc] = useState("/placeholder.svg");
  useEffect(() => {
    if (path) getOwnerSignedUrl(path).then(setSrc);
  }, [path]);
  return <img src={src} alt={title} className="w-full h-full object-cover" />;
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("New Orleans");
  const [state, setState] = useState("LA");
  const [zipCode, setZipCode] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [squareFeet, setSquareFeet] = useState("");
  const [propertyType, setPropertyType] = useState("apartment");
  const [acceptsVouchers, setAcceptsVouchers] = useState(true);
  const [amenitiesStr, setAmenitiesStr] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchInquiries();
    }
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;
    const { data } = await supabase.from("properties").select("*").eq("landlord_id", user.id).order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  const fetchInquiries = async () => {
    if (!user) return;
    const { data } = await supabase.from("inquiries").select("*, properties(title)").eq("landlord_id", user.id).order("created_at", { ascending: false });
    setInquiries(data || []);
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setAddress(""); setCity("New Orleans"); setState("LA");
    setZipCode(""); setPrice(""); setBedrooms("1"); setBathrooms("1"); setSquareFeet("");
    setPropertyType("apartment"); setAcceptsVouchers(true); setAmenitiesStr(""); setImageFiles([]); setExistingImages([]);
    setEditId(null);
  };

  const startEdit = (p: any) => {
    setEditId(p.id);
    setTitle(p.title); setDescription(p.description || ""); setAddress(p.address);
    setCity(p.city); setState(p.state); setZipCode(p.zip_code || "");
    setPrice(String(p.price)); setBedrooms(String(p.bedrooms)); setBathrooms(String(p.bathrooms));
    setSquareFeet(p.square_feet ? String(p.square_feet) : ""); setPropertyType(p.property_type);
    setAcceptsVouchers(p.accepts_vouchers); setAmenitiesStr((p.amenities || []).join(", "));
    setExistingImages(p.images || []); setImageFiles([]);
    setShowForm(true);
    setActiveTab("listings");
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!user) return [];
    const storagePaths: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("property-images").upload(path, file);
      if (!error) {
        // Store the storage path — images are served via signed URLs, not public URLs
        storagePaths.push(path);
      }
    }
    return storagePaths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    let allImages = [...existingImages];
    if (imageFiles.length > 0) {
      const newPaths = await uploadImages(imageFiles);
      allImages = [...allImages, ...newPaths];
    }

    const propertyData = {
      landlord_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip_code: zipCode.trim() || null,
      price: parseFloat(price),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseFloat(bathrooms),
      square_feet: squareFeet ? parseInt(squareFeet) : null,
      property_type: propertyType,
      accepts_vouchers: acceptsVouchers,
      amenities: amenitiesStr ? amenitiesStr.split(",").map(s => s.trim()).filter(Boolean) : null,
      images: allImages.length > 0 ? allImages : null,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("properties").update(propertyData).eq("id", editId));
    } else {
      ({ error } = await supabase.from("properties").insert(propertyData));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editId ? "Property updated!" : "Property listed!" });
      resetForm();
      setShowForm(false);
      fetchProperties();
    }
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      toast({ title: "Property deleted" });
      fetchProperties();
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("properties").update({ is_available: !current }).eq("id", id);
    fetchProperties();
  };

  const markRead = async (inquiryId: string) => {
    await supabase.from("inquiries").update({ is_read: true }).eq("id", inquiryId);
    fetchInquiries();
  };

  const deleteInquiry = async (inquiryId: string) => {
    await supabase.from("inquiries").delete().eq("id", inquiryId);
    fetchInquiries();
  };

  const unreadCount = inquiries.filter(i => !i.is_read).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Landlord Dashboard</h1>
            <p className="text-muted-foreground">Manage your property listings and inquiries</p>
          </div>
          {activeTab === "listings" && (
            <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
              <Plus className="h-4 w-4 mr-2" /> {showForm ? "Cancel" : "Add Property"}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "listings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Listings ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "inquiries" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Inquiries
            {unreadCount > 0 && (
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <>
            {showForm && (
              <div className="bg-card rounded-lg border p-6 mb-8">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
                  {editId ? "Edit Property" : "List New Property"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Property Title</Label>
                      <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Spacious 2BR in Garden District" />
                    </div>
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <select id="propertyType" value={propertyType} onChange={e => setPropertyType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="duplex">Duplex</option>
                        <option value="condo">Condo</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={city} onChange={e => setCity(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" value={state} onChange={e => setState(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP</Label>
                        <Input id="zip" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="70112" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price">Monthly Rent ($)</Label>
                      <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" placeholder="1200" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="bedrooms">Beds</Label>
                        <Input id="bedrooms" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} required min="0" />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Baths</Label>
                        <Input id="bathrooms" type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} required min="0" step="0.5" />
                      </div>
                      <div>
                        <Label htmlFor="sqft">Sq Ft</Label>
                        <Input id="sqft" type="number" value={squareFeet} onChange={e => setSquareFeet(e.target.value)} placeholder="900" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the property, neighborhood, and any special features..." />
                  </div>

                  <div>
                    <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                    <Input id="amenities" value={amenitiesStr} onChange={e => setAmenitiesStr(e.target.value)} placeholder="AC, Dishwasher, Parking, Laundry, Pet Friendly" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="vouchers" checked={acceptsVouchers} onChange={e => setAcceptsVouchers(e.target.checked)} className="rounded" />
                    <Label htmlFor="vouchers">Accepts Housing Choice Vouchers</Label>
                  </div>

                  <div>
                    <Label>Property Photos</Label>
                    <div className="mt-1">
                      <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <Image className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload images</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImageFiles(Array.from(e.target.files || []))} />
                      </label>
                      {imageFiles.length > 0 && <p className="text-xs text-muted-foreground mt-1">{imageFiles.length} file(s) selected</p>}
                      {existingImages.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {existingImages.map((imgPath, i) => (
                            <SignedThumb
                              key={i}
                              path={imgPath}
                              onRemove={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : (editId ? "Update Property" : "List Property")}
                  </Button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading your properties...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground text-lg mb-2">No properties listed yet</p>
                <p className="text-sm text-muted-foreground">Click "Add Property" to create your first listing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((p) => (
                  <div key={p.id} className="bg-card rounded-lg border p-4 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden shrink-0">
                      <ListingThumb path={p.images?.[0] || ""} title={p.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{p.title}</h3>
                          <p className="text-sm text-muted-foreground">{p.address}, {p.city}</p>
                        </div>
                        <span className="text-secondary font-bold shrink-0">${Number(p.price).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{p.bedrooms} bed · {p.bathrooms} bath</span>
                        <span>·</span>
                        <span className={p.is_available ? "text-accent" : "text-destructive"}>{p.is_available ? "Available" : "Unavailable"}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="outline" size="sm" onClick={() => toggleAvailability(p.id, p.is_available)}>
                        {p.is_available ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteProperty(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <>
            {inquiries.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-lg mb-2">No inquiries yet</p>
                <p className="text-sm text-muted-foreground">Tenant messages will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div key={inq.id} className={`bg-card rounded-lg border p-5 ${!inq.is_read ? "border-primary/30" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{inq.tenant_name}</span>
                          {!inq.is_read && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">New</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Re: <span className="font-medium">{inq.properties?.title || "Unknown property"}</span>
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{inq.message}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <a href={`mailto:${inq.tenant_email}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <Mail className="h-3 w-3" /> {inq.tenant_email}
                          </a>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(inq.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {!inq.is_read && (
                          <Button variant="outline" size="sm" onClick={() => markRead(inq.id)} className="text-xs">
                            <Eye className="h-3 w-3 mr-1" /> Mark Read
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-destructive text-xs" onClick={() => deleteInquiry(inq.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
