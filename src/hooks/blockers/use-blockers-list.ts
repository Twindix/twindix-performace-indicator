import { useCallback } from "react";

import { blockersConstants } from "@/constants";
import type { BlockerInterface, BlockersAnalyticsInterface } from "@/interfaces";
import { blockersService } from "@/services";

import { usePaginatedQuery, useQueryAction } from "../shared";

interface UseBlockersListOptions {
    status?: string;
    type?: string;
    severity?: string;
    reporter?: string;
    owner?: string;
    initialPerPage?: number;
}

export const useBlockersList = (sprintId: string, options: UseBlockersListOptions = {}) => {
    const { status, type, severity, reporter, owner, initialPerPage } = options;

    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<BlockerInterface>(
        ({ page, per_page }) => blockersService.listHandler(sprintId, { status, type, severity, reporter, owner, page, per_page }),
        [sprintId, status, type, severity, reporter, owner],
        {
            enabled: !!sprintId,
            errorFallback: blockersConstants.errors.fetchFailed,
            context: "blockers.list",
            initialPerPage,
        },
    );

    const { data: analytics, refetch: refetchAnalytics } = useQueryAction<BlockersAnalyticsInterface | null>(
        async () => (sprintId ? await blockersService.analyticsHandler(sprintId) : null),
        [sprintId],
        {
            enabled: !!sprintId,
            errorFallback: blockersConstants.errors.analyticsFailed,
            initialData: null,
            context: "blockers.analytics",
        },
    );

    const patchBlockerLocal = useCallback((blocker: BlockerInterface) => {
        setItems((prev) => {
            const exists = prev.some((b) => b.id === blocker.id);
            return exists ? prev.map((b) => (b.id === blocker.id ? blocker : b)) : [blocker, ...prev];
        });
    }, [setItems]);

    const removeBlockerLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((b) => b.id !== id));
    }, [setItems]);

    return {
        blockers: items,
        meta,
        page,
        perPage,
        analytics: analytics ?? null,
        isLoading,
        setPage,
        setPerPage,
        refetch,
        refetchAnalytics,
        patchBlockerLocal,
        removeBlockerLocal,
    };
};
