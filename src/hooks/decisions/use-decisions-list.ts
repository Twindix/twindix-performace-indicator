import { useCallback } from "react";

import { decisionsConstants } from "@/constants";
import type { DecisionCategory, DecisionStatus } from "@/enums";
import type { DecisionInterface } from "@/interfaces";
import { decisionsService } from "@/services";

import { usePaginatedQuery } from "../shared";

interface UseDecisionsListOptions {
    status?: DecisionStatus;
    category?: DecisionCategory;
    initialPerPage?: number;
}

export const useDecisionsList = (sprintId: string, options: UseDecisionsListOptions = {}) => {
    const { status, category, initialPerPage } = options;

    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<DecisionInterface>(
        ({ page, per_page }) => decisionsService.listHandler(sprintId, { status, category, page, per_page }),
        [sprintId, status, category],
        {
            enabled: !!sprintId,
            errorFallback: decisionsConstants.errors.fetchFailed,
            context: "decisions.list",
            initialPerPage,
        },
    );

    const patchDecisionLocal = useCallback((decision: DecisionInterface) => {
        setItems((prev) => {
            const exists = prev.some((d) => d.id === decision.id);
            return exists ? prev.map((d) => (d.id === decision.id ? decision : d)) : [decision, ...prev];
        });
    }, [setItems]);

    const removeDecisionLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((d) => d.id !== id));
    }, [setItems]);

    return { decisions: items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, patchDecisionLocal, removeDecisionLocal };
};
