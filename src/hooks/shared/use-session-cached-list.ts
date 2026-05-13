import { useCallback, useEffect, useState } from "react";

import { runAction } from "@/lib/handle-action";

/**
 * Cross-mount cached list fetcher.
 *
 * Use for small "lookup table" endpoints (users-lite, teams-lite, projects-lite)
 * that don't change often and are needed by multiple views. The fetch happens
 * once per session per `key`; subsequent mounts read from the shared cache.
 * Calls to `refetch` clear the cache and re-fetch — all mounted subscribers
 * receive the new data.
 *
 *   const { data, isLoading, refetch } = useSessionCachedList("users.lite", () => ..., {
 *       errorFallback: "Failed to load users",
 *       context: "users.listLite",
 *   });
 */

interface CacheEntry {
    data: unknown[] | null;
    inflight: Promise<unknown[]> | null;
}

const cache = new Map<string, CacheEntry>();
const subscribers = new Map<string, Set<() => void>>();

const notify = (key: string) => {
    subscribers.get(key)?.forEach((fn) => fn());
};

const ensureEntry = (key: string): CacheEntry => {
    let entry = cache.get(key);
    if (!entry) {
        entry = { data: null, inflight: null };
        cache.set(key, entry);
    }
    return entry;
};

export interface UseSessionCachedListOptions {
    errorFallback?: string;
    silent?: boolean;
    context?: string;
}

export function useSessionCachedList<T>(
    key: string,
    fetcher: () => Promise<T[]>,
    options: UseSessionCachedListOptions = {},
) {
    const [, forceTick] = useState(0);

    // Subscribe to cache updates for this key so mutations elsewhere re-render us.
    useEffect(() => {
        let set = subscribers.get(key);
        if (!set) {
            set = new Set();
            subscribers.set(key, set);
        }
        const onChange = () => forceTick((n) => n + 1);
        set.add(onChange);
        return () => {
            set!.delete(onChange);
        };
    }, [key]);

    // Kick off the fetch if needed (cache miss and nothing in flight).
    useEffect(() => {
        const entry = ensureEntry(key);
        if (entry.data !== null || entry.inflight) return;

        const promise = runAction(() => fetcher(), options)
            .then((result) => (result ?? []) as unknown[]);
        entry.inflight = promise;
        promise
            .then((data) => {
                entry.data = data;
                entry.inflight = null;
                notify(key);
            })
            .catch(() => {
                entry.inflight = null;
                notify(key);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const entry = cache.get(key);
    const data = (entry?.data as T[] | null) ?? [];
    const isLoading = !entry?.data && !!entry?.inflight;

    const refetch = useCallback(() => {
        const entry = ensureEntry(key);
        entry.data = null;
        const promise = runAction(() => fetcher(), options)
            .then((result) => (result ?? []) as unknown[]);
        entry.inflight = promise;
        notify(key);
        promise
            .then((next) => {
                entry.data = next;
                entry.inflight = null;
                notify(key);
            })
            .catch(() => {
                entry.inflight = null;
                notify(key);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { data, isLoading, refetch };
}

/** Invalidate a cached list. Call from mutation hooks after create/update/delete. */
export const invalidateSessionCachedList = (key: string) => {
    const entry = cache.get(key);
    if (!entry) return;
    entry.data = null;
    entry.inflight = null;
    notify(key);
};
