import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants/blockers";
import type { BlockerInterface, BlockersAnalyticsInterface, BlockersContextInterface, BlockersListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

const BlockersContext = createContext<BlockersContextInterface | null>(null);

export const BlockersProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [blockers, setBlockers] = useState<BlockerInterface[]>([]);
    const [analytics, setAnalytics] = useState<BlockersAnalyticsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (filters?: BlockersListFiltersInterface): Promise<void> => {
        if (!sprintId) { setBlockers([]); return; }
        setIsLoading(true);
        try {
            const res = await blockersService.listHandler(sprintId, filters);
            setBlockers(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    const refetchAnalytics = useCallback(async (): Promise<void> => {
        if (!sprintId) { setAnalytics(null); return; }
        try {
            const res = await blockersService.analyticsHandler(sprintId);
            setAnalytics(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.analyticsFailed));
        }
    }, [sprintId]);

    useEffect(() => {
        refetch();
        refetchAnalytics();
    }, [refetch, refetchAnalytics]);

    const patchBlockerLocal = useCallback((blocker: BlockerInterface) => {
        setBlockers((prev) => {
            const exists = prev.some((b) => b.id === blocker.id);
            return exists ? prev.map((b) => b.id === blocker.id ? blocker : b) : [...prev, blocker];
        });
    }, []);

    const removeBlockerLocal = useCallback((id: string) => {
        setBlockers((prev) => prev.filter((b) => b.id !== id));
    }, []);

    const value = useMemo<BlockersContextInterface>(() => ({
        blockers,
        analytics,
        isLoading,
        refetch,
        refetchAnalytics,
        patchBlockerLocal,
        removeBlockerLocal,
    }), [blockers, analytics, isLoading, refetch, refetchAnalytics, patchBlockerLocal, removeBlockerLocal]);

    return <BlockersContext.Provider value={value}>{children}</BlockersContext.Provider>;
};

export const useBlockers = (): BlockersContextInterface => {
    const ctx = useContext(BlockersContext);
    if (!ctx) throw new Error("useBlockers must be used within BlockersProvider");
    return ctx;
};
