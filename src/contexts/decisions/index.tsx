import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants/decisions";
import type { DecisionInterface, DecisionsContextInterface, DecisionsListFiltersInterface } from "@/interfaces";
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

    const patchDecisionLocal = useCallback((decision: DecisionInterface) => {
        setDecisions((prev) => {
            const exists = prev.some((d) => d.id === decision.id);
            return exists ? prev.map((d) => d.id === decision.id ? decision : d) : [...prev, decision];
        });
    }, []);

    const removeDecisionLocal = useCallback((id: string) => {
        setDecisions((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const value = useMemo<DecisionsContextInterface>(() => ({
        decisions,
        isLoading,
        refetch,
        patchDecisionLocal,
        removeDecisionLocal,
    }), [decisions, isLoading, refetch, patchDecisionLocal, removeDecisionLocal]);

    return <DecisionsContext.Provider value={value}>{children}</DecisionsContext.Provider>;
};

export const useDecisions = (): DecisionsContextInterface => {
    const ctx = useContext(DecisionsContext);
    if (!ctx) throw new Error("useDecisions must be used within DecisionsProvider");
    return ctx;
};
