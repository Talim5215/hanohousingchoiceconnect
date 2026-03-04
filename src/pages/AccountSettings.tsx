import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFriendlyAuthError, getFriendlyDbError } from "@/lib/errorMessages";
import { User, Mail, Lock, Shield, Calendar, Hash, Phone, Save, Loader2, Trash2 } from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().max(20).regex(/^$|^\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/, "Invalid phone format").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(72),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

const AccountSettings = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    full_name: string;
    phone: string | null;
    account_type: string;
    entity_id: string;
    created_at: string;
  } | null>(null);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, account_type, entity_id, created_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setFullName(data.full_name);
          setPhone(data.phone || "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileErrors({});
    const result = profileSchema.safeParse({ fullName, phone });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(i => { const f = i.path[0] as string; if (!errs[f]) errs[f] = i.message; });
      setProfileErrors(errs);
      return;
    }
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: result.data.fullName, phone: result.data.phone || null })
      .eq("user_id", user.id);
    setSavingProfile(false);
    if (error) {
      toast({ title: "Error", description: getFriendlyDbError(error.message), variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setProfile(prev => prev ? { ...prev, full_name: result.data.fullName, phone: result.data.phone || null } : prev);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: window.location.origin }
    );
    setSavingEmail(false);
    if (error) {
      toast({ title: "Error", description: getFriendlyAuthError(error.message), variant: "destructive" });
    } else {
      toast({ title: "Confirmation sent", description: "Check both your old and new email to confirm the change." });
      setNewEmail("");
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(i => { const f = i.path[0] as string; if (!errs[f]) errs[f] = i.message; });
      setPasswordErrors(errs);
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: result.data.newPassword });
    setSavingPassword(false);
    if (error) {
      toast({ title: "Error", description: getFriendlyAuthError(error.message), variant: "destructive" });
    } else {
      toast({ title: "Password updated!" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    if (!user) return;
    setDeleting(true);
    // Delete profile (cascade will handle related data)
    const { error } = await supabase.from("profiles").delete().eq("user_id", user.id);
    if (error) {
      setDeleting(false);
      toast({ title: "Error", description: getFriendlyDbError(error.message), variant: "destructive" });
      return;
    }
    await supabase.auth.signOut();
    setDeleting(false);
    toast({ title: "Account deleted", description: "Your profile data has been removed." });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Account Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, email, and security</p>
        </div>

        {/* Account Overview */}
        <section className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="font-serif font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Account Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Account Type</p>
                <p className="font-medium text-foreground capitalize">{profile?.account_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Entity ID</p>
                <p className="font-medium text-foreground">{profile?.entity_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Edit Profile */}
        <section className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="font-serif font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="settingsName">Full Name</Label>
              <Input id="settingsName" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={100} placeholder="Your full name" />
              {profileErrors.fullName && <p className="text-xs text-destructive mt-1">{profileErrors.fullName}</p>}
            </div>
            <div>
              <Label htmlFor="settingsPhone">Phone</Label>
              <Input id="settingsPhone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} placeholder="(504) 555-0123" />
              {profileErrors.phone && <p className="text-xs text-destructive mt-1">{profileErrors.phone}</p>}
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </section>

        {/* Change Email */}
        <section className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="font-serif font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Change Email
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            A confirmation will be sent to both your current and new email address.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input id="currentEmail" value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="newEmail">New Email</Label>
              <Input id="newEmail" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="newemail@example.com" maxLength={255} />
            </div>
            <Button onClick={handleChangeEmail} disabled={savingEmail || !newEmail.trim()} variant="outline" className="gap-2">
              {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {savingEmail ? "Sending..." : "Update Email"}
            </Button>
          </div>
        </section>

        {/* Change Password */}
        <section className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="font-serif font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPw">New Password</Label>
              <Input id="newPw" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" maxLength={72} />
              {passwordErrors.newPassword && <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPw">Confirm Password</Label>
              <Input id="confirmPw" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" maxLength={72} />
              {passwordErrors.confirmPassword && <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword}</p>}
            </div>
            <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword} variant="outline" className="gap-2">
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card rounded-lg border border-destructive/20 p-6 mb-6">
          <h2 className="font-serif font-semibold text-destructive text-lg mb-2 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account removes your profile data. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-destructive/5 rounded-lg">
              <p className="text-sm font-medium text-foreground">Type <span className="font-bold text-destructive">DELETE</span> to confirm:</p>
              <Input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="max-w-xs"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSettings;