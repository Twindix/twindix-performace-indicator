import { useCallback } from "react";

import { blockersConstants } from "@/constants";
import type { BlockerInterface, BlockersAnalyticsInterface } from "@/interfaces";
import { blockersService } from "@/services";

import { useQueryAction } from "../shared";

interface UseBlockersListOptions {
    status?: string;
    type?: string;
    severity?: string;
    reporter?: string;
    owner?: string;
    per_page?: number;
}

export const useBlockersList = (sprintId: string, options: UseBlockersListOptions = {}) => {
    const { status, type, severity, reporter, owner, per_page } = options;

    const {
        data: blockers,
        isLoading,
        refetch,
        setData,
    } = useQueryAction<BlockerInterface[]>(
        async () => {
            if (!sprintId) return [];
            const res = await blockersService.listHandler(sprintId, { status, type, severity, reporter, owner, per_page });
            return res.data;
        },
        [sprintId, status, type, severity, reporter, owner, per_page],
        {
            enabled: !!sprintId,
            errorFallback: blockersConstants.errors.fetchFailed,
            initialData: [],
            context: "blockers.list",
        },
    );

    const {
        data: analytics,
        refetch: refetchAnalytics,
    } = useQueryAction<BlockersAnalyticsInterface | null>(
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
        setData((prev) => {
            const arr = prev ?? [];
            const exists = arr.some((b) => b.id === blocker.id);
            return exists ? arr.map((b) => (b.id === blocker.id ? blocker : b)) : [blocker, ...arr];
        });
    }, [setData]);

    const removeBlockerLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((b) => b.id !== id));
    }, [setData]);

    return {
        blockers: blockers ?? [],
        analytics: analytics ?? null,
        isLoading,
        refetch,
        refetchAnalytics,
        patchBlockerLocal,
        removeBlockerLocal,
    };
};
