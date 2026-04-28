import { useCallback, useState } from "react";

import type { DecisionStatus } from "@/enums";
import type {
    DecisionInterface,
    UseDecisionViewActionsArgsInterface,
    UseDecisionViewActionsReturnInterface,
} from "@/interfaces/decisions";

import { useDeleteDecision } from "./use-delete-decision";
import { useGetDecision } from "./use-get-decision";
import { useUpdateDecision } from "./use-update-decision";

export const useDecisionViewActions = ({
    onPatched,
    onRemoved,
    onAfterChange,
}: UseDecisionViewActionsArgsInterface): UseDecisionViewActionsReturnInterface => {
    const { getHandler, isLoading: isLoadingDetail } = useGetDecision();
    const { updateHandler } = useUpdateDecision();
    const { deleteHandler } = useDeleteDecision();

    const [viewTarget, setViewTarget] = useState<DecisionInterface | null>(null);

    const closeView = useCallback(() => setViewTarget(null), []);

    const handleView = useCallback(async (decision: DecisionInterface) => {
        setViewTarget(decision);
        const fresh = await getHandler(decision.id);
        if (fresh) {
            onPatched(fresh);
            setViewTarget(fresh);
        }
    }, [getHandler, onPatched]);

    const handleSetStatus = useCallback(async (id: string, status: DecisionStatus) => {
        const res = await updateHandler(id, {
            status,
            decided_at: new Date().toISOString().split("T")[0],
        });
        if (res) {
            onPatched(res);
            onAfterChange();
            setViewTarget(null);
        }
    }, [updateHandler, onPatched, onAfterChange]);

    const handleDelete = useCallback(async (id: string) => {
        const ok = await deleteHandler(id);
        if (ok) {
            onRemoved(id);
            onAfterChange();
            setViewTarget(null);
        }
    }, [deleteHandler, onRemoved, onAfterChange]);

    return { viewTarget, isLoadingDetail, handleView, handleSetStatus, handleDelete, closeView };
};
