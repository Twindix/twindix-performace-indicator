import { useCallback } from "react";

import { decisionsConstants } from "@/constants";
import type { DecisionCategory, DecisionStatus } from "@/enums";
import type { DecisionInterface } from "@/interfaces";
import { decisionsService } from "@/services";

import { useQueryAction } from "../shared";

interface UseDecisionsListOptions {
    status?: DecisionStatus;
    category?: DecisionCategory;
    per_page?: number;
}

export const useDecisionsList = (sprintId: string, options: UseDecisionsListOptions = {}) => {
    const { status, category, per_page } = options;

    const { data, isLoading, refetch, setData } = useQueryAction<DecisionInterface[]>(
        async () => {
            if (!sprintId) return [];
            const res = await decisionsService.listHandler(sprintId, { status, category, per_page });
            return res.data;
        },
        [sprintId, status, category, per_page],
        {
            enabled: !!sprintId,
            errorFallback: decisionsConstants.errors.fetchFailed,
            initialData: [],
            context: "decisions.list",
        },
    );

    const patchDecisionLocal = useCallback((decision: DecisionInterface) => {
        setData((prev) => {
            const arr = prev ?? [];
            const exists = arr.some((d) => d.id === decision.id);
            return exists ? arr.map((d) => (d.id === decision.id ? decision : d)) : [decision, ...arr];
        });
    }, [setData]);

    const removeDecisionLocal = useCallback((id: string) => {
        setData((prev) => (prev ?? []).filter((d) => d.id !== id));
    }, [setData]);

    return { decisions: data ?? [], isLoading, refetch, patchDecisionLocal, removeDecisionLocal };
};
