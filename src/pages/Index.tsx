import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Shield, Home, Users, ArrowRight, BadgeCheck, Building2, Phone, Mail, MapPin } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import nolaHome1 from "@/assets/nola-home-1.jpg";
import nolaHome2 from "@/assets/nola-home-2.jpg";
import nolaHome3 from "@/assets/nola-home-3.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Modern housing community" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary-foreground/20">
              <BadgeCheck className="h-4 w-4" /> Housing Choice Voucher Program
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight">
              Find Your Next Home in New Orleans
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/85 mb-6 sm:mb-8 leading-relaxed max-w-xl">
              Connecting tenants with quality, affordable housing and landlords with reliable residents through HANO's Housing Choice Connect platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/listings" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8">
                  <Search className="h-4 w-4 mr-2" /> Browse Listings
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8">
                  Create Account <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">A simple platform connecting tenants and landlords through the Housing Choice Voucher Program</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: "Create Your Account", desc: "Register as a Tenant or Landlord with your Entity ID to access the platform." },
            { icon: Search, title: "Find Housing", desc: "Tenants can browse available properties, filter by preferences, and find voucher-accepting homes." },
            { icon: Building2, title: "List Properties", desc: "Landlords can post listings with photos, details, pricing, and manage availability." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-lg border p-6 text-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-foreground text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured New Orleans Housing */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">New Orleans Housing</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Discover the charm of New Orleans neighborhoods — from the Garden District to the French Quarter</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: nolaHome1, title: "Garden District", desc: "Classic Southern homes with columned porches and oak-lined streets" },
              { img: nolaHome2, title: "French Quarter", desc: "Iconic apartments with wrought-iron balconies and historic character" },
              { img: nolaHome3, title: "Uptown & Beyond", desc: "Well-maintained family homes in quiet, welcoming neighborhoods" },
            ].map(({ img, title, desc }) => (
              <Link to="/listings" key={title} className="group">
                <div className="bg-card rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={img} alt={`${title} housing in New Orleans`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-semibold text-foreground text-lg mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "18,000+", label: "Families Served" },
              { num: "10+", label: "HANO Communities" },
              { num: "24/7", label: "Online Access" },
              { num: "100%", label: "Voucher Support" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-1">{num}</div>
                <div className="text-sm opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HANO Quick Contact */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-4">Need Assistance?</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Housing Authority of New Orleans (HANO) is here to help with housing applications, voucher programs, and landlord inquiries.
              </p>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" /> <a href="tel:504-670-3300" className="hover:text-foreground transition-colors">(504) 670-3300</a>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" /> <a href="mailto:info@hano.org" className="hover:text-foreground transition-colors">info@hano.org</a>
                </p>
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" /> 1555 Poydras St, New Orleans, LA 70112
                </p>
              </div>
              <Link to="/contact" className="inline-block mt-6">
                <Button variant="outline">View Full Contact Info <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </Link>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-serif font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: "Apply for Housing", url: "https://hano.myhousing.com/" },
                  { label: "HCVP Information", url: "https://www.hano.org/housing-choice-voucher-program/" },
                  { label: "Become a HANO Landlord", url: "https://www.hano.org/become-a-landlord/" },
                  { label: "Visit HANO.org", url: "https://www.hano.org" },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm">
                    <span className="text-foreground font-medium">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Whether you're looking for a home or listing a property, create your account today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="font-semibold px-8">
                <Shield className="h-4 w-4 mr-2" /> Create Account
              </Button>
            </Link>
            <Link to="/listings">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Browse Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
