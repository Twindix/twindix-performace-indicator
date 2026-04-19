import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants/decisions";
import type { CreateDecisionPayloadInterface, DecisionInterface, DecisionsContextInterface, DecisionsListFiltersInterface, UpdateDecisionPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

const DecisionsContext = createContext<DecisionsContextInterface | null>(null);

export const DecisionsProvider = ({ sprintId, children }: { sprintId: string | null | undefined; children: ReactNode }) => {
    const [decisions, setDecisions] = useState<DecisionInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (filters?: DecisionsListFiltersInterface): Promise<void> => {
        if (!sprintId) { setDecisions([]); return; }
        setIsLoading(true);
        try {
            const res = await decisionsService.listHandler(sprintId, filters);
            setDecisions(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId]);

    useEffect(() => { refetch(); }, [refetch]);

    const fetchDecisionDetail = useCallback(async (id: string): Promise<DecisionInterface | null> => {
        try {
            const res = await decisionsService.detailHandler(id);
            setDecisions((prev) => prev.map((d) => d.id === id ? res.data : d));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.fetchDetailFailed));
            return null;
        }
    }, []);

    const createDecision = useCallback(async (payload: CreateDecisionPayloadInterface): Promise<DecisionInterface | null> => {
        if (!sprintId) return null;
        try {
            const res = await decisionsService.createHandler(sprintId, payload);
            setDecisions((prev) => [...prev, res.data]);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.createFailed));
            return null;
        }
    }, [sprintId]);

    const updateDecision = useCallback(async (id: string, payload: UpdateDecisionPayloadInterface): Promise<DecisionInterface | null> => {
        try {
            const res = await decisionsService.updateHandler(id, payload);
            setDecisions((prev) => prev.map((d) => d.id === id ? res.data : d));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.updateFailed));
            return null;
        }
    }, []);

    const deleteDecision = useCallback(async (id: string): Promise<boolean> => {
        try {
            await decisionsService.deleteHandler(id);
            setDecisions((prev) => prev.filter((d) => d.id !== id));
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.deleteFailed));
            return false;
        }
    }, []);

    const value = useMemo<DecisionsContextInterface>(() => ({
        decisions,
        isLoading,
        refetch,
        fetchDecisionDetail,
        createDecision,
        updateDecision,
        deleteDecision,
    }), [decisions, isLoading, refetch, fetchDecisionDetail, createDecision, updateDecision, deleteDecision]);

    return <DecisionsContext.Provider value={value}>{children}</DecisionsContext.Provider>;
};

export const useDecisions = (): DecisionsContextInterface => {
    const ctx = useContext(DecisionsContext);
    if (!ctx) throw new Error("useDecisions must be used within DecisionsProvider");
    return ctx;
};
