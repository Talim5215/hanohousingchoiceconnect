import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, full_name } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      // If user already exists, look them up
      if (createError.message.includes("already been registered")) {
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        const existingUser = users.find((u: any) => u.email === email);
        if (!existingUser) throw new Error("Could not find existing user");

        // Ensure profile exists
        await supabaseAdmin.from("profiles").upsert({
          user_id: existingUser.id,
          full_name: full_name || "Admin",
          account_type: "landlord",
          entity_id: "ADMIN",
        }, { onConflict: "user_id" });

        // Assign admin role
        await supabaseAdmin.from("user_roles").upsert({
          user_id: existingUser.id,
          role: "admin",
        }, { onConflict: "user_id,role" });

        return new Response(JSON.stringify({ success: true, user_id: existingUser.id, note: "existing user promoted to admin" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw createError;
    }

    const userId = userData.user.id;

    // Create profile
    await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      full_name: full_name || "Admin",
      account_type: "landlord",
      entity_id: "ADMIN",
    }, { onConflict: "user_id" });

    // Assign admin role
    await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "admin",
    });

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
