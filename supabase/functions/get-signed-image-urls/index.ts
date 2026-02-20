import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paths } = await req.json() as { paths: string[] };

    if (!Array.isArray(paths) || paths.length === 0) {
      return new Response(JSON.stringify({ urls: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize paths — only allow safe characters, no path traversal
    const safePaths = paths.filter(
      (p) => typeof p === "string" && /^[a-zA-Z0-9\-_./]+$/.test(p) && !p.includes("..")
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate signed URLs valid for 1 hour
    const ONE_HOUR = 3600;
    const results = await Promise.all(
      safePaths.map(async (path) => {
        // Extract just the storage path (strip full URL prefix if stored as public URL)
        const storagePath = path.includes("/storage/v1/object/")
          ? path.split("/storage/v1/object/public/property-images/")[1] ?? path
          : path;

        const { data, error } = await supabase.storage
          .from("property-images")
          .createSignedUrl(storagePath, ONE_HOUR);

        return { path, signedUrl: error ? null : data?.signedUrl ?? null };
      })
    );

    return new Response(JSON.stringify({ urls: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-signed-image-urls error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
