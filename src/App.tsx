import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import PropertyDetail from "./pages/PropertyDetail";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Communities from "./pages/Communities";
import HowItWorks from "./pages/HowItWorks";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";
import MobileBottomNav from "./components/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<PropertyDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileBottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
