import { useCallback, useEffect, useState } from "react";

import type { SprintInterface } from "@/interfaces";
import { projectsService } from "@/services";

/**
 * Cached reader for a project's sprints.
 *
 * Used by the topbar dropdown and by callers that just need to read sprints
 * for the active project. `useAppInit` seeds the cache on cold start so the
 * topbar doesn't refetch the same list. Sprint mutations
 * (create/update/delete/activate) invalidate the cache so the next read fetches
 * fresh. TTL = 60s as a backstop.
 */

interface CacheEntry {
    projectId: string;
    sprints: SprintInterface[];
    at: number;
}

const TTL_MS = 60_000;

let cache: CacheEntry | null = null;
let inflight: Promise<SprintInterface[]> | null = null;
const subscribers = new Set<() => void>();

const notify = () => subscribers.forEach((fn) => fn());

const isFresh = (projectId: string): boolean =>
    cache !== null && cache.projectId === projectId && Date.now() - cache.at < TTL_MS;

/** Seed the cache from outside (e.g. `useAppInit` already fetched these sprints). */
export const seedProjectSprintsCache = (projectId: string, sprints: SprintInterface[]) => {
    cache = { projectId, sprints, at: Date.now() };
    notify();
};

/** Drop the cache so the next read fetches fresh. Call after sprint mutations. */
export const invalidateProjectSprintsCache = () => {
    cache = null;
    inflight = null;
    notify();
};

export const useProjectSprints = (projectId: string | null | undefined) => {
    const [, forceTick] = useState(0);

    useEffect(() => {
        const onChange = () => forceTick((n) => n + 1);
        subscribers.add(onChange);
        return () => {
            subscribers.delete(onChange);
        };
    }, []);

    useEffect(() => {
        if (!projectId) return;
        if (isFresh(projectId)) return;
        if (inflight) return;

        inflight = projectsService.sprintsHandler(projectId)
            .then((arr) => {
                cache = { projectId, sprints: arr, at: Date.now() };
                inflight = null;
                notify();
                return arr;
            })
            .catch((err) => {
                inflight = null;
                notify();
                throw err;
            });
    }, [projectId]);

    const sprints = projectId && isFresh(projectId) ? cache!.sprints : [];
    const isLoading = !!projectId && !isFresh(projectId);

    const refetch = useCallback(() => {
        invalidateProjectSprintsCache();
    }, []);

    return { sprints, isLoading, refetch };
};
