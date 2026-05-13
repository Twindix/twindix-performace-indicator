import { useCallback, useEffect, useRef, useState } from "react";

import type { PaginatedResponseInterface, PaginationMetaInterface } from "@/interfaces";
import { type RunActionOptions, runAction } from "@/lib/handle-action";

export interface UsePaginatedQueryOptions extends RunActionOptions {
    enabled?: boolean;
    initialPage?: number;
    initialPerPage?: number;
}

export interface UsePaginatedQueryResult<T> {
    items: T[];
    meta: PaginationMetaInterface | null;
    page: number;
    perPage: number;
    isLoading: boolean;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    refetch: () => Promise<PaginatedResponseInterface<T> | null>;
    setItems: (updater: T[] | ((prev: T[]) => T[])) => void;
}

export const usePaginatedQuery = <T>(
    fn: (params: { page: number; per_page: number }) => Promise<PaginatedResponseInterface<T>>,
    deps: ReadonlyArray<unknown>,
    options: UsePaginatedQueryOptions = {},
): UsePaginatedQueryResult<T> => {
    const { enabled = true, initialPage = 1, initialPerPage = 20, ...runOptions } = options;

    const [page, setPageState] = useState(initialPage);
    const [perPage, setPerPageState] = useState(initialPerPage);
    const [items, setItemsState] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginationMetaInterface | null>(null);
    const [isLoading, setIsLoading] = useState(enabled);

    const fnRef = useRef(fn);
    fnRef.current = fn;

    // Append items only when the user *advances forward by one page* — i.e. the
    // explicit "Load more" path. Any other transition (page reset, filter change,
    // direct refetch on the same page) replaces. Tracking this in a ref avoids
    // an infinite loop while still letting the refetch callback observe intent.
    const expectAppendRef = useRef(false);
    const prevPageRef = useRef(page);

    // Stable runOption primitives (we only depend on these, not the whole object).
    const errorFallback = runOptions.errorFallback;
    const silent = runOptions.silent;
    const context = runOptions.context;

    const refetch = useCallback(async (): Promise<PaginatedResponseInterface<T> | null> => {
        if (!enabled) {
            setIsLoading(false);
            return null;
        }
        setIsLoading(true);
        const shouldAppend = expectAppendRef.current;
        expectAppendRef.current = false;
        try {
            const result = await runAction(
                () => fnRef.current({ page, per_page: perPage }),
                { errorFallback, silent, context },
            );
            if (result) {
                const incoming = result.data ?? [];
                setItemsState((prev) => (shouldAppend ? [...prev, ...incoming] : incoming));
                setMeta(result.meta ?? null);
            }
            return result;
        } finally {
            setIsLoading(false);
        }
    }, [enabled, page, perPage, errorFallback, silent, context]);

    // Single source of truth for "when do we fetch":
    //   • On mount when enabled.
    //   • When `deps` change → reset to page 1 (one state set; the dep update reruns this effect).
    //   • When `page` / `perPage` change → fetch with the new params.
    //
    // Merging both responsibilities into one effect prevents the old "double-fetch on
    // filter change" race where a stale page would fire alongside the reset.
    const isFirstRunRef = useRef(true);
    const lastDepsRef = useRef<ReadonlyArray<unknown>>(deps);

    useEffect(() => {
        const depsChanged = !isFirstRunRef.current && deps.some((d, i) => d !== lastDepsRef.current[i]);
        lastDepsRef.current = deps;
        isFirstRunRef.current = false;

        if (depsChanged && page !== 1) {
            // Reset to page 1 — this same effect will re-fire with the new page and fetch.
            expectAppendRef.current = false;
            setPageState(1);
            return;
        }

        refetch();
        prevPageRef.current = page;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, page, perPage]);

    const setPage = useCallback((next: number) => {
        setPageState((prev) => {
            const clamped = Math.max(1, next);
            if (clamped === prev) return prev;
            // Mark "append" intent only when advancing forward by exactly one page.
            expectAppendRef.current = clamped === prev + 1 && clamped > 1;
            return clamped;
        });
    }, []);

    const setPerPage = useCallback((next: number) => {
        setPerPageState((prev) => {
            if (next === prev) return prev;
            expectAppendRef.current = false;
            setPageState(1);
            return Math.max(1, next);
        });
    }, []);

    const setItems = useCallback((updater: T[] | ((prev: T[]) => T[])) => {
        setItemsState((prev) => (typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater));
    }, []);

    return { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems };
};
