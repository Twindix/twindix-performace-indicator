import { useState } from "react";

import type {
    AlertCardBusyInterface,
    AlertInterface,
    UseAlertActionsArgsInterface,
    UseAlertActionsReturnInterface,
} from "@/interfaces";

import { useAcknowledgeAlert } from "./use-acknowledge-alert";
import { useDeleteAlert } from "./use-delete-alert";
import { useDoneAlert } from "./use-done-alert";

export const useAlertActions = ({ onPatch, onRemove }: UseAlertActionsArgsInterface): UseAlertActionsReturnInterface => {
    const [deleteTarget, setDeleteTarget] = useState<AlertInterface | null>(null);
    const [actingId, setActingId] = useState<string | null>(null);

    const { acknowledgeHandler, isLoading: isAcknowledging } = useAcknowledgeAlert();
    const { doneHandler, isLoading: isMarkingDone } = useDoneAlert();
    const { deleteHandler, isLoading: isDeleting } = useDeleteAlert();

    const acknowledge = async (id: string) => {
        setActingId(id);
        const res = await acknowledgeHandler(id);
        if (res) onPatch(res);
        setActingId(null);
    };

    const markDone = async (id: string) => {
        setActingId(id);
        const res = await doneHandler(id);
        if (res) onPatch(res);
        setActingId(null);
    };

    const requestDelete = (alert: AlertInterface) => setDeleteTarget(alert);
    const cancelDelete = () => setDeleteTarget(null);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) {
            onRemove(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const busyFor = (alertId: string): AlertCardBusyInterface => ({
        acknowledge: actingId === alertId && isAcknowledging,
        markDone: actingId === alertId && isMarkingDone,
    });

    return {
        deleteTarget,
        isDeleting,
        busyFor,
        acknowledge,
        markDone,
        requestDelete,
        cancelDelete,
        confirmDelete,
    };
};
