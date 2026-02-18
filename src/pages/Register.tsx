import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Home, ArrowLeft } from "lucide-react";
import { z } from "zod";

type AccountType = "tenant" | "landlord";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
  entityId: z.string().trim().min(3, "Entity ID must be at least 3 characters").max(50, "Entity ID must be less than 50 characters").regex(/^[A-Za-z0-9\-_]+$/, "Entity ID must contain only letters, numbers, hyphens, or underscores"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone number is too long").regex(/^$|^\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/, "Please enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be less than 72 characters"),
});

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("tenant");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse({ fullName, entityId, email, phone, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const validated = result.data;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        entity_id: validated.entityId,
        account_type: accountType,
        full_name: validated.fullName,
        phone: validated.phone || null,
      });

      if (profileError) {
        setLoading(false);
        toast({ title: "Profile creation failed", description: profileError.message, variant: "destructive" });
        return;
      }
    }

    setLoading(false);
    toast({ title: "Account created!", description: "Please check your email to verify your account before signing in." });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="bg-card rounded-lg border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-foreground">Create Account</h1>
              <p className="text-sm text-muted-foreground">Housing Choice Connect</p>
            </div>
          </div>

          {/* Account type selector */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("tenant")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                accountType === "tenant"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              I'm a Tenant
            </button>
            <button
              type="button"
              onClick={() => setAccountType("landlord")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                accountType === "landlord"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              I'm a Landlord
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Doe" maxLength={100} />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <Label htmlFor="entityId">Entity ID <span className="text-destructive">*</span></Label>
              <Input id="entityId" value={entityId} onChange={e => setEntityId(e.target.value)} required placeholder="Enter your Entity ID" maxLength={50} />
              <p className="text-xs text-muted-foreground mt-1">Required for account creation. Contact HANO if you don't have one.</p>
              {errors.entityId && <p className="text-xs text-destructive mt-1">{errors.entityId}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" maxLength={255} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(504) 555-0123" maxLength={20} />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters" maxLength={72} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : `Create ${accountType === "tenant" ? "Tenant" : "Landlord"} Account`}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
