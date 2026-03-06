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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield, Users, Building2, MessageSquare, Loader2, Trash2, Eye, EyeOff, Search,
  AlertTriangle, UserX, CheckCircle, XCircle,
} from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

type TabId = "users" | "properties" | "inquiries";

const AdminPortal = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete user dialog
  const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean; profile: any | null }>({ open: false, profile: null });
  const [deleteUserConfirm, setDeleteUserConfirm] = useState("");
  const [deletingUser, setDeletingUser] = useState(false);

  // Delete property dialog
  const [deletePropertyDialog, setDeletePropertyDialog] = useState<{ open: boolean; property: any | null }>({ open: false, property: null });
  const [deletingProperty, setDeletingProperty] = useState(false);

  // Mark inquiry read/unread
  const [togglingInquiry, setTogglingInquiry] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data, error }) => {
      if (error || !data) { setIsAdmin(false); return; }
      setIsAdmin(true);
    });
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllData();
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoading(true);
    const [profilesRes, propertiesRes, inquiriesRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles(profilesRes.data || []);
    setProperties(propertiesRes.data || []);
    setInquiries(inquiriesRes.data || []);
    setLoading(false);
  };

  // ── Admin Actions ──

  const handleDeleteUser = async () => {
    const profile = deleteUserDialog.profile;
    if (!profile || deleteUserConfirm !== "DELETE") return;
    if (profile.user_id === user?.id) {
      toast({ title: "Error", description: "You cannot delete your own admin account.", variant: "destructive" });
      return;
    }
    setDeletingUser(true);
    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: profile.user_id },
    });
    setDeletingUser(false);
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || error?.message || "Failed to delete user", variant: "destructive" });
    } else {
      setProfiles(prev => prev.filter(p => p.user_id !== profile.user_id));
      setProperties(prev => prev.filter(p => p.landlord_id !== profile.user_id));
      setInquiries(prev => prev.filter(i => i.landlord_id !== profile.user_id));
      toast({ title: "User deleted", description: `${profile.full_name}'s account and all associated data have been removed.` });
    }
    setDeleteUserDialog({ open: false, profile: null });
    setDeleteUserConfirm("");
  };

  const handleDeleteProperty = async () => {
    const prop = deletePropertyDialog.property;
    if (!prop) return;
    setDeletingProperty(true);
    const { error } = await supabase.from("properties").delete().eq("id", prop.id);
    setDeletingProperty(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProperties(prev => prev.filter(p => p.id !== prop.id));
      toast({ title: "Property deleted" });
    }
    setDeletePropertyDialog({ open: false, property: null });
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

  const handleToggleInquiryRead = async (id: string, currentValue: boolean) => {
    setTogglingInquiry(id);
    const { error } = await supabase.from("inquiries").update({ is_read: !currentValue }).eq("id", id);
    setTogglingInquiry(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, is_read: !currentValue } : i));
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

  // ── Guards ──

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

  // ── Filters ──

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
          <div className="bg-card rounded-lg border overflow-x-auto">
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
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
                      <TableCell className="text-right">
                        {p.user_id === user?.id ? (
                          <span className="text-xs text-muted-foreground italic">You</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteUserDialog({ open: true, profile: p })}
                            title="Delete user account"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
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
                            onClick={() => setDeletePropertyDialog({ open: true, property: p })}
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
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No inquiries found</TableCell></TableRow>
                  ) : filteredInquiries.map(i => (
                    <TableRow key={i.id} className={!i.is_read ? "bg-primary/5" : ""}>
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
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => handleToggleInquiryRead(i.id, i.is_read)}
                            disabled={togglingInquiry === i.id}
                            title={i.is_read ? "Mark as unread" : "Mark as read"}
                          >
                            {i.is_read ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteInquiry(i.id)}
                            title="Delete inquiry"
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
          </div>
        )}
      </main>
      <Footer />

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteUserDialog.open} onOpenChange={open => {
        if (!open) { setDeleteUserDialog({ open: false, profile: null }); setDeleteUserConfirm(""); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete User Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete <span className="font-semibold text-foreground">{deleteUserDialog.profile?.full_name}</span>'s
              account, including all their properties, inquiries, and profile data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-foreground">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteUserConfirm}
              onChange={e => setDeleteUserConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="max-w-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteUserDialog({ open: false, profile: null }); setDeleteUserConfirm(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteUserConfirm !== "DELETE" || deletingUser}
              onClick={handleDeleteUser}
            >
              {deletingUser ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...</> : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Property Confirmation Dialog */}
      <Dialog open={deletePropertyDialog.open} onOpenChange={open => {
        if (!open) setDeletePropertyDialog({ open: false, property: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete Property
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deletePropertyDialog.property?.title}"</span>?
              This will also remove any inquiries associated with this property.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletePropertyDialog({ open: false, property: null })}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deletingProperty} onClick={handleDeleteProperty}>
              {deletingProperty ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...</> : "Delete Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortal;
