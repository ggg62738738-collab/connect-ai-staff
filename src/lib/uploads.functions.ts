import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Route each upload "kind" to the right bucket.
// - avatar               -> avatars
// - resume, cover-letter -> resumes
// - everything else      -> verification-docs
function bucketFor(kind: string): "avatars" | "resumes" | "verification-docs" {
  if (kind === "avatar" || kind === "photo") return "avatars";
  if (kind === "resume" || kind === "cover-letter" || kind === "coverletter") return "resumes";
  return "verification-docs";
}

/**
 * Creates a short-lived signed upload URL scoped to the caller's folder.
 * The client then uploads with `uploadToSignedUrl(path, token, file)`.
 */
export const createTalentUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filename: string; kind: string }) => d)
  .handler(async ({ data, context }) => {
    const bucket = bucketFor(data.kind);
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${context.userId}/${data.kind}/${Date.now()}_${safe}`;
    const { data: signed, error } = await (context.supabase.storage as any)
      .from(bucket)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { bucket, path, token: signed.token, signedUrl: signed.signedUrl };
  });

/** Returns a short-lived signed download URL for the caller's own file. */
export const getTalentFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket?: string; path: string }) => d)
  .handler(async ({ data, context }) => {
    // infer bucket from stored path prefix if not provided (legacy paths)
    const bucket = (data.bucket as any) ?? guessBucketFromPath(data.path);
    const { data: signed, error } = await context.supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 60 * 60);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl, bucket };
  });

function guessBucketFromPath(path: string): "avatars" | "resumes" | "verification-docs" {
  if (path.includes("/avatar/") || path.includes("/photo/")) return "avatars";
  if (path.includes("/resume/") || path.includes("/cover-letter/")) return "resumes";
  return "verification-docs";
}
