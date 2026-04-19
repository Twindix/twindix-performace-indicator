import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants/blockers";
import type { BlockerInterface, BlockersAnalyticsInterface, BlockersContextInterface, BlockersListFiltersInterface, CreateBlockerPayloadInterface, UpdateBlockerPayloadInterface } from "@/interfaces";
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

    const fetchAnalytics = useCallback(async (): Promise<void> => {
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
        fetchAnalytics();
    }, [refetch, fetchAnalytics]);

    const fetchBlockerDetail = useCallback(async (id: string): Promise<BlockerInterface | null> => {
        try {
            const res = await blockersService.detailHandler(id);
            setBlockers((prev) => prev.map((b) => b.id === id ? res.data : b));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.fetchDetailFailed));
            return null;
        }
    }, []);

    const createBlocker = useCallback(async (payload: CreateBlockerPayloadInterface): Promise<BlockerInterface | null> => {
        if (!sprintId) return null;
        try {
            const res = await blockersService.createHandler(sprintId, payload);
            setBlockers((prev) => [...prev, res.data]);
            fetchAnalytics();
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.createFailed));
            return null;
        }
    }, [sprintId, fetchAnalytics]);

    const updateBlocker = useCallback(async (id: string, payload: UpdateBlockerPayloadInterface): Promise<BlockerInterface | null> => {
        try {
            const res = await blockersService.updateHandler(id, payload);
            setBlockers((prev) => prev.map((b) => b.id === id ? res.data : b));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.updateFailed));
            return null;
        }
    }, []);

    const resolveBlocker = useCallback(async (id: string): Promise<BlockerInterface | null> => {
        try {
            const res = await blockersService.resolveHandler(id);
            setBlockers((prev) => prev.map((b) => b.id === id ? res.data : b));
            fetchAnalytics();
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.resolveFailed));
            return null;
        }
    }, [fetchAnalytics]);

    const escalateBlocker = useCallback(async (id: string): Promise<BlockerInterface | null> => {
        try {
            const res = await blockersService.escalateHandler(id);
            setBlockers((prev) => prev.map((b) => b.id === id ? res.data : b));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.escalateFailed));
            return null;
        }
    }, []);

    const linkTasks = useCallback(async (id: string, taskIds: string[]): Promise<BlockerInterface | null> => {
        try {
            const res = await blockersService.linkTasksHandler(id, taskIds);
            setBlockers((prev) => prev.map((b) => b.id === id ? res.data : b));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.linkTasksFailed));
            return null;
        }
    }, []);

    const unlinkTask = useCallback(async (id: string, taskId: string): Promise<BlockerInterface | null> => {
        try {
            await blockersService.unlinkTaskHandler(id, taskId);
            const updated = blockers.find((b) => b.id === id);
            if (updated) {
                const next = { ...updated, taskIds: (updated.taskIds ?? []).filter((t) => t !== taskId) };
                setBlockers((prev) => prev.map((b) => b.id === id ? next : b));
                return next;
            }
            return null;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.unlinkTaskFailed));
            return null;
        }
    }, [blockers]);

    const value = useMemo<BlockersContextInterface>(() => ({
        blockers,
        analytics,
        isLoading,
        refetch,
        fetchAnalytics,
        fetchBlockerDetail,
        createBlocker,
        updateBlocker,
        resolveBlocker,
        escalateBlocker,
        linkTasks,
        unlinkTask,
    }), [blockers, analytics, isLoading, refetch, fetchAnalytics, fetchBlockerDetail, createBlocker, updateBlocker, resolveBlocker, escalateBlocker, linkTasks, unlinkTask]);

    return <BlockersContext.Provider value={value}>{children}</BlockersContext.Provider>;
};

export const useBlockers = (): BlockersContextInterface => {
    const ctx = useContext(BlockersContext);
    if (!ctx) throw new Error("useBlockers must be used within BlockersProvider");
    return ctx;
};
