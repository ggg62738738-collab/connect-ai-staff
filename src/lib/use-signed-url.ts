import { useEffect, useRef, useState } from "react";
import { getTalentFileUrl } from "@/lib/uploads.functions";

// Simple in-memory cache so the same storage path doesn't re-sign on every render
const cache = new Map<string, { url: string; expires: number }>();
const TTL_MS = 55 * 60 * 1000; // signed URLs live ~1h; refresh a bit before

export function useSignedFileUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(() => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const hit = cache.get(path);
    return hit && hit.expires > Date.now() ? hit.url : null;
  });
  const [loading, setLoading] = useState(false);
  const currentPath = useRef<string | null | undefined>(path);

  useEffect(() => {
    currentPath.current = path;
    if (!path) { setUrl(null); return; }
    // Already a full URL — no need to sign
    if (/^https?:\/\//i.test(path)) { setUrl(path); return; }
    const hit = cache.get(path);
    if (hit && hit.expires > Date.now()) { setUrl(hit.url); return; }
    let cancelled = false;
    setLoading(true);
    getTalentFileUrl({ data: { path } })
      .then((res) => {
        if (cancelled || currentPath.current !== path) return;
        cache.set(path, { url: res.url, expires: Date.now() + TTL_MS });
        setUrl(res.url);
      })
      .catch(() => { if (!cancelled) setUrl(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path]);

  return { url, loading };
}
