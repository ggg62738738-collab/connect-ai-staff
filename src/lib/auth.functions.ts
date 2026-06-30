import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SessionInfo = {
  userId: string;
  email: string | null;
  profile: { full_name: string | null; avatar_url: string | null; headline: string | null } | null;
  roles: Array<"admin" | "recruiter" | "freelancer" | "company">;
};

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SessionInfo> => {
    const { supabase, userId, claims } = context;
    const [{ data: profile }, { data: rolesRaw }] = await Promise.all([
      supabase.from("profiles").select("full_name, avatar_url, headline").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roles = (rolesRaw ?? []).map((r) => r.role) as SessionInfo["roles"];
    return {
      userId,
      email: (claims.email as string | undefined) ?? null,
      profile: profile ?? null,
      roles,
    };
  });

/**
 * One-shot bootstrap: if no admin exists yet, grant admin to the caller.
 * After the first admin is set, this becomes a no-op.
 */
export const claimAdminIfFirst = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false, reason: "Admin already exists" as const };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { granted: true } as const;
  });