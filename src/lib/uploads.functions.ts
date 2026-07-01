import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Creates a short-lived signed upload URL scoped to the caller's folder in the
 * private `talent-uploads` bucket. The client then PUTs the file to that URL.
 */
export const createTalentUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filename: string; kind: string }) => d)
  .handler(async ({ data, context }) => {
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${context.userId}/${data.kind}/${Date.now()}_${safe}`;
    const { data: signed, error } = await (context.supabase.storage as any)
      .from("talent-uploads")
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

/** Returns a short-lived signed download URL for the caller's own file. */
export const getTalentFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { path: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from("talent-uploads")
      .createSignedUrl(data.path, 60 * 60);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
