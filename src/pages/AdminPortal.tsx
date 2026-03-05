import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Shield, Users, Building2, MessageSquare, Loader2, Trash2, Eye, EyeOff, Search,
} from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

type TabId = "users" | "properties" | "inquiries";

const AdminPortal = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check admin role
  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data, error }) => {
      if (error || !data) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
    });
  }, [user]);

  // Fetch data when admin confirmed
  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
    ]).then(([profilesRes, propertiesRes, inquiriesRes]) => {
      setProfiles(profilesRes.data || []);
      setProperties(propertiesRes.data || []);
      setInquiries(inquiriesRes.data || []);
      setLoading(false);
    });
  }, [isAdmin]);

  const handleDeleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProperties(prev => prev.filter(p => p.id !== id));
      toast({ title: "Property deleted" });
    }
  };

  const handleTogglePropertyAvailability = async (id: string, currentValue: boolean) => {
    const { error } = await supabase.from("properties").update({ is_available: !currentValue }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, is_available: !currentValue } : p));
      toast({ title: `Property ${!currentValue ? "enabled" : "disabled"}` });
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setInquiries(prev => prev.filter(i => i.id !== id));
      toast({ title: "Inquiry deleted" });
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have administrator privileges.</p>
          <Button className="mt-6" onClick={() => navigate("/")}>Go Home</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" />, count: profiles.length },
    { id: "properties", label: "Properties", icon: <Building2 className="h-4 w-4" />, count: properties.length },
    { id: "inquiries", label: "Inquiries", icon: <MessageSquare className="h-4 w-4" />, count: inquiries.length },
  ];

  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.entity_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredProperties = properties.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInquiries = inquiries.filter(i =>
    i.tenant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.tenant_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Admin Portal</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage users, properties, and inquiries across the platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSearchQuery(""); }}
              className={`rounded-lg border p-4 text-left transition-all ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                {t.icon} {t.label}
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : t.count}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            {/* Users Tab */}
            {activeTab === "users" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                  ) : filteredProfiles.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name}</TableCell>
                      <TableCell>
                        <Badge variant={p.account_type === "landlord" ? "default" : "secondary"} className="capitalize">
                          {p.account_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">{p.entity_id}</TableCell>
                      <TableCell className="text-muted-foreground">{p.phone || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Properties Tab */}
            {activeTab === "properties" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vouchers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No properties found</TableCell></TableRow>
                  ) : filteredProperties.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">{p.address}, {p.city}</TableCell>
                      <TableCell>${p.price?.toLocaleString()}/mo</TableCell>
                      <TableCell>
                        <Badge variant={p.is_available ? "default" : "secondary"}>
                          {p.is_available ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.accepts_vouchers ? "outline" : "secondary"}>
                          {p.accepts_vouchers ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => handleTogglePropertyAvailability(p.id, p.is_available)}
                            title={p.is_available ? "Disable listing" : "Enable listing"}
                          >
                            {p.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProperty(p.id)}
                            title="Delete property"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Inquiries Tab */}
            {activeTab === "inquiries" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Read</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No inquiries found</TableCell></TableRow>
                  ) : filteredInquiries.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.tenant_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{i.tenant_email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[250px] truncate">{i.message}</TableCell>
                      <TableCell>
                        <Badge variant={i.is_read ? "secondary" : "default"}>
                          {i.is_read ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(i.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteInquiry(i.id)}
                          title="Delete inquiry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPortal;
