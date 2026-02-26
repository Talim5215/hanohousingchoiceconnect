import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Search, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    return () => subscription.unsubscribe();
  }, []);

  const accountTo = loggedIn ? "/dashboard" : "/login";

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/listings", icon: Search, label: "Listings" },
    { to: "/communities", icon: Building2, label: "Communities" },
    { to: accountTo, icon: User, label: "Account" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t safe-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={label}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors min-w-[56px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
export default MobileBottomNav;
