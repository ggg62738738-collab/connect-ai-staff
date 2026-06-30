import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SessionInfo = {
  userId: string;
  email: string | null;
  profile: { full_name: string | null; avatar_url: string | null; headline: string | null } | null;
  roles: Array<"admin" | "recruiter" | "freelancer" | "company">;
};

type PortalRole = SessionInfo["roles"][number];

function safeDefaultRole(claims: Record<string, unknown>): PortalRole {
  const metadata = (claims.user_metadata ?? claims.app_metadata ?? {}) as Record<string, unknown>;
  const requested = metadata.role;
  return requested === "company" || requested === "freelancer" ? requested : "freelancer";
}

function claimEmail(claims: Record<string, unknown>) {
  return typeof claims.email === "string" ? claims.email : null;
}

function claimFullName(claims: Record<string, unknown>) {
  const metadata = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = metadata.full_name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  const email = claimEmail(claims);
  return email ? email.split("@")[0] : null;
}

async function ensureCurrentUserRows(userId: string, claims: Record<string, unknown>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = claimEmail(claims);
  const fullName = claimFullName(claims);

  await supabaseAdmin.from("profiles").upsert(
    { id: userId, email: email ?? "", full_name: fullName },
    { onConflict: "id", ignoreDuplicates: false },
  );

  const { data: existingRoles, error: rolesError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (rolesError) throw new Error(rolesError.message);

  let roles = ((existingRoles ?? []).map((r) => r.role).filter(Boolean) as PortalRole[]);
  if (!roles.length) {
    const role = safeDefaultRole(claims);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
    if (error) throw new Error(error.message);
    roles = [role];
  }

  if (roles.includes("freelancer")) {
    await supabaseAdmin
      .from("freelancer_profiles")
      .upsert({ user_id: userId, status: "pending" }, { onConflict: "user_id", ignoreDuplicates: true });
  }

  return { supabaseAdmin, roles };
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SessionInfo> => {
    const { userId, claims } = context;
    const { supabaseAdmin, roles } = await ensureCurrentUserRows(userId, claims as Record<string, unknown>);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name, avatar_url, headline")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);
    return {
      userId,
      email: claimEmail(claims as Record<string, unknown>),
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