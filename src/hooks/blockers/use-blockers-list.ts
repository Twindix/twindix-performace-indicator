import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockerInterface, BlockersAnalyticsInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

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

    const [blockers, setBlockers] = useState<BlockerInterface[]>([]);
    const [analytics, setAnalytics] = useState<BlockersAnalyticsInterface | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!sprintId) { setBlockers([]); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await blockersService.listHandler(sprintId, { status, type, severity, reporter, owner, per_page });
            setBlockers(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId, status, type, severity, reporter, owner, per_page]);

    const refetchAnalytics = useCallback(async () => {
        if (!sprintId) { setAnalytics(null); return; }
        try {
            const res = await blockersService.analyticsHandler(sprintId);
            setAnalytics(res);
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.analyticsFailed));
        }
    }, [sprintId]);

    useEffect(() => { refetch(); }, [refetch]);
    useEffect(() => { refetchAnalytics(); }, [refetchAnalytics]);

    const patchBlockerLocal = useCallback((blocker: BlockerInterface) => {
        setBlockers((prev) => {
            const exists = prev.some((b) => b.id === blocker.id);
            return exists ? prev.map((b) => b.id === blocker.id ? blocker : b) : [blocker, ...prev];
        });
    }, []);

    const removeBlockerLocal = useCallback((id: string) => {
        setBlockers((prev) => prev.filter((b) => b.id !== id));
    }, []);

    return { blockers, analytics, isLoading, refetch, refetchAnalytics, patchBlockerLocal, removeBlockerLocal };
};
