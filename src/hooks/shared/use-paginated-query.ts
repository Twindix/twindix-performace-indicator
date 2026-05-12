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

    const isFirstRunRef = useRef(true);

    const refetch = useCallback(async (): Promise<PaginatedResponseInterface<T> | null> => {
        if (!enabled) {
            setIsLoading(false);
            return null;
        }
        setIsLoading(true);
        try {
            const result = await runAction(() => fnRef.current({ page, per_page: perPage }), runOptions);
            if (result) {
                const incomingPage = result.meta?.current_page ?? page;
                setItemsState((prev) => (incomingPage <= 1 ? (result.data ?? []) : [...prev, ...(result.data ?? [])]));
                setMeta(result.meta ?? null);
            }
            return result;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, page, perPage, runOptions.errorFallback, runOptions.silent, runOptions.context]);

    // Reset to page 1 whenever upstream filter deps change (but not on the first run).
    useEffect(() => {
        if (isFirstRunRef.current) {
            isFirstRunRef.current = false;
            return;
        }
        setPageState(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, page, perPage]);

    const setPage = useCallback((next: number) => {
        setPageState((prev) => (next === prev ? prev : Math.max(1, next)));
    }, []);

    const setPerPage = useCallback((next: number) => {
        setPerPageState((prev) => {
            if (next === prev) return prev;
            setPageState(1);
            return Math.max(1, next);
        });
    }, []);

    const setItems = useCallback((updater: T[] | ((prev: T[]) => T[])) => {
        setItemsState((prev) => (typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater));
    }, []);

    return { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems };
};
