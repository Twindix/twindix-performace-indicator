import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { decisionsConstants } from "@/constants";
import type { DecisionCategory, DecisionStatus } from "@/enums";
import type { DecisionInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { decisionsService } from "@/services";

interface UseDecisionsListOptions {
    status?: DecisionStatus;
    category?: DecisionCategory;
    per_page?: number;
}

export const useDecisionsList = (sprintId: string, options: UseDecisionsListOptions = {}) => {
    const { status, category, per_page } = options;

    const [decisions, setDecisions] = useState<DecisionInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!sprintId) { setDecisions([]); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const res = await decisionsService.listHandler(sprintId, { status, category, per_page });
            setDecisions(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, decisionsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, [sprintId, status, category, per_page]);

    useEffect(() => { fetch(); }, [fetch]);

    const patchDecisionLocal = useCallback((decision: DecisionInterface) => {
        setDecisions((prev) => {
            const exists = prev.some((d) => d.id === decision.id);
            return exists ? prev.map((d) => d.id === decision.id ? decision : d) : [decision, ...prev];
        });
    }, []);

    const removeDecisionLocal = useCallback((id: string) => {
        setDecisions((prev) => prev.filter((d) => d.id !== id));
    }, []);

    return { decisions, isLoading, refetch: fetch, patchDecisionLocal, removeDecisionLocal };
};
