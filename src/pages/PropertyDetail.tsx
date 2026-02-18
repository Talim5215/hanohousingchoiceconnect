import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bed, Bath, Ruler, MapPin, BadgeCheck, Calendar, Home, Phone, Mail, ExternalLink, Send } from "lucide-react";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryErrors, setInquiryErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(({ data }) => {
          setProperty(data);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse text-muted-foreground">Loading property...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Property Not Found</h1>
          <Link to="/listings"><Button>Back to Listings</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : ["/placeholder.svg"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Link to="/listings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden aspect-[16/10] mb-3">
              <img src={images[selectedImage]} alt={property.title} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${i === selectedImage ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details sidebar */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{property.title}</h1>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {property.address}, {property.city}, {property.state} {property.zip_code}
              </p>
            </div>

            <div className="bg-card rounded-lg border p-5">
              <div className="text-3xl font-bold text-secondary mb-1">${Number(property.price).toLocaleString()}<span className="text-base text-muted-foreground font-normal">/month</span></div>
              {property.accepts_vouchers && (
                <div className="flex items-center gap-1.5 text-accent text-sm font-medium mt-2">
                  <BadgeCheck className="h-4 w-4" /> Housing Choice Vouchers Accepted
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg p-3 text-center">
                <Bed className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <span className="text-sm font-medium text-foreground">{property.bedrooms} Bedrooms</span>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <Bath className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <span className="text-sm font-medium text-foreground">{property.bathrooms} Bathrooms</span>
              </div>
              {property.square_feet && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <Ruler className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <span className="text-sm font-medium text-foreground">{property.square_feet} sqft</span>
                </div>
              )}
              <div className="bg-muted rounded-lg p-3 text-center">
                <Home className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <span className="text-sm font-medium text-foreground capitalize">{property.property_type}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Listed {new Date(property.created_at).toLocaleDateString()}
            </div>

            {/* HANO Contact Card */}
            <div className="bg-card rounded-lg border p-5 space-y-3">
              <h3 className="font-serif font-semibold text-foreground text-sm">Need Voucher Assistance?</h3>
              <p className="text-xs text-muted-foreground">Contact the Housing Authority of New Orleans for help with the Housing Choice Voucher Program.</p>
              <div className="space-y-2 text-sm">
                <a href="tel:504-670-3300" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> (504) 670-3300
                </a>
                <a href="mailto:info@hano.org" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> info@hano.org
                </a>
                <p className="flex items-start gap-2 text-muted-foreground text-xs">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> 1555 Poydras St, New Orleans, LA 70112
                </p>
              </div>
              <a
                href="https://www.hano.org/housing-choice-voucher-program/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mt-1"
              >
                Learn about HCVP <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Description, amenities & inquiry form */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {property.description && (
              <div className="mb-8">
                <h2 className="text-xl font-serif font-bold text-foreground mb-3">About This Property</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a: string, i: number) => (
                    <span key={i} className="bg-muted text-foreground text-sm px-3 py-1.5 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inquiry Form */}
          <div className="bg-card rounded-lg border p-5">
            <h3 className="font-serif font-semibold text-foreground text-lg mb-1">Inquire About This Property</h3>
            <p className="text-xs text-muted-foreground mb-4">Send a message to the landlord</p>
            {inquirySent ? (
              <div className="text-center py-6">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="h-5 w-5 text-accent" />
                </div>
                <p className="font-medium text-foreground mb-1">Inquiry Sent!</p>
                <p className="text-xs text-muted-foreground">The landlord will respond to your email.</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setInquiryErrors({});
                const result = inquirySchema.safeParse({ name: inquiryName, email: inquiryEmail, phone: inquiryPhone, message: inquiryMessage });
                if (!result.success) {
                  const errs: Record<string, string> = {};
                  result.error.issues.forEach(i => { const f = i.path[0] as string; if (!errs[f]) errs[f] = i.message; });
                  setInquiryErrors(errs);
                  return;
                }
                setInquirySending(true);
                const { error } = await supabase.from("inquiries").insert({
                  property_id: property.id,
                  landlord_id: property.landlord_id,
                  tenant_name: result.data.name,
                  tenant_email: result.data.email,
                  tenant_phone: result.data.phone || null,
                  message: result.data.message,
                });
                setInquirySending(false);
                if (error) {
                  toast({ title: "Error", description: "Could not send inquiry. Please try again.", variant: "destructive" });
                } else {
                  setInquirySent(true);
                }
              }} className="space-y-3">
                <div>
                  <Label htmlFor="iqName" className="text-xs">Your Name</Label>
                  <Input id="iqName" value={inquiryName} onChange={e => setInquiryName(e.target.value)} required placeholder="Jane Doe" maxLength={100} className="h-9 text-sm" />
                  {inquiryErrors.name && <p className="text-xs text-destructive mt-0.5">{inquiryErrors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="iqEmail" className="text-xs">Email</Label>
                  <Input id="iqEmail" type="email" value={inquiryEmail} onChange={e => setInquiryEmail(e.target.value)} required placeholder="you@example.com" maxLength={255} className="h-9 text-sm" />
                  {inquiryErrors.email && <p className="text-xs text-destructive mt-0.5">{inquiryErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="iqPhone" className="text-xs">Phone (optional)</Label>
                  <Input id="iqPhone" type="tel" value={inquiryPhone} onChange={e => setInquiryPhone(e.target.value)} placeholder="(504) 555-0123" maxLength={20} className="h-9 text-sm" />
                </div>
                <div>
                  <Label htmlFor="iqMsg" className="text-xs">Message</Label>
                  <Textarea id="iqMsg" value={inquiryMessage} onChange={e => setInquiryMessage(e.target.value)} required rows={3} placeholder="I'm interested in this property..." maxLength={1000} className="text-sm" />
                  {inquiryErrors.message && <p className="text-xs text-destructive mt-0.5">{inquiryErrors.message}</p>}
                </div>
                <Button type="submit" className="w-full" size="sm" disabled={inquirySending}>
                  <Send className="h-3.5 w-3.5 mr-2" /> {inquirySending ? "Sending..." : "Send Inquiry"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
