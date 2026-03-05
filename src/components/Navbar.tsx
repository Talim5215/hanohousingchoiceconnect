import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, LogOut, User, Settings, Shield } from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

const Navbar = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<{ account_type: string; full_name: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("account_type, full_name").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        setProfile(data);
      });
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        setIsAdmin(!!data);
      });
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary flex items-center justify-center">
              <Home className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="font-serif font-bold text-foreground text-base sm:text-lg">Housing Choice</span>
              <span className="block text-xs text-muted-foreground -mt-0.5">Connect</span>
            </div>
          </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse Listings
          </Link>
          <Link to="/communities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Communities
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact HANO
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {profile?.account_type === "landlord" && (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              )}
              <Link to="/account" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <User className="h-4 w-4" />
                <span>{profile?.full_name || "User"}</span>
              </Link>
              <Link to="/account">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-b p-4 space-y-3">
          <Link to="/listings" className="block text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>Browse Listings</Link>
          <Link to="/communities" className="block text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>Communities</Link>
          <Link to="/how-it-works" className="block text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link to="/contact" className="block text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>Contact HANO</Link>
          {user ? (
            <>
              {profile?.account_type === "landlord" && (
                <Link to="/dashboard" className="block" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                </Link>
              )}
              <Link to="/account" className="block" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Account Settings</Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" className="block" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
