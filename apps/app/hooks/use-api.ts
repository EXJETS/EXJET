"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

export interface Query<T> {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => void;
}

function toApiError(e: unknown): ApiError {
  return e instanceof ApiError ? e : new ApiError(0, "unknown_error", e instanceof Error ? e.message : "Something went wrong.");
}

/**
 * Minimal data hook. `key` identifies the request (null disables it). Revalidation (reload / refreshMs) keeps
 * the previous data on screen, so there is no layout shift.
 */
export function useApi<T>(key: string | null, fetcher: () => Promise<T>, opts: { refreshMs?: number; poll?: (d: T) => boolean } = {}): Query<T> {
  const [state, setState] = useState<{ key: string | null; data?: T; error?: ApiError }>({ key: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fetcher);
  useEffect(() => {
    fnRef.current = fetcher;
  });
  const { refreshMs } = opts;
  const pollRef = useRef(opts.poll);
  const dataRef = useRef<T | undefined>(undefined);
  useEffect(() => {
    pollRef.current = opts.poll;
  });

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    dataRef.current = undefined;
    const run = () =>
      fnRef.current().then(
        (data) => {
          if (cancelled) return;
          dataRef.current = data;
          setState({ key, data });
        },
        (e) => !cancelled && setState((s) => ({ key, data: s.key === key ? s.data : undefined, error: toApiError(e) })),
      );
    void run();
    const tickFn = () => {
      if (pollRef.current && dataRef.current !== undefined && !pollRef.current(dataRef.current)) return;
      void run();
    };
    const id = refreshMs ? window.setInterval(tickFn, refreshMs) : undefined;
    return () => {
      cancelled = true;
      if (id) window.clearInterval(id);
    };
  }, [key, tick, refreshMs]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const current = state.key === key && key !== null;
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: key !== null && !current,
    reload,
  };
}

/** Async action helper with pending + error state, for aria-live status messages. */
export function useAction<A extends unknown[], R>(fn: (...a: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | undefined>();
  const run = useCallback(
    async (...a: A): Promise<R | undefined> => {
      setPending(true);
      setError(undefined);
      try {
        return await fn(...a);
      } catch (e) {
        setError(toApiError(e));
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [fn],
  );
  return { run, pending, error, clear: () => setError(undefined) };
}
