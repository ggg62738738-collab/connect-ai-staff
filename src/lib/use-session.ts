import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMe, type SessionInfo } from "@/lib/auth.functions";

const SESSION_QUERY_KEY = ["session", "me"] as const;

export function useSessionUser(): {
  loading: boolean;
  signedIn: boolean;
  user: SessionInfo | null;
} {
  const queryClient = useQueryClient();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED" && event !== "INITIAL_SESSION") return;
      setHasSession(!!session);
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(SESSION_QUERY_KEY, null);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const me = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => getMe(),
    enabled: hasSession === true,
    staleTime: 60_000,
    retry: false,
  });

  return {
    loading: hasSession === null || (hasSession === true && me.isLoading),
    signedIn: hasSession === true && !!me.data,
    user: me.data ?? null,
  };
}

export async function signOutAndClear(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
}