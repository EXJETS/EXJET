"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api, ApiError, type Me } from "@/lib/api";
import { useApi } from "./use-api";

interface MeCtx {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setMe: (m: Me | null) => void;
}
const Ctx = createContext<MeCtx | null>(null);

async function fetchMe(): Promise<Me | null> {
  try {
    return await api.me();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

export function MeProvider({ children }: { children: React.ReactNode }) {
  const q = useApi<Me | null>("me", fetchMe);
  const [override, setOverride] = useState<{ v: Me | null } | undefined>();

  const refresh = useCallback(async () => {
    try {
      setOverride({ v: await fetchMe() });
    } catch {
      /* keep the current value; the next navigation retries */
    }
  }, []);
  const setMe = useCallback((m: Me | null) => setOverride({ v: m }), []);

  const me = override ? override.v : (q.data ?? null);
  const loading = !override && q.data === undefined && !q.error;
  const value = useMemo(() => ({ me, loading, refresh, setMe }), [me, loading, refresh, setMe]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMe(): MeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMe outside MeProvider");
  return v;
}
