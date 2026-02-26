import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UserPlus, Search, Send, Home, ClipboardList, ImagePlus,
  CheckCircle, MessageSquare, FileText, Shield, Eye, Settings,
  ArrowRight, Mail, Phone, Building2, Users, Key
} from "lucide-react";

const steps = {
  tenant: [
    { icon: UserPlus, title: "Create Your Account", desc: "Visit the registration page and select \"I'm a Tenant.\" Fill in your full name, Entity ID (provided by HANO), email, and password. Check your email for a verification link." },
    { icon: Search, title: "Browse Available Listings", desc: "Navigate to \"Browse Listings\" from the top menu. Use filters to narrow results by bedrooms, price range, property type, and voucher acceptance." },
    { icon: Eye, title: "View Property Details", desc: "Click on any listing to see full details including photos, amenities, square footage, and landlord information." },
    { icon: Send, title: "Send an Inquiry", desc: "On the property detail page, fill out the inquiry form with your name, email, phone, and a message to the landlord. The landlord will receive your inquiry directly." },
    { icon: MessageSquare, title: "Communicate with Landlords", desc: "After submitting an inquiry, the landlord may respond via the email or phone number you provided. Be sure to check your inbox regularly." },
    { icon: CheckCircle, title: "Secure Your Housing", desc: "Once a landlord accepts, coordinate with HANO to finalize your Housing Choice Voucher paperwork and move-in details." },
  ],
  landlord: [
    { icon: UserPlus, title: "Register as a Landlord", desc: "Create an account and select \"I'm a Landlord.\" Enter your Entity ID assigned by HANO, your full name, email, and a secure password." },
    { icon: Settings, title: "Access Your Dashboard", desc: "After logging in, click \"Dashboard\" in the navigation bar. This is your control center for managing properties and tenant inquiries." },
    { icon: ClipboardList, title: "List a Property", desc: "In your dashboard, click \"Add Property.\" Fill in the address, rent amount, bedrooms, bathrooms, property type, and whether you accept housing vouchers." },
    { icon: ImagePlus, title: "Upload Photos", desc: "Add high-quality photos of your property to attract tenants. Clear, well-lit images of each room significantly increase inquiry rates." },
    { icon: Mail, title: "Manage Inquiries", desc: "When tenants express interest, their inquiries appear in your dashboard. Review each inquiry and respond promptly to qualified applicants." },
    { icon: FileText, title: "Finalize the Lease", desc: "Once you've selected a tenant, work with HANO to complete the Housing Assistance Payment (HAP) contract and lease agreement." },
  ],
};

const faqs = [
  { q: "What is an Entity ID and where do I get one?", a: "An Entity ID is a unique identifier assigned by the Housing Authority of New Orleans (HANO). If you don't have one, contact HANO directly at (504) 670-3300 or visit their office." },
  { q: "Is this website free to use?", a: "Yes. Housing Choice Connect is completely free for both tenants and landlords. It is provided as a service by HANO to streamline the housing voucher process." },
  { q: "Do all listed properties accept Housing Choice Vouchers?", a: "Not necessarily. Each listing indicates whether the landlord accepts vouchers. You can filter listings to show only voucher-friendly properties." },
  { q: "How long does it take for a landlord to respond?", a: "Response times vary by landlord. Most respond within 1–3 business days. If you haven't heard back, consider reaching out to other listings as well." },
  { q: "Can I list multiple properties?", a: "Absolutely. Landlords can list as many properties as they manage. Each property gets its own listing page with separate inquiry tracking." },
  { q: "What happens after a tenant and landlord agree?", a: "HANO coordinates an inspection of the property. Once it passes, HANO executes the HAP contract, and the tenant can move in." },
];

const StepCard = ({ step, index }: { step: typeof steps.tenant[0]; index: number }) => (
  <div className="flex gap-4 items-start">
    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center relative">
      <step.icon className="h-5 w-5 text-primary" />
      <span className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>
    </div>
    <div>
      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary/5 border-b py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            How to Use Housing Choice Connect
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Whether you're a tenant searching for housing or a landlord listing a property,
            this guide walks you through every step of the process.
          </p>
        </div>
      </section>

      {/* Guides */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <Tabs defaultValue="tenant" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-10">
            <TabsTrigger value="tenant" className="gap-2">
              <Users className="h-4 w-4" /> Tenant Guide
            </TabsTrigger>
            <TabsTrigger value="landlord" className="gap-2">
              <Building2 className="h-4 w-4" /> Landlord Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tenant">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Key className="h-5 w-5 text-primary" />
                  Tenant Step-by-Step Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {steps.tenant.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link to="/register">
                    <Button className="gap-2">
                      Create Your Account <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/listings">
                    <Button variant="outline" className="gap-2">
                      Browse Listings <Search className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="landlord">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Shield className="h-5 w-5 text-primary" />
                  Landlord Step-by-Step Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {steps.landlord.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link to="/register">
                    <Button className="gap-2">
                      Register as Landlord <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" className="gap-2">
                      Contact HANO <Phone className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 border-t py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
