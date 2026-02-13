import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Contact HANO</h1>
          <p className="text-muted-foreground mb-10">
            Housing Authority of New Orleans — reach out for assistance with the Housing Choice Voucher Program.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h3 className="font-serif font-semibold text-foreground text-lg">Administrative Office</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  1555 Poydras St, New Orleans, LA 70112
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href="tel:504-670-3300" className="hover:text-foreground transition-colors">(504) 670-3300</a>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span>TTY: <a href="tel:504-670-3377" className="hover:text-foreground transition-colors">(504) 670-3377</a></span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a href="mailto:info@hano.org" className="hover:text-foreground transition-colors">info@hano.org</a>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                  Mon - Fri: 8:00am to 5:00pm
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h3 className="font-serif font-semibold text-foreground text-lg">Client Services Center</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  10001 Lake Forest Blvd, New Orleans, LA 70127
                </p>
              </div>
              <h3 className="font-serif font-semibold text-foreground text-lg pt-2">Fast Track Center</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  1899 Rousseau St, New Orleans, LA 70130
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-serif font-semibold text-foreground text-lg mb-4">HANO Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Apply for Housing", url: "https://hano.myhousing.com/" },
                { label: "Housing Choice Voucher Program", url: "https://www.hano.org/housing-choice-voucher-program/" },
                { label: "Become a Landlord", url: "https://www.hano.org/become-a-landlord/" },
                { label: "Landlord Portal", url: "https://legacy.hano.org/PartnerPortal/View/Security/Login.aspx" },
                { label: "HCVP Phone Directory", url: "https://www.hano.org/residents/hcvp-phone-directory/" },
                { label: "HANO Website", url: "https://www.hano.org" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <span className="text-foreground font-medium">{link.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
