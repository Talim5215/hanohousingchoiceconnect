import { Link } from "react-router-dom";
import { Home, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                <Home className="h-4.5 w-4.5 text-secondary-foreground" />
              </div>
              <div className="leading-tight">
                <span className="font-serif font-bold text-lg">Housing Choice</span>
                <span className="block text-xs opacity-70 -mt-0.5">Connect</span>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Connecting tenants with quality housing and landlords with reliable residents through the Housing Choice Voucher Program.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-70">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/listings" className="opacity-80 hover:opacity-100 transition-opacity">Browse Listings</Link></li>
              <li><Link to="/register" className="opacity-80 hover:opacity-100 transition-opacity">Create Account</Link></li>
              <li><Link to="/contact" className="opacity-80 hover:opacity-100 transition-opacity">Contact HANO</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-70">HANO Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.hano.org/housing-choice-voucher-program/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">HCVP Program</a></li>
              <li><a href="https://www.hano.org/become-a-landlord/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">Become a Landlord</a></li>
              <li><a href="https://hano.myhousing.com/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">Apply for Housing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-70">HANO Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />
                <span className="opacity-80">1555 Poydras St, New Orleans, LA 70112</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 opacity-70" />
                <a href="tel:504-670-3300" className="opacity-80 hover:opacity-100 transition-opacity">(504) 670-3300</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 opacity-70" />
                <a href="mailto:info@hano.org" className="opacity-80 hover:opacity-100 transition-opacity">info@hano.org</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Housing Choice Connect. Mon - Fri: 8:00am to 5:00pm.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
