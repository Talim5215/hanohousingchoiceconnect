import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const EDGE_FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/get-signed-image-urls`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Resolve an array of raw storage paths/old public-URLs to signed URLs.
 *  Falls back to /placeholder.svg for any that fail. */
export function useSignedImageUrls(rawPaths: (string | null)[] | null | undefined) {
  const paths = (rawPaths ?? []).filter(Boolean) as string[];
  const key = paths.join("|");

  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const resolve = useCallback(async () => {
    if (paths.length === 0) {
      setSignedUrls([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(EDGE_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({ paths }),
      });
      if (!res.ok) throw new Error("Edge fn error");
      const { urls } = await res.json();
      setSignedUrls(
        (urls as { path: string; signedUrl: string | null }[]).map(
          (u) => u.signedUrl ?? "/placeholder.svg"
        )
      );
    } catch {
      setSignedUrls(paths.map(() => "/placeholder.svg"));
    } finally {
      setLoading(false);
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    resolve();
  }, [resolve]);

  return { signedUrls, loading };
}

/** Generate a signed URL for the landlord's own image (for Dashboard previews).
 *  Uses the authenticated Supabase client so it works within the owner's session. */
export async function getOwnerSignedUrl(path: string): Promise<string> {
  // Strip full URL down to storage path if already stored as public URL
  const storagePath = path.includes("/storage/v1/object/")
    ? path.split("/storage/v1/object/public/property-images/")[1] ?? path
    : path;

  const { data, error } = await supabase.storage
    .from("property-images")
    .createSignedUrl(storagePath, 3600);

  if (error || !data?.signedUrl) return "/placeholder.svg";
  return data.signedUrl;
}
